import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  setDoc, 
  doc, 
  getDoc,
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  writeBatch 
} from 'firebase/firestore';
import { StorageService } from './storage';
import { Student, Instructor, Course, Enrollment, HomepageConfig, PaymentBankConfig, SePayConfig } from '../types';

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

/**
 * Sanitizes object data for Firestore by removing any `undefined` values.
 * Firestore setDoc/updateDoc strictly rejects `undefined` at any nested level.
 */
function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) return data;
  return JSON.parse(
    JSON.stringify(data, (_key, value) => {
      if (value === undefined) return undefined;
      return value;
    })
  );
}

export const FirebaseService = {
  isConfigured(): boolean {
    const envKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const config = StorageService.getFirebaseConfig();
    return Boolean((config.apiKey && config.projectId) || (envKey && import.meta.env.VITE_FIREBASE_PROJECT_ID));
  },

  init(): { success: boolean; error?: string } {
    try {
      const config = StorageService.getFirebaseConfig();
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || config.apiKey;
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || config.projectId;
      const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || config.authDomain || (projectId ? `${projectId}.firebaseapp.com` : '');
      const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || config.storageBucket || (projectId ? `${projectId}.appspot.com` : '');
      const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || config.messagingSenderId || '';
      const appId = import.meta.env.VITE_FIREBASE_APP_ID || config.appId || '';

      if (!apiKey || !projectId) {
        return { success: false, error: 'Chưa điền Firebase API Key và Project ID' };
      }

      // Re-initialize if config changed or not yet initialized
      if (getApps().length === 0) {
        appInstance = initializeApp({
          apiKey: apiKey.trim(),
          authDomain: authDomain.trim(),
          projectId: projectId.trim(),
          storageBucket: storageBucket.trim(),
          messagingSenderId: messagingSenderId.trim(),
          appId: appId.trim()
        });
      } else {
        appInstance = getApps()[0];
      }

      dbInstance = getFirestore(appInstance);
      return { success: true };
    } catch (err: unknown) {
      console.warn('Firebase init error:', err);
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  },

  getDb(): Firestore | null {
    if (!dbInstance) {
      const initRes = this.init();
      if (!initRes.success) return null;
    }
    return dbInstance;
  },

  // ==========================================
  // INSTRUCTOR FIRESTORE OPERATIONS
  // ==========================================
  async saveInstructor(instructor: Instructor): Promise<boolean> {
    try {
      if (!this.isConfigured()) return false;
      const db = this.getDb();
      if (!db) return false;
      const ref = doc(db, 'instructors', instructor.id);
      const cleanData = sanitizeForFirestore(instructor);
      await setDoc(ref, cleanData, { merge: true });
      return true;
    } catch (e) {
      console.warn('Cannot save instructor to Firestore:', e);
      return false;
    }
  },

  async deleteInstructor(instructorId: string): Promise<{ success: boolean; deletedCourses: number }> {
    try {
      if (!this.isConfigured()) return { success: false, deletedCourses: 0 };
      const db = this.getDb();
      if (!db) return { success: false, deletedCourses: 0 };

      // 1. Delete instructor doc from Firestore
      await deleteDoc(doc(db, 'instructors', instructorId));

      // 2. Cascade delete all courses belonging to this instructor in Firestore
      let deletedCoursesCount = 0;
      try {
        const q = query(collection(db, 'courses'), where('instructorId', '==', instructorId));
        const courseSnap = await getDocs(q);
        const batch = writeBatch(db);
        courseSnap.forEach(d => {
          batch.delete(d.ref);
          deletedCoursesCount++;
        });
        if (deletedCoursesCount > 0) {
          await batch.commit();
        }
      } catch (err) {
        console.warn('Error cascade deleting courses from Firestore:', err);
      }

      return { success: true, deletedCourses: deletedCoursesCount };
    } catch (e) {
      console.warn('Cannot delete instructor from Firestore:', e);
      return { success: false, deletedCourses: 0 };
    }
  },

  // ==========================================
  // COURSE FIRESTORE OPERATIONS
  // ==========================================
  async saveCourse(course: Course): Promise<boolean> {
    try {
      if (!this.isConfigured()) return false;
      const db = this.getDb();
      if (!db) return false;
      const ref = doc(db, 'courses', course.id);
      const cleanData = sanitizeForFirestore(course);
      await setDoc(ref, cleanData, { merge: true });
      return true;
    } catch (e) {
      console.warn('Cannot save course to Firestore:', e);
      return false;
    }
  },

  async deleteCourse(courseId: string): Promise<boolean> {
    try {
      if (!this.isConfigured()) return false;
      const db = this.getDb();
      if (!db) return false;
      await deleteDoc(doc(db, 'courses', courseId));
      return true;
    } catch (e) {
      console.warn('Cannot delete course from Firestore:', e);
      return false;
    }
  },

  // ==========================================
  // STUDENT FIRESTORE OPERATIONS
  // ==========================================
  async syncStudentToFirebase(student: Student): Promise<boolean> {
    try {
      if (!this.isConfigured()) return false;
      const db = this.getDb();
      if (!db) return false;
      const studentDocRef = doc(db, 'students', student.id);
      const cleanData = sanitizeForFirestore(student);
      await setDoc(studentDocRef, cleanData, { merge: true });
      return true;
    } catch (e) {
      console.warn('Cannot sync student to Firestore:', e);
      return false;
    }
  },

  async deleteStudent(studentId: string): Promise<boolean> {
    try {
      if (!this.isConfigured()) return false;
      const db = this.getDb();
      if (!db) return false;
      await deleteDoc(doc(db, 'students', studentId));

      // Cascade delete all enrollments belonging to this student in Firestore
      try {
        const q = query(collection(db, 'enrollments'), where('studentId', '==', studentId));
        const enrollSnap = await getDocs(q);
        if (!enrollSnap.empty) {
          const batch = writeBatch(db);
          enrollSnap.forEach(d => batch.delete(d.ref));
          await batch.commit();
        }
      } catch (err) {
        console.warn('Error cascade deleting enrollments for student from Firestore:', err);
      }

      return true;
    } catch (e) {
      console.warn('Cannot delete student from Firestore:', e);
      return false;
    }
  },

  // ==========================================
  // ENROLLMENT FIRESTORE OPERATIONS
  // ==========================================
  async saveEnrollment(enrollment: Enrollment): Promise<boolean> {
    try {
      if (!this.isConfigured()) return false;
      const db = this.getDb();
      if (!db) return false;
      const cleanData = sanitizeForFirestore(enrollment);
      await setDoc(doc(db, 'enrollments', enrollment.id), cleanData, { merge: true });
      return true;
    } catch (e) {
      console.warn('Cannot sync enrollment to Firestore:', e);
      return false;
    }
  },

  async deleteEnrollment(enrollmentId: string): Promise<boolean> {
    try {
      if (!this.isConfigured()) return false;
      const db = this.getDb();
      if (!db) return false;
      await deleteDoc(doc(db, 'enrollments', enrollmentId));
      return true;
    } catch (e) {
      console.warn('Cannot delete enrollment from Firestore:', e);
      return false;
    }
  },

  // ==========================================
  // HOMEPAGE CONFIG FIRESTORE OPERATIONS
  // ==========================================
  async syncHomepageConfigToFirebase(config: HomepageConfig): Promise<boolean> {
    try {
      if (!this.isConfigured()) return false;
      const db = this.getDb();
      if (!db) return false;
      const cleanData = sanitizeForFirestore(config);
      await setDoc(doc(db, 'settings', 'homepage'), cleanData, { merge: true });
      return true;
    } catch (e) {
      console.warn('Cannot sync homepage config to Firestore:', e);
      return false;
    }
  },

  async loadHomepageConfigFromFirebase(): Promise<HomepageConfig | null> {
    try {
      if (!this.isConfigured()) return null;
      const db = this.getDb();
      if (!db) return null;
      const snap = await getDoc(doc(db, 'settings', 'homepage'));
      if (snap.exists()) {
        return snap.data() as HomepageConfig;
      }
      return null;
    } catch (e) {
      console.warn('Cannot load homepage config from Firestore:', e);
      return null;
    }
  },

  // ==========================================
  // PAYMENT CONFIG FIRESTORE OPERATIONS
  // ==========================================
  async syncPaymentConfigToFirebase(bankConfig?: PaymentBankConfig, sepayConfig?: SePayConfig): Promise<boolean> {
    try {
      if (!this.isConfigured()) return false;
      const db = this.getDb();
      if (!db) return false;
      const payload: Record<string, unknown> = {};
      if (bankConfig) payload.bankConfig = sanitizeForFirestore(bankConfig);
      if (sepayConfig) payload.sepayConfig = sanitizeForFirestore(sepayConfig);
      if (Object.keys(payload).length > 0) {
        await setDoc(doc(db, 'settings', 'payment'), payload, { merge: true });
      }
      return true;
    } catch (e) {
      console.warn('Cannot sync payment config to Firestore:', e);
      return false;
    }
  },

  async loadPaymentConfigFromFirebase(): Promise<{ bankConfig?: PaymentBankConfig; sepayConfig?: SePayConfig } | null> {
    try {
      if (!this.isConfigured()) return null;
      const db = this.getDb();
      if (!db) return null;
      const snap = await getDoc(doc(db, 'settings', 'payment'));
      if (snap.exists()) {
        const data = snap.data();
        return {
          bankConfig: data.bankConfig as PaymentBankConfig | undefined,
          sepayConfig: data.sepayConfig as SePayConfig | undefined
        };
      }
      return null;
    } catch (e) {
      console.warn('Cannot load payment config from Firestore:', e);
      return null;
    }
  },

  // ==========================================
  // READ ALL DATA FROM FIRESTORE
  // ==========================================
  async loadAllFromFirestore(): Promise<{
    instructors?: Instructor[];
    courses?: Course[];
    students?: Student[];
    enrollments?: Enrollment[];
    homepageConfig?: HomepageConfig;
    bankConfig?: PaymentBankConfig;
    sepayConfig?: SePayConfig;
  } | null> {
    try {
      if (!this.isConfigured()) return null;
      const db = this.getDb();
      if (!db) return null;

      const [instSnap, courseSnap, studentSnap, enrollSnap, hpSnap, paySnap] = await Promise.all([
        getDocs(collection(db, 'instructors')).catch(() => null),
        getDocs(collection(db, 'courses')).catch(() => null),
        getDocs(collection(db, 'students')).catch(() => null),
        getDocs(collection(db, 'enrollments')).catch(() => null),
        getDoc(doc(db, 'settings', 'homepage')).catch(() => null),
        getDoc(doc(db, 'settings', 'payment')).catch(() => null)
      ]);

      const instructors: Instructor[] = [];
      if (instSnap && !instSnap.empty) {
        instSnap.forEach(d => instructors.push(d.data() as Instructor));
      }

      const courses: Course[] = [];
      if (courseSnap && !courseSnap.empty) {
        courseSnap.forEach(d => courses.push(d.data() as Course));
      }

      const students: Student[] = [];
      if (studentSnap && !studentSnap.empty) {
        studentSnap.forEach(d => students.push(d.data() as Student));
      }

      const enrollments: Enrollment[] = [];
      if (enrollSnap && !enrollSnap.empty) {
        enrollSnap.forEach(d => enrollments.push(d.data() as Enrollment));
      }

      const homepageConfig = (hpSnap && hpSnap.exists()) ? (hpSnap.data() as HomepageConfig) : undefined;

      let bankConfig: PaymentBankConfig | undefined;
      let sepayConfig: SePayConfig | undefined;
      if (paySnap && paySnap.exists()) {
        const pData = paySnap.data();
        if (pData.bankConfig) bankConfig = pData.bankConfig as PaymentBankConfig;
        if (pData.sepayConfig) sepayConfig = pData.sepayConfig as SePayConfig;
      }

      return {
        instructors: instructors.length > 0 ? instructors : undefined,
        courses: courses.length > 0 ? courses : undefined,
        students: students.length > 0 ? students : undefined,
        enrollments: enrollments.length > 0 ? enrollments : undefined,
        homepageConfig,
        bankConfig,
        sepayConfig
      };
    } catch (e) {
      console.warn('Error loading remote data from Firestore:', e);
      return null;
    }
  },

  // ==========================================
  // BULK SYNC ALL DATA TO FIRESTORE
  // ==========================================
  async syncAllDataToFirebase(data: {
    instructors: Instructor[];
    courses: Course[];
    students: Student[];
    enrollments?: Enrollment[];
    homepageConfig?: HomepageConfig;
    bankConfig?: PaymentBankConfig;
    sepayConfig?: SePayConfig;
  }): Promise<{ success: boolean; message: string; details: string }> {
    try {
      if (!this.isConfigured()) {
        return { 
          success: false, 
          message: 'Firebase chưa được cấu hình. Vui lòng kiểm tra API Key và Project ID.',
          details: ''
        };
      }
      const db = this.getDb();
      if (!db) {
        return { success: false, message: 'Lỗi khởi tạo kết nối Firestore', details: '' };
      }

      let instCount = 0;
      let courseCount = 0;
      let studentCount = 0;
      let enrollCount = 0;

      // 1. Sync Instructors (sanitized)
      for (const inst of data.instructors) {
        const cleanInst = sanitizeForFirestore(inst);
        await setDoc(doc(db, 'instructors', inst.id), cleanInst, { merge: true });
        instCount++;
      }

      // 2. Sync Courses (sanitized)
      for (const course of data.courses) {
        const cleanCourse = sanitizeForFirestore(course);
        await setDoc(doc(db, 'courses', course.id), cleanCourse, { merge: true });
        courseCount++;
      }

      // 3. Sync Students (sanitized)
      for (const student of data.students) {
        const cleanStudent = sanitizeForFirestore(student);
        await setDoc(doc(db, 'students', student.id), cleanStudent, { merge: true });
        studentCount++;
      }

      // 4. Sync Enrollments (if provided)
      if (data.enrollments && data.enrollments.length > 0) {
        for (const enroll of data.enrollments) {
          const cleanEnroll = sanitizeForFirestore(enroll);
          await setDoc(doc(db, 'enrollments', enroll.id), cleanEnroll, { merge: true });
          enrollCount++;
        }
      }

      // 5. Sync Homepage Config (settings/homepage)
      let hpSynced = false;
      if (data.homepageConfig) {
        const cleanHp = sanitizeForFirestore(data.homepageConfig);
        await setDoc(doc(db, 'settings', 'homepage'), cleanHp, { merge: true });
        hpSynced = true;
      }

      // 6. Sync Payment & SePay Config (settings/payment)
      let paySynced = false;
      if (data.bankConfig || data.sepayConfig) {
        const payPayload: Record<string, unknown> = {};
        if (data.bankConfig) payPayload.bankConfig = sanitizeForFirestore(data.bankConfig);
        if (data.sepayConfig) payPayload.sepayConfig = sanitizeForFirestore(data.sepayConfig);
        await setDoc(doc(db, 'settings', 'payment'), payPayload, { merge: true });
        paySynced = true;
      }

      const extraDetails: string[] = [];
      if (enrollCount > 0) extraDetails.push(`${enrollCount} Đơn đăng ký`);
      if (hpSynced) extraDetails.push(`Cấu hình Trang chủ (Header, Hero, FAQ, Footer)`);
      if (paySynced) extraDetails.push(`Tài khoản Ngân hàng & Webhook SePay`);

      return {
        success: true,
        message: `Đồng bộ toàn bộ dữ liệu lên Firestore thành công!`,
        details: `Đã lưu: ${instCount} Giảng viên, ${courseCount} Khóa học, ${studentCount} Học viên${extraDetails.length > 0 ? ', ' + extraDetails.join(', ') : ''}.`
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Lỗi đồng bộ Firestore: ${message}`, details: '' };
    }
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const initRes = this.init();
      if (!initRes.success || !dbInstance) {
        return { success: false, message: initRes.error || 'Lỗi khởi tạo Firebase' };
      }
      // Attempt read from students and instructors
      const [studentSnap, instSnap, courseSnap] = await Promise.all([
        getDocs(collection(dbInstance, 'students')).catch(() => null),
        getDocs(collection(dbInstance, 'instructors')).catch(() => null),
        getDocs(collection(dbInstance, 'courses')).catch(() => null)
      ]);
      const studentCount = studentSnap ? studentSnap.docs.length : 0;
      const instCount = instSnap ? instSnap.docs.length : 0;
      const courseCount = courseSnap ? courseSnap.docs.length : 0;
      return { 
        success: true, 
        message: `Kết nối Firebase Firestore thành công! Tìm thấy: ${instCount} giảng viên, ${courseCount} khóa học, ${studentCount} học viên trên đám mây.` 
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Kết nối thất bại: ${message}` };
    }
  }
};
