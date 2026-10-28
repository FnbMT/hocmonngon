import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from './services/storage';
import { FirebaseService } from './services/firebase';
import { PaymentService } from './services/paymentService';
import { Course, Instructor, Student, Enrollment, ChefQuestion } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { CourseCatalog } from './components/CourseCatalog';
import { CourseDetail } from './components/CourseDetail';
import { CheckoutPage } from './components/CheckoutPage';
import { TrialRegistration } from './components/TrialRegistration';
import { StudentDashboard } from './components/StudentDashboard';
import { ClassroomPlayer } from './components/ClassroomPlayer';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [courses, setCourses] = useState<Course[]>(StorageService.getCourses());
  const [instructors, setInstructors] = useState<Instructor[]>(StorageService.getInstructors());
  const [students, setStudents] = useState<Student[]>(StorageService.getStudents());
  const [enrollments, setEnrollments] = useState<Enrollment[]>(StorageService.getEnrollments());
  const [currentUser, setCurrentUser] = useState<Student | null>(StorageService.getCurrentUser());
  const [questions, setQuestions] = useState<ChefQuestion[]>(StorageService.getQuestions());

  // Navigation State
  const [currentView, setCurrentView] = useState<
    'home' | 'catalog' | 'course' | 'checkout' | 'trial' | 'dashboard' | 'classroom' | 'admin'
  >('home');

  const [selectedCourse, setSelectedCourse] = useState<Course>(courses[0]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>(undefined);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Catalog filter transfer params
  const [catalogChefId, setCatalogChefId] = useState<string | undefined>(undefined);
  const [catalogCategory, setCatalogCategory] = useState<string | undefined>(undefined);
  const [catalogSearch, setCatalogSearch] = useState<string | undefined>(undefined);

  // Refresh all state from storage
  const reloadData = useCallback(() => {
    setCourses(StorageService.getCourses());
    setInstructors(StorageService.getInstructors());
    setStudents(StorageService.getStudents());
    setEnrollments(StorageService.getEnrollments());
    setCurrentUser(StorageService.getCurrentUser());
    setQuestions(StorageService.getQuestions());
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      reloadData();
    };
    window.addEventListener('storage_data_updated', handleStorageChange);

    // Initial Firestore sync if configured
    if (FirebaseService.isConfigured()) {
      FirebaseService.loadAllFromFirestore().then(remoteData => {
        if (remoteData) {
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
            const currentEnrollments = StorageService.getEnrollments();
            const currentIds = new Set(currentEnrollments.map(e => e.id));
            const newEnrollments = remoteData.enrollments.filter(e => !currentIds.has(e.id));
            if (newEnrollments.length > 0) {
              const merged = [...currentEnrollments, ...newEnrollments];
              localStorage.setItem('hocmonngon_enrollments_v1', JSON.stringify(merged));
              updated = true;
            }
          }
          if (remoteData.homepageConfig) {
            StorageService.saveHomepageConfig(remoteData.homepageConfig);
          }
          if (remoteData.bankConfig) {
            PaymentService.saveBankConfig(remoteData.bankConfig);
          }
          if (remoteData.sepayConfig) {
            PaymentService.saveSePayConfig(remoteData.sepayConfig);
          }
          if (updated) {
            reloadData();
          }
        }
      }).catch(err => console.warn('Firestore initial sync skipped:', err));
    }

    return () => window.removeEventListener('storage_data_updated', handleStorageChange);
  }, [reloadData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Navigation handler
  const handleNavigate = (view: string, params?: Record<string, unknown>) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

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
        const found = courses.find(c => c.id === params.courseId);
        if (found) setSelectedCourse(found);
      }
      setCurrentView('course');
      return;
    }

    if (view === 'checkout') {
      if (params?.courseId) {
        const found = courses.find(c => c.id === params.courseId);
        if (found) setSelectedCourse(found);
      }
      setCurrentView('checkout');
      return;
    }

    if (view === 'trial') {
      if (currentUser) {
        // Học viên đã đăng ký tài khoản và đăng nhập khi bấm vào học thử miễn phí thì chuyển đến mục khóa học luôn
        setCurrentView('catalog');
        showToast(`Chào ${currentUser.name}! Bạn đã đăng nhập nên có thể xem trực tiếp các bài học thử.`);
        return;
      }
      if (params?.courseId) {
        const found = courses.find(c => c.id === params.courseId);
        if (found) setSelectedCourse(found);
      }
      setCurrentView('trial');
      return;
    }

    if (view === 'classroom') {
      if (params?.courseId) {
        const found = courses.find(c => c.id === params.courseId);
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
    setSelectedLessonId(lessonId || course.chapters[0]?.lessons[0]?.id);
    setCurrentView('classroom');
    showToast(`Đã kích hoạt quyền học thử miễn phí khóa "${course.title.split(' - ')[0]}"!`);
  };

  // Open Classroom Player
  const handleOpenPlayer = (course: Course, lessonId?: string) => {
    setSelectedCourse(course);
    setSelectedLessonId(lessonId);
    setCurrentView('classroom');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Free Trial Registration Form Success (from Trial Page)
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

    // Sync to Firebase if configured
    FirebaseService.syncStudentToFirebase(savedStudent);

    // Enroll in trial
    StorageService.enrollStudent({
      studentId: savedStudent.id,
      courseId: data.courseId,
      type: 'trial',
      price: 0
    });

    const targetCourse = courses.find(c => c.id === data.courseId) || selectedCourse;
    setSelectedCourse(targetCourse);
    setSelectedLessonId(targetCourse.chapters[0]?.lessons[0]?.id);
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

  // Payment Success (from Checkout Page)
  const handlePaymentSuccess = (studentData: { name: string; phone: string; email: string }) => {
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
      // update info
      student.name = studentData.name;
      student.phone = studentData.phone;
      student.email = studentData.email;
      StorageService.setCurrentUser(student);
    }

    // Sync to Firebase
    FirebaseService.syncStudentToFirebase(student);

    // Enroll paid
    StorageService.enrollStudent({
      studentId: student.id,
      courseId: selectedCourse.id,
      type: 'paid',
      price: selectedCourse.discountPrice
    });

    setCurrentView('dashboard');
    showToast(`🎉 Thanh toán thành công! Khóa học "${selectedCourse.title.split(' - ')[0]}" đã được mở khóa trọn đời.`);
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
      setCurrentView('admin');
      showToast(`Đăng nhập Quản Trị Viên thành công! Đã vào trang Quản lý học viên.`);
    } else if (user.role === 'instructor') {
      setCurrentView('admin');
      showToast(`Đăng nhập Giảng viên ${user.name} thành công! Đã vào cổng quản lý khóa học.`);
    } else {
      setCurrentView('dashboard');
      showToast(`Đăng nhập thành công với tài khoản ${user.name}!`);
    }
  };

  // Logout
  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    showToast('Đã đăng xuất tài khoản.');
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

      {/* Main Header (Hidden inside Classroom view for focus) */}
      {currentView !== 'classroom' && (
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onOpenAuth={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* View Routing */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            courses={courses}
            instructors={instructors}
            onSelectCourse={handleSelectCourse}
            onSelectTrial={handleSelectTrial}
            onNavigate={handleNavigate}
            onQuickTrialSubmit={handleQuickTrialSubmit}
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
              setCurrentView('checkout');
            }}
            onBack={() => setCurrentView(currentUser ? 'dashboard' : 'course')}
            onSendQuestion={handleSendQuestion}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            students={students}
            enrollments={enrollments}
            courses={courses}
            instructors={instructors}
            currentUser={currentUser || undefined}
            onRefreshData={reloadData}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Main Footer (Hidden inside Classroom view) */}
      {currentView !== 'classroom' && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Auth Modal (matching Image 7) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        students={students}
      />
    </div>
  );
}
