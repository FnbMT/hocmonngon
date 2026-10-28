import { BankOption, PaymentBankConfig, SePayConfig, SePayTransaction, Course, Student } from '../types';
import { StorageService } from './storage';

export const POPULAR_VIETNAM_BANKS: BankOption[] = [
  { bin: '970422', shortName: 'MB', name: 'MBBank - Ngân hàng Quân Đội', code: 'MBBank' },
  { bin: '970436', shortName: 'VCB', name: 'Vietcombank - Ngoại Thương Việt Nam', code: 'Vietcombank' },
  { bin: '970407', shortName: 'TCB', name: 'Techcombank - Kỹ Thương Việt Nam', code: 'Techcombank' },
  { bin: '970416', shortName: 'ACB', name: 'ACB - Á Châu', code: 'ACB' },
  { bin: '970415', shortName: 'CTG', name: 'VietinBank - Công Thương Việt Nam', code: 'VietinBank' },
  { bin: '970418', shortName: 'BIDV', name: 'BIDV - Đầu tư & Phát triển Việt Nam', code: 'BIDV' },
  { bin: '970423', shortName: 'TPB', name: 'TPBank - Tiên Phong', code: 'TPBank' },
  { bin: '970432', shortName: 'VPB', name: 'VPBank - Việt Nam Thịnh Vượng', code: 'VPBank' },
  { bin: '970403', shortName: 'STB', name: 'Sacombank - Sài Gòn Thương Tín', code: 'Sacombank' },
  { bin: '970441', shortName: 'VIB', name: 'VIB - Quốc Tế Việt Nam', code: 'VIB' },
  { bin: '970448', shortName: 'OCB', name: 'OCB - Phương Đông', code: 'OCB' },
  { bin: '970443', shortName: 'SHB', name: 'SHB - Sài Gòn Hà Nội', code: 'SHB' },
  { bin: '970424', shortName: 'SEAB', name: 'SeABank - Đông Nam Á', code: 'SeABank' },
  { bin: '970454', shortName: 'VCCB', name: 'BVBank - Bản Việt', code: 'BVBank' },
  { bin: '970426', shortName: 'MSB', name: 'MSB - Hàng Hải Việt Nam', code: 'MSB' },
  { bin: '970437', shortName: 'HDB', name: 'HDBank - Phát triển TP.HCM', code: 'HDBank' },
  { bin: '970431', shortName: 'EIB', name: 'Eximbank - Xuất Nhập Khẩu', code: 'Eximbank' }
];

const KEYS = {
  BANK_CONFIG: 'hocmonngon_bank_config_v1',
  SEPAY_CONFIG: 'hocmonngon_sepay_config_v1',
  TRANSACTIONS: 'hocmonngon_sepay_transactions_v1'
};

export const DEFAULT_BANK_CONFIG: PaymentBankConfig = {
  bankName: 'MBBank - Ngân hàng Quân Đội',
  bankShortName: 'MB',
  bankBin: '970422',
  accountNumber: '09123456789',
  accountHolderName: 'CONG TY HOC MON NGON',
  branch: 'Hà Nội',
  qrTemplate: 'compact2'
};

export const DEFAULT_SEPAY_CONFIG: SePayConfig = {
  isEnabled: true,
  apiKey: 'SEPAY_API_KEY_DEMO_2026',
  webhookToken: 'sepay_wh_token_hmn88',
  globalPrefix: 'HMN',
  autoEnrollEnabled: true,
  webhookUrl: typeof window !== 'undefined' ? `${window.location.origin}/api/sepay-webhook` : 'https://hocmonngon.vn/api/sepay-webhook'
};

const DEFAULT_COURSE_SYNTAX: Record<string, string> = {
  'course-pho-bo-truyen-thong': 'PHOBO',
  'course-sup-luon-xu-nghe': 'SUPLUON',
  'course-bun-bo-hue': 'BUNBO',
  'course-com-tam-suon-nuong': 'COMTAM',
  'course-croissant-ngan-lop': 'CROISSANT',
  'course-banh-bento-kem-cheese': 'BENTO',
  'course-banh-mi-hoa-cuc': 'HOACUC',
  'course-dimsum-ha-cao': 'DIMSUM',
  'course-nuoc-lau-doc-quyen': 'NUOCLAU',
  'course-mon-nhau-sot-bbq': 'MONNHAU'
};

