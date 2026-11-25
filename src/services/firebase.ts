import { initializeApp, getApps, deleteApp, FirebaseApp } from 'firebase/app';
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
  writeBatch,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { StorageService } from './storage';
import { Student, Instructor, Course, Enrollment, HomepageConfig, PaymentBankConfig, SePayConfig } from '../types';

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let activeConfigSignature = '';

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
      const apiKey = (import.meta.env.VITE_FIREBASE_API_KEY || config.apiKey || '').trim();
      const projectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID || config.projectId || '').trim();
      const authDomain = (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || config.authDomain || (projectId ? `${projectId}.firebaseapp.com` : '')).trim();
      const storageBucket = (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || config.storageBucket || (projectId ? `${projectId}.appspot.com` : '')).trim();
      const messagingSenderId = (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || config.messagingSenderId || '').trim();
      const appId = (import.meta.env.VITE_FIREBASE_APP_ID || config.appId || '').trim();

      if (!apiKey || !projectId) {
        return { success: false, error: 'Chưa điền Firebase API Key và Project ID' };
      }

      const nextSignature = `${apiKey}|${projectId}|${appId}`;
      const existingApps = getApps();

      if (existingApps.length === 0) {
        appInstance = initializeApp({
          apiKey,
          authDomain,
          projectId,
          storageBucket,
          messagingSenderId,
          appId
        });
        activeConfigSignature = nextSignature;
      } else if (activeConfigSignature && activeConfigSignature !== nextSignature) {
        // Re-initialize cleanly when credentials changed in Admin
        const prevApp = appInstance || existingApps[0];
        dbInstance = null;
        deleteApp(prevApp).catch(() => {});
        appInstance = initializeApp({
          apiKey,
          authDomain,
          projectId,
          storageBucket,
          messagingSenderId,
          appId
        }, `app-${Date.now()}`);
        activeConfigSignature = nextSignature;
      } else {
        appInstance = existingApps[0];
        activeConfigSignature = nextSignature;
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

      // 1. Delete instructor doc from Firestore (direct doc ID)
      await deleteDoc(doc(db, 'instructors', instructorId)).catch(() => {});

      // Also delete by matching 'id' field if doc ID was different
      try {
        const qInst = query(collection(db, 'instructors'), where('id', '==', instructorId));
        const snapInst = await getDocs(qInst);
        if (!snapInst.empty) {
          const bInst = writeBatch(db);
          snapInst.forEach(d => bInst.delete(d.ref));
          await bInst.commit();
        }
      } catch (err) {
        console.warn('Error querying instructor doc by id in Firestore:', err);
      }

      // 2. Cascade delete all courses belonging to this instructor in Firestore
      let deletedCoursesCount = 0;
      const deletedCourseIds: string[] = [];
      try {
        const q = query(collection(db, 'courses'), where('instructorId', '==', instructorId));
        const courseSnap = await getDocs(q);
        const batch = writeBatch(db);
        courseSnap.forEach(d => {
          batch.delete(d.ref);
          deletedCourseIds.push(d.id);
          deletedCoursesCount++;
        });
        if (deletedCoursesCount > 0) {
          await batch.commit();
        }
      } catch (err) {
        console.warn('Error cascade deleting courses from Firestore:', err);
      }

      // 3. Cascade delete all enrollments belonging to deleted courses
      if (deletedCourseIds.length > 0) {
        try {
          for (const cId of deletedCourseIds) {
            const qEnr = query(collection(db, 'enrollments'), where('courseId', '==', cId));
            const enrSnap = await getDocs(qEnr);
            if (!enrSnap.empty) {
              const bEnr = writeBatch(db);
              enrSnap.forEach(d => bEnr.delete(d.ref));
              await bEnr.commit();
            }
          }
        } catch (err) {
          console.warn('Error cascade deleting enrollments for deleted courses in Firestore:', err);
        }
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
      await deleteDoc(doc(db, 'courses', courseId)).catch(() => {});
      try {
        const qCrs = query(collection(db, 'courses'), where('id', '==', courseId));
        const snapCrs = await getDocs(qCrs);
        if (!snapCrs.empty) {
          const bCrs = writeBatch(db);
          snapCrs.forEach(d => bCrs.delete(d.ref));
          await bCrs.commit();
        }
      } catch (err) {
        console.warn('Error querying course doc by id in Firestore:', err);
      }

      // Cascade delete enrollments for this course
      try {
        const qEnr = query(collection(db, 'enrollments'), where('courseId', '==', courseId));
        const enrSnap = await getDocs(qEnr);
        if (!enrSnap.empty) {
          const bEnr = writeBatch(db);
          enrSnap.forEach(d => bEnr.delete(d.ref));
          await bEnr.commit();
        }
      } catch (err) {
        console.warn('Error cascade deleting enrollments for course from Firestore:', err);
      }

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
      await deleteDoc(doc(db, 'students', studentId)).catch(() => {});
      try {
        const qStd = query(collection(db, 'students'), where('id', '==', studentId));
        const snapStd = await getDocs(qStd);
        if (!snapStd.empty) {
          const bStd = writeBatch(db);
          snapStd.forEach(d => bStd.delete(d.ref));
          await bStd.commit();
        }
      } catch (err) {
        console.warn('Error querying student doc by id in Firestore:', err);
      }

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
        instSnap.forEach(d => {
          const item = d.data() as Instructor;
          instructors.push({ ...item, id: item.id || d.id });
        });
        instructors.sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER));
      }

      const courses: Course[] = [];
      if (courseSnap && !courseSnap.empty) {
        courseSnap.forEach(d => {
          const item = d.data() as Course;
          courses.push({ ...item, id: item.id || d.id });
        });
      }

      const students: Student[] = [];
      if (studentSnap && !studentSnap.empty) {
        studentSnap.forEach(d => {
          const item = d.data() as Student;
          students.push({ ...item, id: item.id || d.id });
        });
      }

      const enrollments: Enrollment[] = [];
      if (enrollSnap && !enrollSnap.empty) {
        enrollSnap.forEach(d => {
          const item = d.data() as Enrollment;
          enrollments.push({ ...item, id: item.id || d.id });
        });
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

  subscribeToRealtimeUpdates(handlers: {
    onHomepageConfig?: (config: HomepageConfig) => void;
    onPaymentConfig?: (data: { bankConfig?: PaymentBankConfig; sepayConfig?: SePayConfig }) => void;
    onInstructors?: (instructors: Instructor[]) => void;
    onCourses?: (courses: Course[]) => void;
  }): () => void {
    if (!this.isConfigured()) return () => {};
    const db = this.getDb();
    if (!db) return () => {};

    const unsubscribers: Unsubscribe[] = [];

    if (handlers.onHomepageConfig) {
      unsubscribers.push(
        onSnapshot(
          doc(db, 'settings', 'homepage'),
          (snap) => {
            if (snap.exists() && !snap.metadata.hasPendingWrites) {
              handlers.onHomepageConfig?.(snap.data() as HomepageConfig);
            }
          },
          (err) => console.warn('Realtime homepage listener skipped:', err)
        )
      );
    }

    if (handlers.onPaymentConfig) {
      unsubscribers.push(
        onSnapshot(
          doc(db, 'settings', 'payment'),
          (snap) => {
            if (snap.exists() && !snap.metadata.hasPendingWrites) {
              const pData = snap.data();
              handlers.onPaymentConfig?.({
                bankConfig: pData.bankConfig as PaymentBankConfig | undefined,
                sepayConfig: pData.sepayConfig as SePayConfig | undefined
              });
            }
          },
          (err) => console.warn('Realtime payment listener skipped:', err)
        )
      );
    }

    if (handlers.onInstructors) {
      unsubscribers.push(
        onSnapshot(
          collection(db, 'instructors'),
          (snap) => {
            if (!snap.metadata.hasPendingWrites) {
              const list: Instructor[] = [];
              snap.forEach(d => {
                const item = d.data() as Instructor;
                list.push({ ...item, id: item.id || d.id });
              });
              list.sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER));
              handlers.onInstructors?.(list);
            }
          },
          (err) => console.warn('Realtime instructors listener skipped:', err)
        )
      );
    }

    if (handlers.onCourses) {
      unsubscribers.push(
        onSnapshot(
          collection(db, 'courses'),
          (snap) => {
            if (!snap.metadata.hasPendingWrites) {
              const list: Course[] = [];
              snap.forEach(d => {
                const item = d.data() as Course;
                list.push({ ...item, id: item.id || d.id });
              });
              handlers.onCourses?.(list);
            }
          },
          (err) => console.warn('Realtime courses listener skipped:', err)
        )
      );
    }

    return () => {
      unsubscribers.forEach(unsub => {
        try {
          unsub();
        } catch {
          // ignore
        }
      });
    };
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
      const isPermissionErr = message.toLowerCase().includes('permission') || message.toLowerCase().includes('insufficient');
      const hint = isPermissionErr 
        ? ' (Nguyên nhân: Firestore Security Rules trên Firebase Console đang chặn quyền ghi. Vui lòng mở Tab Rules trên Firebase Console và dán quy tắc theo hướng dẫn bên dưới).'
        : '';
      return { success: false, message: `Lỗi đồng bộ Firestore: ${message}${hint}`, details: '' };
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

      // Verify write permission
      let writeWarning = '';
      try {
        const testRef = doc(dbInstance, 'settings', '_ping_');
        await setDoc(testRef, { lastPing: Date.now() }, { merge: true });
        await deleteDoc(testRef).catch(() => {});
      } catch (wErr: unknown) {
        const wMsg = wErr instanceof Error ? wErr.message : String(wErr);
        if (wMsg.toLowerCase().includes('permission') || wMsg.toLowerCase().includes('insufficient')) {
          return {
            success: false,
            message: `⚠️ Kết nối đọc được nhưng BỊ CHẶN QUYỀN GHI (${wMsg}). Nguyên nhân: Firestore Security Rules trên Firebase Console đang khóa quyền ghi. Vui lòng cập nhật Rules theo hướng dẫn bên dưới!`
          };
        }
        writeWarning = ` (Lưu ý: Không thể ghi thử: ${wMsg})`;
      }

      return { 
        success: true, 
        message: `Kết nối Firebase Firestore thành công (Cả Đọc & Ghi)! Tìm thấy: ${instCount} giảng viên, ${courseCount} khóa học, ${studentCount} học viên trên đám mây.${writeWarning}` 
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Kết nối thất bại: ${message}` };
    }
  }
};
