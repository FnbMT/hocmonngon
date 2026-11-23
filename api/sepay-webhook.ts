import type { IncomingMessage, ServerResponse } from 'http';
import * as admin from 'firebase-admin';

interface SePayWebhookBody {
  id?: number | string;
  gateway?: string;
  transactionDate?: string;
  accountNumber?: string;
  code?: string | null;
  content?: string;
  transferType?: 'in' | 'out';
  transferAmount?: number;
  accumulated?: number;
  subAccount?: string | null;
  referenceCode?: string;
  description?: string;
}

/**
 * Khởi tạo Firebase Admin SDK an toàn cho Vercel Serverless Function
 */
function getFirebaseAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Xử lý xuống dòng trong chuỗi Private Key khi truyền qua biến môi trường Vercel
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    try {
      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (err) {
      console.error('[Firebase Admin Init Error]:', err);
    }
  } else {
    console.warn(
      '[Firebase Admin Warning]: Thiếu biến môi trường FIREBASE_CLIENT_EMAIL hoặc FIREBASE_PRIVATE_KEY trên Vercel.'
    );
  }

  return null;
}

/**
 * Vercel Serverless Function: Xử lý Webhook thanh toán tự động từ SePay.vn
 * Endpoint URL: https://<domain>.vercel.app/api/sepay-webhook
 */