export const PaymentService = {
  getBankConfig(): PaymentBankConfig {
    try {
      const raw = localStorage.getItem(KEYS.BANK_CONFIG);
      if (!raw) return DEFAULT_BANK_CONFIG;
      return { ...DEFAULT_BANK_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_BANK_CONFIG;
    }
  },

  saveBankConfig(config: PaymentBankConfig): void {
    try {
      localStorage.setItem(KEYS.BANK_CONFIG, JSON.stringify(config));
      window.dispatchEvent(new Event('payment_config_updated'));
      import('./firebase').then(({ FirebaseService }) => {
        if (FirebaseService.isConfigured()) {
          FirebaseService.syncPaymentConfigToFirebase(config, PaymentService.getSePayConfig()).catch(() => {});
        }
      }).catch(() => {});
    } catch (e) {
      console.error('Error saving bank config:', e);
    }
  },

  getSePayConfig(): SePayConfig {
    try {
      const raw = localStorage.getItem(KEYS.SEPAY_CONFIG);
      const hostUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/sepay-webhook` : 'https://hocmonngon.vn/api/sepay-webhook';
      if (!raw) {
        return {
          ...DEFAULT_SEPAY_CONFIG,
          webhookUrl: hostUrl
        };
      }
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SEPAY_CONFIG,
        ...parsed,
        webhookUrl: parsed.webhookUrl || hostUrl
      };
    } catch {
      return DEFAULT_SEPAY_CONFIG;
    }
  },

  saveSePayConfig(config: SePayConfig): void {
    try {
      localStorage.setItem(KEYS.SEPAY_CONFIG, JSON.stringify(config));
      window.dispatchEvent(new Event('payment_config_updated'));
      import('./firebase').then(({ FirebaseService }) => {
        if (FirebaseService.isConfigured()) {
          FirebaseService.syncPaymentConfigToFirebase(PaymentService.getBankConfig(), config).catch(() => {});
        }
      }).catch(() => {});
    } catch (e) {
      console.error('Error saving sepay config:', e);
    }
  },

  getTransactions(): SePayTransaction[] {
    try {
      const raw = localStorage.getItem(KEYS.TRANSACTIONS);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveTransaction(tx: SePayTransaction): void {
    try {
      const list = this.getTransactions();
      list.unshift(tx);
      // Keep maximum 200 recent transactions
      const trimmed = list.slice(0, 200);
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(trimmed));
      window.dispatchEvent(new Event('sepay_transactions_updated'));
    } catch (e) {
      console.error('Error saving transaction:', e);
    }
  },

  clearTransactions(): void {
    try {
      localStorage.removeItem(KEYS.TRANSACTIONS);
      window.dispatchEvent(new Event('sepay_transactions_updated'));
    } catch (e) {
      console.error('Error clearing transactions:', e);
    }
  },

  /**
   * Helper to get or generate the unique transfer code for a course
   */
  getCourseTransferSyntax(course: Course): string {
    if (course.transferSyntax && course.transferSyntax.trim()) {
      return course.transferSyntax.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    }
    if (DEFAULT_COURSE_SYNTAX[course.id]) {
      return DEFAULT_COURSE_SYNTAX[course.id];
    }
    // Auto generate from slug or id
    if (course.slug) {
      const cleanSlug = course.slug
        .replace(/mo-quan|truyen-thong|doc-quyen|kinh-doanh|chuyen-nghiep/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();
      if (cleanSlug.length >= 3) return cleanSlug.slice(0, 8);
    }
    return `KHOA${course.id.slice(-4).toUpperCase()}`;
  },

  /**
   * Generates the transfer memo expected on banking apps:
   * e.g. "HMN PHOBO 0901234567"
   */
  generateCourseTransferMemo(course: Course, phone?: string): string {
    const sepayConfig = this.getSePayConfig();
    const prefix = sepayConfig.globalPrefix?.trim().toUpperCase() || 'HMN';
    const syntax = this.getCourseTransferSyntax(course);
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    return `${prefix} ${syntax} ${cleanPhone}`.trim();
  },

  /**
   * Generate dynamic VietQR image URL
   */
  getVietQRImageUrl(params: {
    bankBin?: string;
    accountNumber?: string;
    accountName?: string;
    amount: number;
    memo: string;
    template?: string;
  }): string {
    const bank = this.getBankConfig();
    const bin = params.bankBin || bank.bankBin || '970422';
    const acc = params.accountNumber || bank.accountNumber || '09123456789';
    const name = encodeURIComponent(params.accountName || bank.accountHolderName || 'CONG TY HOC MON NGON');
    const memo = encodeURIComponent(params.memo);
    const amount = Math.max(0, Math.round(params.amount));
    const tmpl = params.template || bank.qrTemplate || 'compact2';

    return `https://img.vietqr.io/image/${bin}-${acc}-${tmpl}.png?amount=${amount}&addInfo=${memo}&accountName=${name}`;
  },

  /**
   * Generate SePay QR image URL
   */
  getSePayQRImageUrl(params: {
    bankShortName?: string;
    accountNumber?: string;
    amount: number;
    memo: string;
    template?: string;
  }): string {
    const bank = this.getBankConfig();
    const shortName = params.bankShortName || bank.bankShortName || 'MB';
    const acc = params.accountNumber || bank.accountNumber || '09123456789';
    const amount = Math.max(0, Math.round(params.amount));
    const memo = encodeURIComponent(params.memo);
    const tmpl = params.template || bank.qrTemplate || 'compact';

    return `https://qr.sepay.vn/img?bank=${shortName}&acc=${acc}&template=${tmpl}&amount=${amount}&des=${memo}`;
  },

  /**
   * Core Webhook Processing Engine:
   * Parses SePay webhook payload, identifies course via distinct syntax, identifies student by phone,
   * verifies amount, enrolls student, and logs transaction.
   */
  processSePayWebhook(payload: {
    id?: number | string;
    gateway?: string;
    transactionDate?: string;
    accountNumber?: string;
    code?: string;
    content?: string;
    transferType?: 'in' | 'out';
    transferAmount?: number;
    accumulated?: number;
    referenceCode?: string;
    description?: string;
  }): {
    success: boolean;
    message: string;
    transaction: SePayTransaction;
    matchedCourse?: Course;
    student?: Student;
  } {
    const sepayConfig = this.getSePayConfig();
    const courses = StorageService.getCourses();
    const students = StorageService.getStudents();

    const rawContent = (payload.content || payload.description || '').trim();
    // Normalize string: uppercase, remove accents
    const normalizedContent = rawContent
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ');

    const transferAmount = Number(payload.transferAmount || 0);
    const gateway = payload.gateway || 'BankTransfer';
    const txDate = payload.transactionDate || new Date().toISOString().replace('T', ' ').slice(0, 19);

    // 1. Identify matched course
    let matchedCourse: Course | undefined;
    for (const c of courses) {
      const syntax = this.getCourseTransferSyntax(c);
      if (syntax && normalizedContent.includes(syntax)) {
        matchedCourse = c;
        break;
      }
    }

    // Fallback: check course id or slug if syntax not directly matched
    if (!matchedCourse) {
      for (const c of courses) {
        const idKeyword = c.id.replace('course-', '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        if (idKeyword.length >= 4 && normalizedContent.includes(idKeyword)) {
          matchedCourse = c;
          break;
        }
      }
    }

    // 2. Extract phone number
    const phoneMatch = normalizedContent.match(/(0[3|5|7|8|9][0-9]{8})/);
    const extractedPhone = phoneMatch ? phoneMatch[0] : '';

    // 3. Find or create student
    let student: Student | undefined;
    if (extractedPhone) {
      student = students.find(s => s.phone.replace(/[\s.-]/g, '') === extractedPhone);
      if (!student) {
        student = {
          id: `student-sp-${Date.now()}`,
          name: `Học viên ${extractedPhone.slice(-4)}`,
          email: `${extractedPhone}@hocmonngon.vn`,
          phone: extractedPhone,
          role: 'student',
          registeredAt: new Date().toISOString().split('T')[0],
          goal: matchedCourse ? `Học khóa ${matchedCourse.title.split(' - ')[0]}` : 'Khởi nghiệp kinh doanh món ăn'
        };
        StorageService.addStudent(student);
      }
    }

    // Check status
    let status: SePayTransaction['status'] = 'pending';
    let message = '';

    if (!matchedCourse) {
      status = 'unmatched';
      message = 'Nội dung chuyển khoản không chứa cú pháp hợp lệ của bất kỳ khóa học nào.';
    } else if (transferAmount <= 0) {
      status = 'invalid_amount';
      message = 'Số tiền chuyển khoản không hợp lệ (nhỏ hơn hoặc bằng 0).';
    } else {
      // Check price matching: accept if payment is at least 90% of price (or reasonable threshold)
      const expectedPrice = matchedCourse.discountPrice;
      const minAcceptable = Math.floor(expectedPrice * 0.9);

      if (transferAmount < minAcceptable && transferAmount < expectedPrice - 100000) {
        status = 'invalid_amount';
        message = `Số tiền chuyển ${new Intl.NumberFormat('vi-VN').format(transferAmount)}đ thấp hơn giá khóa học (${new Intl.NumberFormat('vi-VN').format(expectedPrice)}đ).`;
      } else {
        status = 'success';
        message = `Thanh toán thành công! Khóa học "${matchedCourse.title.split(' - ')[0]}" đã được kích hoạt.`;

        // Automatically enroll if enabled
        if (sepayConfig.autoEnrollEnabled && student) {
          StorageService.enrollStudent({
            studentId: student.id,
            courseId: matchedCourse.id,
            type: 'paid',
            price: transferAmount
          });
        }
      }
    }

    const tx: SePayTransaction = {
      id: `sepay-${payload.id || Date.now()}`,
      gateway,
      transactionDate: txDate,
      accountNumber: payload.accountNumber || '',
      code: payload.code,
      content: rawContent,
      transferType: payload.transferType || 'in',
      transferAmount,
      referenceCode: payload.referenceCode || `SP-${Date.now().toString().slice(-6)}`,
      courseId: matchedCourse?.id,
      courseTitle: matchedCourse?.title,
      studentPhone: extractedPhone || undefined,
      studentName: student?.name,
      status,
      createdAt: new Date().toISOString(),
      rawPayload: JSON.stringify(payload)
    };

    this.saveTransaction(tx);

    // Dispatch custom browser event so any active CheckoutPage or Dashboard updates live
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('sepay_payment_received', {
          detail: {
            transaction: tx,
            course: matchedCourse,
            student
          }
        })
      );
    }

    return {
      success: status === 'success',
      message,
      transaction: tx,
      matchedCourse,
      student
    };
  },

  /**
   * Simulate a SePay webhook directly for testing
   */
  simulateWebhook(params: {
    courseId: string;
    phone: string;
    amount?: number;
    gateway?: string;
  }): {
    success: boolean;
    message: string;
    transaction: SePayTransaction;
  } {
    const course = StorageService.getCourseById(params.courseId);
    if (!course) {
      throw new Error('Khóa học không tồn tại');
    }

    const memo = this.generateCourseTransferMemo(course, params.phone);
    const amount = params.amount || course.discountPrice;
    const bank = this.getBankConfig();

    const payload = {
      id: Math.floor(Math.random() * 900000) + 100000,
      gateway: params.gateway || bank.bankShortName || 'MBBank',
      transactionDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
      accountNumber: bank.accountNumber,
      content: memo,
      transferType: 'in' as const,
      transferAmount: amount,
      referenceCode: `SIM${Date.now().toString().slice(-6)}`,
      description: `Thanh toan tu dong ${course.title.slice(0, 25)}`
    };

    return this.processSePayWebhook(payload);
  }
};
