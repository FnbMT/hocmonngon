import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { StorageService } from './services/storage';
import { FirebaseService } from './services/firebase';
import { PaymentService } from './services/paymentService';
import { DevPersistence } from './services/devPersistence';
import { AuthService } from './services/authService';
import { Course, Instructor, Student, Enrollment, ChefQuestion, HomepageConfig } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { AuthModal } from './components/AuthModal';
import { CartDrawer } from './components/CartDrawer';

// Tối ưu Code-Splitting với React.lazy() cho các trang nặng, giảm First Load JS trên Vercel
const CourseCatalog = lazy(() => import('./components/CourseCatalog').then(m => ({ default: m.CourseCatalog })));
const CourseDetail = lazy(() => import('./components/CourseDetail').then(m => ({ default: m.CourseDetail })));
const CheckoutPage = lazy(() => import('./components/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const TrialRegistration = lazy(() => import('./components/TrialRegistration').then(m => ({ default: m.TrialRegistration })));
const StudentDashboard = lazy(() => import('./components/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const ClassroomPlayer = lazy(() => import('./components/ClassroomPlayer').then(m => ({ default: m.ClassroomPlayer })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

// Loading Component mượt mà khi tải trang lazy
function PageLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="w-14 h-14 border-4 border-stone-200 border-t-red-700 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-lg">
          🍴
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-stone-800">Đang tải nội dung...</p>
        <p className="text-xs text-stone-400 mt-1">Học viện ẩm thực Học Món Ngon</p>
      </div>
    </div>
  );
}

// Helper đọc URL Search Params khi F5 hoặc mở link trực tiếp trên Vercel
function getInitialNavState() {
  if (typeof window === 'undefined') return { view: 'home' };
  try {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') || 'home';
    const courseId = params.get('courseId') || params.get('id') || undefined;
    const chefId = params.get('chefId') || undefined;
    const category = params.get('category') || undefined;
    const search = params.get('search') || undefined;
    const lessonId = params.get('lessonId') || undefined;
    return { view, courseId, chefId, category, search, lessonId };
  } catch {
    return { view: 'home' };
  }
}

export default function App() {
  const [courses, setCourses] = useState<Course[]>(StorageService.getCourses());
  const [instructors, setInstructors] = useState<Instructor[]>(StorageService.getInstructors());
  const [students, setStudents] = useState<Student[]>(StorageService.getStudents());
  const [enrollments, setEnrollments] = useState<Enrollment[]>(StorageService.getEnrollments());
  const [currentUser, setCurrentUser] = useState<Student | null>(StorageService.getCurrentUser());
  const [adminSessionVerified, setAdminSessionVerified] = useState<boolean>(false);
  const [questions, setQuestions] = useState<ChefQuestion[]>(StorageService.getQuestions());
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(() => StorageService.getHomepageConfig());

  const initialNav = getInitialNavState();

  // Navigation State
  const [currentView, setCurrentView] = useState<
    'home' | 'catalog' | 'course' | 'checkout' | 'trial' | 'dashboard' | 'classroom' | 'admin'
  >((initialNav.view as any) || 'home');

  const [selectedCourse, setSelectedCourse] = useState<Course>(() => {
    if (initialNav.courseId) {
      const found = courses.find(c => c.id === initialNav.courseId || c.slug === initialNav.courseId);
      if (found) return found;
    }
    return courses[0];
  });

  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>(initialNav.lessonId);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Shopping Cart state persisted in localStorage
  const [cartCourseIds, setCartCourseIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hocmonngon_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutCartCourses, setCheckoutCartCourses] = useState<Course[] | undefined>(undefined);

  // Catalog filter transfer params
  const [catalogChefId, setCatalogChefId] = useState<string | undefined>(initialNav.chefId);
  const [catalogCategory, setCatalogCategory] = useState<string | undefined>(initialNav.category);
  const [catalogSearch, setCatalogSearch] = useState<string | undefined>(initialNav.search);

  // Refresh all state from storage
  const reloadData = useCallback(() => {
    setCourses(StorageService.getCourses());
    setInstructors(StorageService.getInstructors());
    setStudents(StorageService.getStudents());
    setEnrollments(StorageService.getEnrollments());
    setCurrentUser(StorageService.getCurrentUser());
    setQuestions(StorageService.getQuestions());
    setHomepageConfig(StorageService.getHomepageConfig());
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Keep selectedCourse synced when courses update (e.g. from Admin or Firestore)
  useEffect(() => {
    if (!selectedCourse && courses.length > 0) {
      setSelectedCourse(courses[0]);
      return;
    }
    if (selectedCourse) {
      const updated = courses.find(c => c.id === selectedCourse.id);
      if (updated && updated !== selectedCourse) {
        setSelectedCourse(updated);
      }
    }
  }, [courses, selectedCourse]);

  // Đồng bộ Firestore và DevPersistence
  useEffect(() => {
    let isMounted = true;
    let unsubscribeRealtime: (() => void) | null = null;

    const handleStorageChange = () => {
      reloadData();
    };
    const handleHomepageConfigChange = () => {
      setHomepageConfig(StorageService.getHomepageConfig());
    };
    const handleQuotaExceeded = () => {
      showToast('Bộ nhớ trình duyệt gần đầy. Hãy tải ảnh qua Firebase Storage hoặc nén nhỏ hơn!');
    };

    window.addEventListener('storage_data_updated', handleStorageChange);
    window.addEventListener('homepage_config_updated', handleHomepageConfigChange);
    window.addEventListener('storage_quota_exceeded', handleQuotaExceeded);

    const startRealtimeSync = async () => {
      if (!isMounted || !FirebaseService.isConfigured()) return;

      try {
        const remoteData = await FirebaseService.loadAllFromFirestore();
        if (isMounted && remoteData) {
          let updated = false;
          if (remoteData.instructors && remoteData.instructors.length > 0) {
            StorageService.setInstructorsFromRemote(remoteData.instructors);
            updated = true;
          }
          if (remoteData.courses && remoteData.courses.length > 0) {
            StorageService.setCoursesFromRemote(remoteData.courses);
            updated = true;
          }
          if (remoteData.students && remoteData.students.length > 0) {
            StorageService.setStudentsFromRemote(remoteData.students);
            updated = true;
          }
          if (remoteData.enrollments && remoteData.enrollments.length > 0) {
            StorageService.setEnrollmentsFromRemote(remoteData.enrollments);
            updated = true;
          }
          if (remoteData.homepageConfig) {
            StorageService.setHomepageConfigFromRemote(remoteData.homepageConfig);
            setHomepageConfig(remoteData.homepageConfig);
          }
          if (remoteData.bankConfig) {
            PaymentService.setBankConfigFromRemote(remoteData.bankConfig);
          }
          if (remoteData.sepayConfig) {
            PaymentService.setSePayConfigFromRemote(remoteData.sepayConfig);
          }
          if (updated) {
            reloadData();
          }
        }
      } catch (err) {
        console.warn('Firestore initial sync skipped:', err);
      }

      if (!isMounted) return;
      if (unsubscribeRealtime) {
        unsubscribeRealtime();
      }
      unsubscribeRealtime = FirebaseService.subscribeToRealtimeUpdates({
        onHomepageConfig: (cfg) => {
          StorageService.setHomepageConfigFromRemote(cfg);
          setHomepageConfig(cfg);
        },
        onPaymentConfig: ({ bankConfig, sepayConfig }) => {
          if (bankConfig) PaymentService.setBankConfigFromRemote(bankConfig);
          if (sepayConfig) PaymentService.setSePayConfigFromRemote(sepayConfig);
        },
        onInstructors: (insts) => {
          StorageService.setInstructorsFromRemote(insts);
          reloadData();
        },
        onCourses: (crs) => {
          StorageService.setCoursesFromRemote(crs);
          reloadData();
        },
        onTombstones: () => {
          reloadData();
        }
      });
    };

    const handleFirebaseConfigUpdated = () => {
      startRealtimeSync();
    };
    window.addEventListener('firebase_config_updated', handleFirebaseConfigUpdated);

    const bootstrap = async () => {
      const restored = await DevPersistence.restoreIfNeeded();
      if (isMounted && restored) {
        reloadData();
      }

      // Xác minh phiên Quản trị viên bằng HttpOnly Cookie từ máy chủ (/api/admin-auth)
      // Ngăn chặn hoàn toàn hành vi giả mạo role: 'admin' qua F12 LocalStorage
      const adminCheck = await AuthService.verifyAdminSession();
      if (isMounted) {
        if (adminCheck.authenticated && adminCheck.user) {
          setAdminSessionVerified(true);
          const localUser = StorageService.getCurrentUser();
          if (!localUser || localUser.role === 'admin') {
            StorageService.setCurrentUser(adminCheck.user);
            setCurrentUser(adminCheck.user);
          }
        } else {
          setAdminSessionVerified(false);
          const localUser = StorageService.getCurrentUser();
          if (localUser?.role === 'admin') {
            StorageService.setCurrentUser(null);
            setCurrentUser(null);
          }
        }
      }

      await startRealtimeSync();
    };
    bootstrap();

    return () => {
      isMounted = false;
      window.removeEventListener('storage_data_updated', handleStorageChange);
      window.removeEventListener('homepage_config_updated', handleHomepageConfigChange);
      window.removeEventListener('storage_quota_exceeded', handleQuotaExceeded);
      window.removeEventListener('firebase_config_updated', handleFirebaseConfigUpdated);
      if (unsubscribeRealtime) {
        unsubscribeRealtime();
      }
    };
  }, [reloadData, showToast]);

  // Đồng bộ URL Search Params hai chiều (Hỗ trợ F5 giữ nguyên trang & chia sẻ link trên Vercel)
  const syncUrlParams = useCallback((view: string, params?: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      if (view === 'home') {
        url.search = '';
      } else {
        url.searchParams.set('view', view);
        if (params?.courseId) url.searchParams.set('courseId', String(params.courseId));
        else if (selectedCourse && (view === 'course' || view === 'checkout' || view === 'classroom')) {
          url.searchParams.set('courseId', selectedCourse.id);
        }
        if (params?.chefId) url.searchParams.set('chefId', String(params.chefId));
        if (params?.category) url.searchParams.set('category', String(params.category));
        if (params?.lessonId) url.searchParams.set('lessonId', String(params.lessonId));
      }
      window.history.pushState({ view, params }, '', url.toString());
    } catch {
      // Ignore if history state fails
    }
  }, [selectedCourse]);

  // Lắng nghe sự kiện Back/Forward của trình duyệt
  useEffect(() => {
    const handlePopState = () => {
      const nav = getInitialNavState();
      setCurrentView((nav.view as any) || 'home');
      if (nav.courseId) {
        const found = courses.find(c => c.id === nav.courseId || c.slug === nav.courseId);
        if (found) setSelectedCourse(found);
      }
      if (nav.lessonId) setSelectedLessonId(nav.lessonId);
      if (nav.chefId) setCatalogChefId(nav.chefId);
      if (nav.category) setCatalogCategory(nav.category);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [courses]);

  // Navigation handler
  const handleNavigate = (view: string, params?: Record<string, unknown>) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    syncUrlParams(view, params);

    if (view === 'catalog') {
      if (params?.chefId) setCatalogChefId(params.chefId as string);
      else if (params?.filterChef) setCatalogChefId(instructors[0]?.id);
      else setCatalogChefId(undefined);

      if (params?.category) setCatalogCategory(params.category as string);
      else setCatalogCategory(undefined);

      if (params?.search) setCatalogSearch(params.search as string);
      else setCatalogSearch(undefined);

      setCurrentView('catalog');
      return;
    }

    if (view === 'course') {
      if (params?.courseId) {
        const found = courses.find(c => c.id === params.courseId || c.slug === params.courseId);
        if (found) setSelectedCourse(found);
      }
      setCurrentView('course');
      return;
    }

    if (view === 'checkout') {
      if (params?.courseId) {
        const found = courses.find(c => c.id === params.courseId || c.slug === params.courseId);
        if (found) setSelectedCourse(found);
      }
      setCurrentView('checkout');
      return;
    }

    if (view === 'trial') {
      if (currentUser) {
        setCurrentView('catalog');
        showToast(`Chào ${currentUser.name}! Bạn đã đăng nhập nên có thể xem trực tiếp các bài học thử.`);
        return;
      }
      if (params?.courseId) {
        const found = courses.find(c => c.id === params.courseId || c.slug === params.courseId);
        if (found) setSelectedCourse(found);
      }
      setCurrentView('trial');
      return;
    }

    if (view === 'classroom') {
      if (params?.courseId) {
        const found = courses.find(c => c.id === params.courseId || c.slug === params.courseId);
        if (found) setSelectedCourse(found);
      }
      if (params?.lessonId) {
        setSelectedLessonId(params.lessonId as string);
      }
      setCurrentView('classroom');
      return;
    }

    setCurrentView(view as typeof currentView);
  };

  // Course selection
  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setSelectedLessonId(undefined);
    syncUrlParams('course', { courseId: course.id });
    setCurrentView('course');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open trial registration or direct trial
  const handleSelectTrial = (courseId?: string) => {
    if (currentUser) {
      if (courseId) {
        const found = courses.find(c => c.id === courseId);
        if (found) {
          handleStartTrial(found);
          return;
        }
      }
      setCurrentView('catalog');
      showToast(`Chào ${currentUser.name}! Bạn đã đăng nhập nên có thể xem trực tiếp các bài học thử.`);
      return;
    }
    if (courseId) {
      const found = courses.find(c => c.id === courseId);
      if (found) setSelectedCourse(found);
    }
    syncUrlParams('trial', { courseId });
    setCurrentView('trial');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start trial lesson directly
  const handleStartTrial = (course: Course, lessonId?: string) => {
    let student = currentUser;
    if (!student) {
      student = StorageService.getStudents()[0];
      StorageService.setCurrentUser(student);
    }

    StorageService.enrollStudent({
      studentId: student.id,
      courseId: course.id,
      type: 'trial',
      price: 0
    });

    setSelectedCourse(course);
    const targetLessonId = lessonId || course.chapters[0]?.lessons[0]?.id;
    setSelectedLessonId(targetLessonId);
    syncUrlParams('classroom', { courseId: course.id, lessonId: targetLessonId });
    setCurrentView('classroom');
    showToast(`Đã kích hoạt quyền học thử miễn phí khóa "${course.title.split(' - ')[0]}"!`);
  };

  // Open Classroom Player
  const handleOpenPlayer = (course: Course, lessonId?: string) => {
    setSelectedCourse(course);
    setSelectedLessonId(lessonId);
    syncUrlParams('classroom', { courseId: course.id, lessonId });
    setCurrentView('classroom');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Free Trial Registration Form Success
  const handleRegisterTrialSuccess = (data: {
    name: string;
    phone: string;
    email: string;
    courseId: string;
    goal: string;
  }) => {
    const cleanPhone = data.phone?.trim() || '';
    const cleanEmail = data.email?.trim() || (cleanPhone ? `${cleanPhone}@hocmonngon.vn` : 'hocvien@hocmonngon.vn');

    const newStudent: Student = {
      id: 'student-' + Date.now(),
      name: data.name,
      email: cleanEmail,
      phone: cleanPhone,
      role: 'student',
      registeredAt: new Date().toISOString().split('T')[0],
      goal: data.goal
    };

    const savedStudent = StorageService.addStudent(newStudent);
    StorageService.setCurrentUser(savedStudent);
    setCurrentUser(savedStudent);

    FirebaseService.syncStudentToFirebase(savedStudent);

    StorageService.enrollStudent({
      studentId: savedStudent.id,
      courseId: data.courseId,
      type: 'trial',
      price: 0
    });

    const targetCourse = courses.find(c => c.id === data.courseId) || selectedCourse;
    setSelectedCourse(targetCourse);
    setSelectedLessonId(targetCourse.chapters[0]?.lessons[0]?.id);
    syncUrlParams('dashboard');
    setCurrentView('dashboard');
    showToast(`Chào mừng ${data.name}! Bạn đã nhận tài khoản học thử miễn phí thành công.`);
  };

  // Quick Trial from Homepage
  const handleQuickTrialSubmit = (data: { name: string; contact: string; field: string }) => {
    let student = currentUser;
    if (!student) {
      student = {
        id: 'student-' + Date.now(),
        name: data.name,
        email: data.contact.includes('@') ? data.contact : `${data.contact}@hocmonngon.vn`,
        phone: data.contact.includes('@') ? '0912345678' : data.contact,
        role: 'student',
        registeredAt: new Date().toISOString().split('T')[0],
        goal: data.field
      };
      StorageService.addStudent(student);
      StorageService.setCurrentUser(student);
    }

    StorageService.enrollStudent({
      studentId: student.id,
      courseId: courses[0].id,
      type: 'trial',
      price: 0
    });

    showToast(`Đã nhận đăng ký của ${data.name}! Hệ thống đang kết nối bài học thử.`);
  };

  const saveCartIds = (ids: string[]) => {
    setCartCourseIds(ids);
    try {
      localStorage.setItem('hocmonngon_cart_v1', JSON.stringify(ids));
    } catch (e) {
      console.warn('Could not persist cart:', e);
    }
  };

  const cartCourses = cartCourseIds
    .map(id => courses.find(c => c.id === id))
    .filter((c): c is Course => Boolean(c));

  const handleAddToCart = (course: Course) => {
    if (cartCourseIds.includes(course.id)) {
      setIsCartOpen(true);
      return;
    }
    const updated = [...cartCourseIds, course.id];
    saveCartIds(updated);
    showToast(`Đã thêm "${course.title.split(' - ')[0]}" vào giỏ hàng!`);
  };

  const handleRemoveFromCart = (courseId: string) => {
    saveCartIds(cartCourseIds.filter(id => id !== courseId));
  };

  const handleClearCart = () => {
    saveCartIds([]);
    showToast('Đã xóa toàn bộ khóa học khỏi giỏ hàng.');
  };

  const handleBuyNow = (course: Course) => {
    setCheckoutCartCourses(undefined);
    setSelectedCourse(course);
    syncUrlParams('checkout', { courseId: course.id });
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckoutCart = () => {
    if (cartCourses.length === 0) return;
    setCheckoutCartCourses(cartCourses);
    setSelectedCourse(cartCourses[0]);
    setIsCartOpen(false);
    syncUrlParams('checkout');
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Payment Success (from Checkout Page)
  const handlePaymentSuccess = (
    studentData: { name: string; phone: string; email: string },
    purchasedCourses?: Course[]
  ) => {
    let student = currentUser;
    if (!student) {
      student = {
        id: 'student-' + Date.now(),
        name: studentData.name,
        email: studentData.email,
        phone: studentData.phone,
        role: 'student',
        registeredAt: new Date().toISOString().split('T')[0]
      };
      student = StorageService.addStudent(student);
      StorageService.setCurrentUser(student);
    } else {
      student.name = studentData.name;
      student.phone = studentData.phone;
      student.email = studentData.email;
      StorageService.setCurrentUser(student);
    }

    FirebaseService.syncStudentToFirebase(student);

    const coursesToEnroll = purchasedCourses && purchasedCourses.length > 0 ? purchasedCourses : [selectedCourse];
    coursesToEnroll.forEach(c => {
      StorageService.enrollStudent({
        studentId: student!.id,
        courseId: c.id,
        type: 'paid',
        price: c.discountPrice
      });
    });

    const purchasedIds = new Set(coursesToEnroll.map(c => c.id));
    saveCartIds(cartCourseIds.filter(id => !purchasedIds.has(id)));
    setCheckoutCartCourses(undefined);

    syncUrlParams('dashboard');
    setCurrentView('dashboard');
    if (coursesToEnroll.length > 1) {
      showToast(`Thanh toán thành công! Đã mở khóa trọn đời ${coursesToEnroll.length} khóa học.`);
    } else {
      showToast(`Thanh toán thành công! Khóa học "${coursesToEnroll[0].title.split(' - ')[0]}" đã được mở khóa trọn đời.`);
    }
  };

  // Lesson progress completion toggle
  const handleToggleComplete = (enrollmentId: string, lessonId: string) => {
    StorageService.toggleLessonCompletion(enrollmentId, lessonId);
    reloadData();
  };

  // Send question to Chef
  const handleSendQuestion = (chefName: string, question: string) => {
    const student = currentUser || students[0];
    StorageService.addQuestion({
      studentId: student.id,
      studentName: student.name,
      studentPhone: student.phone,
      chefName,
      question
    });
    reloadData();
    showToast('Đã gửi câu hỏi tới Bếp trưởng!');
  };

  // Login success
  const handleLoginSuccess = (user: Student) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
    if (user.role === 'admin') {
      setAdminSessionVerified(true);
    }
    if (user.role === 'admin' || user.role === 'instructor') {
      syncUrlParams('admin');
      setCurrentView('admin');
      showToast(`Đăng nhập thành công! Đã vào cổng quản trị khóa học.`);
    } else {
      syncUrlParams('dashboard');
      setCurrentView('dashboard');
      showToast(`Đăng nhập thành công với tài khoản ${user.name}!`);
    }
  };

  // Logout
  const handleLogout = () => {
    if (currentUser?.role === 'admin') {
      void AuthService.logoutAdmin();
      setAdminSessionVerified(false);
    }
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    showToast('Đã đăng xuất tài khoản.');
    syncUrlParams('home');
    setCurrentView('home');
  };

  // Get active enrollment for selected course
  const currentCourseEnrollment = currentUser
    ? enrollments.find(e => e.studentId === currentUser.id && e.courseId === selectedCourse?.id)
    : undefined;

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-stone-900 bg-[#faf9f6]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-stone-700 text-xs sm:text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Header (Ẩn trong phòng học để học viên tập trung) */}
      {currentView !== 'classroom' && (
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onOpenAuth={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
          cartCount={cartCourses.length}
          onOpenCart={() => setIsCartOpen(true)}
          homepageConfig={homepageConfig}
        />
      )}

      {/* View Routing bọc trong Suspense để hỗ trợ Code Splitting mượt mà */}
      <main className="flex-1">
        <Suspense fallback={<PageLoadingFallback />}>
          {currentView === 'home' && (
            <HomePage
              courses={courses}
              instructors={instructors}
              cartCourseIds={cartCourseIds}
              onSelectCourse={handleSelectCourse}
              onSelectTrial={handleSelectTrial}
              onBuyNow={handleBuyNow}
              onAddToCart={handleAddToCart}
              onOpenCart={() => setIsCartOpen(true)}
              onNavigate={handleNavigate}
              onQuickTrialSubmit={handleQuickTrialSubmit}
              homepageConfig={homepageConfig}
            />
          )}

          {currentView === 'catalog' && (
            <CourseCatalog
              courses={courses}
              instructors={instructors}
              selectedChefId={catalogChefId}
              initialCategory={catalogCategory}
              initialSearch={catalogSearch}
              onSelectCourse={handleSelectCourse}
              onSelectTrial={handleSelectTrial}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'course' && selectedCourse && (
            <CourseDetail
              course={selectedCourse}
              currentUser={currentUser}
              userEnrollment={currentCourseEnrollment}
              onEnroll={() => {
                setCheckoutCartCourses(undefined);
                syncUrlParams('checkout', { courseId: selectedCourse.id });
                setCurrentView('checkout');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onStartTrial={handleStartTrial}
              onOpenPlayer={handleOpenPlayer}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'checkout' && selectedCourse && (
            <CheckoutPage
              course={selectedCourse}
              cartCourses={checkoutCartCourses}
              currentUser={currentUser}
              onPaymentSuccess={handlePaymentSuccess}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'trial' && (
            <TrialRegistration
              instructors={instructors}
              courses={courses}
              initialCourseId={selectedCourse?.id}
              currentUser={currentUser}
              onRegisterTrialSuccess={handleRegisterTrialSuccess}
              onNavigate={handleNavigate}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          )}

          {currentView === 'dashboard' && (
            <StudentDashboard
              currentUser={currentUser || students[0]}
              enrollments={StorageService.getStudentEnrollments(currentUser?.id || students[0].id)}
              courses={courses}
              questions={questions}
              onOpenPlayer={handleOpenPlayer}
              onUpgradeTrial={(c) => {
                setSelectedCourse(c);
                syncUrlParams('checkout', { courseId: c.id });
                setCurrentView('checkout');
              }}
              onSendQuestion={handleSendQuestion}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'classroom' && selectedCourse && (
            <ClassroomPlayer
              course={selectedCourse}
              currentUser={currentUser || students[0]}
              enrollment={currentCourseEnrollment}
              initialLessonId={selectedLessonId}
              onToggleComplete={handleToggleComplete}
              onUpgradePaid={(c) => {
                setSelectedCourse(c);
                syncUrlParams('checkout', { courseId: c.id });
                setCurrentView('checkout');
              }}
              onBack={() => {
                const backView = currentUser ? 'dashboard' : 'course';
                syncUrlParams(backView, { courseId: selectedCourse.id });
                setCurrentView(backView);
              }}
              onSendQuestion={handleSendQuestion}
            />
          )}

          {currentView === 'admin' && (
            (currentUser?.role === 'admin' && adminSessionVerified) || currentUser?.role === 'instructor' ? (
              <AdminDashboard
                students={students}
                enrollments={enrollments}
                courses={courses}
                instructors={instructors}
                currentUser={currentUser}
                onRefreshData={reloadData}
                onNavigate={handleNavigate}
              />
            ) : (
              <div className="min-h-[65vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white border border-stone-200 rounded-3xl p-8 text-center shadow-sm space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-700 flex items-center justify-center text-2xl font-black">
                    🔒
                  </div>
                  <h2 className="text-xl font-black text-stone-900">
                    Khu Vực Dành Cho Quản Trị & Giảng Viên
                  </h2>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Phiên truy cập của bạn chưa được xác thực hoặc đã hết hạn. Vui lòng đăng nhập bằng tài khoản Quản trị viên hoặc Giảng viên để tiếp tục.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthModalOpen(true)}
                      className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Đăng Nhập Ngay
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate('home')}
                      className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Về Trang Chủ
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </Suspense>
      </main>

      {/* Main Footer (Ẩn trong phòng học) */}
      {currentView !== 'classroom' && (
        <Footer onNavigate={handleNavigate} homepageConfig={homepageConfig} />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        students={students}
      />

      {/* Giỏ hàng thanh toán nhiều khóa học */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartCourses}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onCheckoutCart={handleCheckoutCart}
        onSelectCourse={handleSelectCourse}
      />
    </div>
  );
}