export default async function handler(req: any, res: any) {
  // Cấu hình CORS an toàn
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 1. Kiểm tra trạng thái hoạt động (Ping Health-Check từ SePay hoặc trình duyệt)
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'Hoc Mon Ngon SePay Webhook Engine',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // 2. XÁC THỰC BẢO MẬT: Kiểm tra Webhook Token / API Key
    const configuredToken = (process.env.SEPAY_WEBHOOK_TOKEN || process.env.SEPAY_API_KEY || '').trim();
    if (configuredToken) {
      const authHeader = (req.headers['authorization'] || req.headers['x-api-key'] || '').toString();
      const queryToken = (req.query?.token || '').toString();
      
      const isAuthorized =
        authHeader.includes(configuredToken) ||
        authHeader.endsWith(configuredToken) ||
        queryToken === configuredToken;

      if (!isAuthorized) {
        console.warn('[SePay Webhook Unauthorized]: Token không khớp. Header nhận được:', authHeader);
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Sai mã Webhook Token hoặc API Key của SePay',
        });
      }
    }

    const body: SePayWebhookBody = req.body || {};
    const transferAmount = Number(body.transferAmount || 0);
    const rawContent = (body.content || body.description || '').trim();
    const gateway = body.gateway || 'Bank';
    const referenceCode = body.referenceCode || `SP-${Date.now()}`;
    const txDate = body.transactionDate || new Date().toISOString().replace('T', ' ').slice(0, 19);

    console.log(
      `[SePay Webhook Received] Số tiền: ${transferAmount}đ | Nội dung: "${rawContent}" | Cổng: ${gateway}`
    );

    // Bỏ qua các giao dịch rút tiền hoặc số tiền <= 0
    if (body.transferType === 'out' || transferAmount <= 0) {
      return res.status(200).json({
        success: true,
        message: 'Giao dịch không phải tiền vào, đã bỏ qua.',
      });
    }

    // 3. Chuẩn hóa nội dung chuyển khoản: Không dấu, viết hoa, loại bỏ ký tự lạ
    const normalizedContent = rawContent
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ');

    // 4. Trích xuất số điện thoại học viên từ nội dung
    const phoneMatch = normalizedContent.match(/(0[3|5|7|8|9][0-9]{8})/);
    const extractedPhone = phoneMatch ? phoneMatch[0] : '';

    // Khởi tạo Firestore Admin
    const app = getFirebaseAdminApp();
    if (!app) {
      console.warn('[SePay Webhook]: Firebase Admin SDK chưa được cấu hình. Ghi nhận giao dịch mô phỏng.');
      return res.status(200).json({
        success: true,
        message: 'Webhook nhận thành công (Chờ cấu hình Firebase Service Account trên Vercel)',
        data: { transferAmount, content: rawContent, extractedPhone },
      });
    }

    const db = admin.firestore();

    // 5. Đọc toàn bộ danh sách khóa học để tìm khóa học khớp cú pháp
    const coursesSnap = await db.collection('courses').get();
    let matchedCourse: any = null;

    coursesSnap.forEach((doc) => {
      const c = doc.data();
      const syntax = (c.transferSyntax || '').trim().toUpperCase();
      if (syntax && syntax.length >= 3 && normalizedContent.includes(syntax)) {
        matchedCourse = { id: doc.id, ...c };
      }
    });

    // Fallback: Tìm theo slug hoặc ID khóa học nếu cú pháp không khớp trực tiếp
    if (!matchedCourse) {
      coursesSnap.forEach((doc) => {
        const c = doc.data();
        const idKeyword = doc.id.replace('course-', '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        if (idKeyword.length >= 4 && normalizedContent.includes(idKeyword)) {
          matchedCourse = { id: doc.id, ...c };
        }
      });
    }

    // 6. Trường hợp không nhận diện được khóa học
    if (!matchedCourse) {
      const unmatchedTxId = `sepay-${body.id || Date.now()}`;
      await db.collection('transactions').doc(unmatchedTxId).set({
        id: unmatchedTxId,
        gateway,
        transactionDate: txDate,
        accountNumber: body.accountNumber || '',
        code: body.code || null,
        content: rawContent,
        transferAmount,
        referenceCode,
        studentPhone: extractedPhone || null,
        status: 'unmatched',
        message: 'Nội dung chuyển khoản không chứa cú pháp hợp lệ của bất kỳ khóa học nào.',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        rawPayload: JSON.stringify(body),
      });

      console.warn(`[SePay Webhook Unmatched]: Nội dung "${rawContent}" không khớp khóa học nào.`);
      return res.status(200).json({
        success: true,
        status: 'unmatched',
        message: 'Giao dịch đã được ghi nhận vào hàng đợi đối soát (Chưa khớp cú pháp khóa học).',
      });
    }

    // 7. Kiểm tra số tiền chuyển khoản
    const expectedPrice = Number(matchedCourse.discountPrice || matchedCourse.originalPrice || 0);
    const minAcceptable = Math.max(0, Math.floor(expectedPrice * 0.9)); // Cho phép dung sai 10% nếu có voucher

    if (transferAmount < minAcceptable && transferAmount < expectedPrice - 100000) {
      const invalidAmountTxId = `sepay-${body.id || Date.now()}`;
      await db.collection('transactions').doc(invalidAmountTxId).set({
        id: invalidAmountTxId,
        gateway,
        transactionDate: txDate,
        accountNumber: body.accountNumber || '',
        code: body.code || null,
        content: rawContent,
        transferAmount,
        referenceCode,
        courseId: matchedCourse.id,
        courseTitle: matchedCourse.title,
        studentPhone: extractedPhone || null,
        status: 'invalid_amount',
        message: `Số tiền chuyển (${transferAmount}đ) thấp hơn giá khóa học (${expectedPrice}đ).`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        rawPayload: JSON.stringify(body),
      });

      console.warn(`[SePay Webhook Invalid Amount]: Chuyển ${transferAmount}đ / Giá khóa học ${expectedPrice}đ.`);
      return res.status(200).json({
        success: true,
        status: 'invalid_amount',
        message: 'Số tiền chuyển không đủ theo giá khóa học.',
      });
    }

    // 8. Tìm hoặc tạo hồ sơ học viên (students)
    let studentId = '';
    let studentName = `Học viên ${extractedPhone ? extractedPhone.slice(-4) : 'Mới'}`;

    if (extractedPhone) {
      const studentQuery = await db
        .collection('students')
        .where('phone', '==', extractedPhone)
        .limit(1)
        .get();

      if (!studentQuery.empty) {
        const studentDoc = studentQuery.docs[0];
        studentId = studentDoc.id;
        studentName = studentDoc.data().name || studentName;
      } else {
        const newStudentDoc = db.collection('students').doc();
        studentId = newStudentDoc.id;
        await newStudentDoc.set({
          id: studentId,
          name: studentName,
          phone: extractedPhone,
          email: `${extractedPhone}@hocmonngon.vn`,
          role: 'student',
          registeredAt: new Date().toISOString().split('T')[0],
          goal: `Tự động kích hoạt qua SePay: ${matchedCourse.title.split(' - ')[0]}`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    } else {
      studentId = `student-auto-${Date.now()}`;
      await db.collection('students').doc(studentId).set({
        id: studentId,
        name: studentName,
        email: `student-${studentId.slice(-6)}@hocmonngon.vn`,
        phone: '',
        role: 'student',
        registeredAt: new Date().toISOString().split('T')[0],
        goal: `Tự động kích hoạt qua SePay: ${matchedCourse.title.split(' - ')[0]}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // 9. Tự động kích hoạt khóa học cho học viên (enrollments)
    // Đặt ID là `enr_${studentId}_${matchedCourse.id}` để tránh kích hoạt trùng lặp (Idempotent)
    const enrollmentId = `enr_${studentId}_${matchedCourse.id}`;
    const enrollmentRef = db.collection('enrollments').doc(enrollmentId);
    const existingEnrollment = await enrollmentRef.get();

    const enrollmentData = {
      id: enrollmentId,
      studentId,
      courseId: matchedCourse.id,
      courseTitle: matchedCourse.title,
      instructorName: matchedCourse.instructorName || '',
      thumbnail: matchedCourse.thumbnail || '',
      enrolledAt: new Date().toISOString().split('T')[0],
      type: 'paid',
      pricePaid: transferAmount,
      completedLessonIds: existingEnrollment.exists ? (existingEnrollment.data()?.completedLessonIds || []) : [],
      lastActiveAt: 'Vừa kích hoạt tự động',
      status: 'active',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await enrollmentRef.set(enrollmentData, { merge: true });

    // Cập nhật số lượng học viên (+1) cho khóa học
    await db.collection('courses').doc(matchedCourse.id).update({
      studentCount: admin.firestore.FieldValue.increment(1),
    }).catch(() => {});

    // 10. Ghi nhận giao dịch thành công (transactions)
    const successTxId = `sepay-${body.id || Date.now()}`;
    await db.collection('transactions').doc(successTxId).set({
      id: successTxId,
      gateway,
      transactionDate: txDate,
      accountNumber: body.accountNumber || '',
      code: body.code || null,
      content: rawContent,
      transferType: 'in',
      transferAmount,
      referenceCode,
      courseId: matchedCourse.id,
      courseTitle: matchedCourse.title,
      studentPhone: extractedPhone || null,
      studentName,
      status: 'success',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      rawPayload: JSON.stringify(body),
    });

    console.log(
      `[SePay Webhook Success]: Kích hoạt thành công khóa "${matchedCourse.title}" cho học viên ${studentName} (${extractedPhone})!`
    );

    return res.status(200).json({
      success: true,
      message: `Thanh toán thành công! Khóa học "${matchedCourse.title}" đã được kích hoạt tự động.`,
      data: {
        transactionId: successTxId,
        courseId: matchedCourse.id,
        courseTitle: matchedCourse.title,
        studentPhone: extractedPhone,
        studentName,
      },
    });
  } catch (err: any) {
    console.error('[SePay Webhook Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Lỗi xử lý nội bộ tại Webhook Server',
    });
  }
}
