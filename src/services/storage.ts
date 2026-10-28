import { Course, Instructor, Student, StudentDiscount, Enrollment, Chapter, Lesson, ChefQuestion, FirebaseConfigState, HomepageConfig } from '../types';
import {
  INITIAL_INSTRUCTORS,
  INITIAL_COURSES,
  INITIAL_STUDENTS,
  INITIAL_ENROLLMENTS,
  INITIAL_QUESTIONS
} from '../data/mockData';

const KEYS = {
  INSTRUCTORS: 'hocmonngon_instructors_v1',
  COURSES: 'hocmonngon_courses_v1',
  STUDENTS: 'hocmonngon_students_v1',
  ENROLLMENTS: 'hocmonngon_enrollments_v1',
  CURRENT_USER: 'hocmonngon_current_user_v1',
  QUESTIONS: 'hocmonngon_questions_v1',
  FIREBASE_CONFIG: 'hocmonngon_firebase_config_v1',
  HOMEPAGE_CONFIG: 'hocmonngon_homepage_config_v1'
};

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  header: {
    brandName: 'Học Món Ngon',
    brandSubtitle: 'Bếp Trưởng Đào Tạo',
    hotline: '1900 8888'
  },
  hero: {
    topBadge: 'Học viện ẩm thực hàng đầu Việt Nam',
    title: 'Học nấu món ngon cùng những Đầu Bếp bạn tin tưởng',
    subtitle: 'Trải nghiệm phương pháp học trực tuyến đỉnh cao từ các Đầu Bếp tận tâm. Nắm vững bí quyết từ món truyền thống đến hiện đại với công thức chuẩn 100%.',
    ctaExploreText: 'Khám phá khóa học',
    ctaTrialText: 'Đăng ký học thử miễn phí',
    stats: {
      studentsCount: '15,000+',
      studentsLabel: 'Học viên tin tưởng',
      ratingValue: '4.9',
      ratingLabel: 'Đánh giá trung bình',
      chefsCount: '5+',
      chefsLabel: 'Đầu bếp lành nghề'
    }
  },
  trialSection: {
    badge: 'HOÀN TOÀN MIỄN PHÍ',
    title: 'Trải nghiệm học nấu ăn cùng giảng viên hàng đầu ngay hôm nay',
    subtitle: 'Đăng ký ngay để nhận ngay 3 bài học nấu ăn miễn phí từ các Đầu Bếp và tư vấn lộ trình học tập phù hợp nhất với mục tiêu của bạn.',
    buttonText: 'Nhận tài khoản học thử miễn phí ngay',
    fieldOptions: [
      'Món Việt truyền thống & Mở quán (Phở, Bún bò, Cơm tấm)',
      'Lươn Xứ Nghệ & Đặc sản mở quán',
      'Bánh Âu, Croissant & Tiệm bánh',
      'Dimsum, Nước lẩu & Món Á',
      'Ăn vặt & Đồ uống hot trend'
    ]
  },
  faq: {
    tag: 'HỎI ĐÁP',
    title: 'Câu hỏi thường gặp',
    subtitle: 'Giải đáp nhanh các thắc mắc về chương trình học và tài khoản',
    items: [
      {
        question: 'Chương trình học thử có thực sự hoàn toàn miễn phí không?',
        answer: 'Có! Bạn được truy cập ngay lập tức 3 bài học video chuẩn Full HD chất lượng cao, file PDF tóm tắt công thức và tham gia nhóm hỗ trợ học tập hoàn toàn không tốn bất kỳ chi phí nào.'
      },
      {
        question: 'Sau khi đăng ký bao lâu thì nhận được video bài học?',
        answer: 'Hệ thống tự động kích hoạt tài khoản ngay tức thì trong vòng 30 giây. Thông tin truy cập được hiển thị trực tiếp trên màn hình và gửi qua Zalo/Email của bạn.'
      },
      {
        question: 'Tôi có thể xem lại bài học bao nhiêu lần?',
        answer: 'Khi đăng ký khóa học trọn gói, bạn sở hữu quyền truy cập vĩnh viễn trọn đời, có thể xem lại bài giảng bất cứ lúc nào trên điện thoại, máy tính bảng hoặc laptop.'
      },
      {
        question: 'Tôi chưa từng nấu ăn bao giờ có thể tham gia được không?',
        answer: 'Các khóa học được thiết kế từ căn bản nhất, hướng dẫn chi tiết từng gram gia vị, cách cầm dao thái thịt, kiểm soát nhiệt độ lửa. Rất nhiều học viên chưa từng nấu ăn đã mở quán thành công.'
      },
      {
        question: 'Học viên có được hỗ trợ tư vấn mở quán kinh doanh ẩm thực không?',
        answer: 'Có! Bạn được tham gia nhóm Zalo kín hỗ trợ 1-1 trực tiếp cùng Bếp trưởng và đội ngũ trợ giảng, được hỗ trợ tính giá vốn (food cost), tư vấn mua sắm thiết bị bếp và chiến lược khai trương.'
      }
    ]
  },
  footer: {
    brandName: 'Học Món Ngon',
    brandBio: 'Nền tảng học nấu ăn trực tuyến hàng đầu Việt Nam. Kết nối bạn với những Bếp trưởng và chuyên gia hàng đầu để biến đam mê ẩm thực thành sự nghiệp kinh doanh thành công.',
    hotline: '0988 409 798 / 1900 8888',
    email: 'hocmonngon@gmail.com',
    address: '19 Lý Thường Kiệt, TP. Vinh & Hà Nội',
    facebookUrl: 'https://facebook.com',
    youtubeUrl: 'https://youtube.com',
    zaloUrl: 'https://zalo.me/0988409798',
    copyrightText: '© 2026 Học Món Ngon. Tất cả các quyền được bảo lưu.',
    securityBadge: 'Bảo mật SSL 256-bit'
  }
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key}:`, e);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('storage_data_updated'));
  } catch (e) {
    console.error(`Error writing ${key}:`, e);
  }
}

// Helper for non-blocking Firestore sync without circular dependency
const syncToFirebase = (action: () => Promise<unknown>) => {
  import('./firebase')
    .then(({ FirebaseService }) => {
      if (FirebaseService.isConfigured()) {
        action().catch(err => console.warn('Firestore sync failed:', err));
      }
    })
    .catch(err => console.warn('Failed to load FirebaseService:', err));
};

export const StorageService = {
  // Instructors
  getInstructors(): Instructor[] {
    const list = safeGet<Instructor[]>(KEYS.INSTRUCTORS, INITIAL_INSTRUCTORS);
    return list.map(inst => {
      const mock = INITIAL_INSTRUCTORS.find(m => m.id === inst.id);
      return {
        ...inst,
        username: inst.username || mock?.username,
        password: inst.password || mock?.password,
        email: inst.email || mock?.email,
        avatar: (inst.avatar && inst.avatar.trim()) ? inst.avatar : 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80'
      };
    });
  },
  getInstructorById(id: string): Instructor | undefined {
    return this.getInstructors().find(inst => inst.id === id);
  },
  findInstructorByCredentials(identifier: string, passwordInput?: string): Instructor | undefined {
    const clean = identifier.trim().toLowerCase();
    const cleanPhone = clean.replace(/[\s.-]/g, '');
    const instructors = this.getInstructors();

    const matched = instructors.find(inst => {
      const u = (inst.username || '').trim().toLowerCase();
      const e = (inst.email || '').trim().toLowerCase();
      const p = (inst.phone || '').trim().replace(/[\s.-]/g, '');
      return (u && u === clean) || (e && e === clean) || (p && p === cleanPhone);
    });

    if (!matched) return undefined;
    if (passwordInput !== undefined) {
      // If password provided, verify it (default to match if no password is set on record)
      if (matched.password && matched.password !== passwordInput) {
        return undefined;
      }
    }
    return matched;
  },
  setInstructorsFromRemote(instructors: Instructor[]): void {
    if (instructors && instructors.length > 0) {
      safeSet(KEYS.INSTRUCTORS, instructors);
    }
  },
  addInstructor(instructor: Instructor): void {
    const sanitized = {
      ...instructor,
      avatar: (instructor.avatar && instructor.avatar.trim()) ? instructor.avatar : 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80'
    };
    const list = this.getInstructors();
    list.unshift(sanitized);
    safeSet(KEYS.INSTRUCTORS, list);

    // Sync to Firestore immediately
    syncToFirebase(async () => {
      const { FirebaseService } = await import('./firebase');
      await FirebaseService.saveInstructor(sanitized);
    });
  },
  updateInstructor(instructor: Instructor): void {
    const sanitized = {
      ...instructor,
      avatar: (instructor.avatar && instructor.avatar.trim()) ? instructor.avatar : 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80'
    };
    const list = this.getInstructors().map(item => item.id === instructor.id ? sanitized : item);
    safeSet(KEYS.INSTRUCTORS, list);

    // Sync to Firestore immediately
    syncToFirebase(async () => {
      const { FirebaseService } = await import('./firebase');
      await FirebaseService.saveInstructor(sanitized);
    });
  },
  moveInstructor(id: string, direction: 'up' | 'down' | 'top'): Instructor[] {
    const list = [...this.getInstructors()];
    const index = list.findIndex(i => i.id === id);
    if (index === -1) return list;

    if (direction === 'top') {
      const [item] = list.splice(index, 1);
      list.unshift(item);
    } else if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }

    safeSet(KEYS.INSTRUCTORS, list);
    window.dispatchEvent(new Event('storage_data_updated'));
    return list;
  },
  reorderInstructors(newList: Instructor[]): void {
    safeSet(KEYS.INSTRUCTORS, newList);
    window.dispatchEvent(new Event('storage_data_updated'));
  },
  deleteInstructor(id: string): { chefName: string; deletedCoursesCount: number } {
    const instructors = this.getInstructors();
    const chef = instructors.find(item => item.id === id);
    const chefName = chef?.name || 'Giảng viên';

    // 1. Remove instructor locally
    const updatedInstructors = instructors.filter(item => item.id !== id);
    safeSet(KEYS.INSTRUCTORS, updatedInstructors);

    // 2. Cascade delete all courses belonging to this instructor locally
    const allCourses = this.getCourses();
    const coursesToDelete = allCourses.filter(c => c.instructorId === id);
    const updatedCourses = allCourses.filter(c => c.instructorId !== id);
    safeSet(KEYS.COURSES, updatedCourses);

    window.dispatchEvent(new Event('storage_data_updated'));

    // 3. Delete instructor document & cascade delete all their courses on Firestore
    syncToFirebase(async () => {
      const { FirebaseService } = await import('./firebase');
      await FirebaseService.deleteInstructor(id);
    });

    return {
      chefName,
      deletedCoursesCount: coursesToDelete.length
    };
  },

  // Courses
  getCourses(): Course[] {
    const list = safeGet<Course[]>(KEYS.COURSES, INITIAL_COURSES);
    const syntaxMap: Record<string, string> = {
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
    return list.map(c => ({
      ...c,
      transferSyntax: c.transferSyntax || syntaxMap[c.id] || (c.slug ? c.slug.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() : `KHOA${c.id.slice(-4).toUpperCase()}`),
      thumbnail: (c.thumbnail && c.thumbnail.trim()) ? c.thumbnail : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      instructorAvatar: (c.instructorAvatar && c.instructorAvatar.trim()) ? c.instructorAvatar : 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
      reviews: c.reviews?.map(r => {
        const rev = { ...r };
        if (!rev.avatar || !rev.avatar.trim()) delete rev.avatar;
        if (!rev.dishImage || !rev.dishImage.trim()) delete rev.dishImage;
        return rev;
      })
    }));
  },
  updateCourseTransferSyntax(courseId: string, syntax: string): void {
    const cleanSyntax = syntax.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const list = this.getCourses().map(c => {
      if (c.id === courseId) {
        return { ...c, transferSyntax: cleanSyntax };
      }
      return c;
    });
    safeSet(KEYS.COURSES, list);
    window.dispatchEvent(new Event('storage_data_updated'));
  },
  setCoursesFromRemote(courses: Course[]): void {
    if (courses && courses.length > 0) {
      safeSet(KEYS.COURSES, courses);
    }
  },
  setStudentsFromRemote(students: Student[]): void {
    if (students && students.length > 0) {
      safeSet(KEYS.STUDENTS, students);
    }
  },
  getCourseById(id: string): Course | undefined {
    return this.getCourses().find(c => c.id === id || c.slug === id);
  },
  addCourse(course: Course): void {
    const sanitized: Course = {
      ...course,
      thumbnail: (course.thumbnail && course.thumbnail.trim()) ? course.thumbnail : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      instructorAvatar: (course.instructorAvatar && course.instructorAvatar.trim()) ? course.instructorAvatar : 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
      reviews: course.reviews?.map(r => ({
        ...r,
        avatar: (r.avatar && r.avatar.trim()) ? r.avatar : undefined,
        dishImage: (r.dishImage && r.dishImage.trim()) ? r.dishImage : undefined
      }))
    };
    const list = this.getCourses();
    list.unshift(sanitized);
    safeSet(KEYS.COURSES, list);
    
    // Update instructor courseCount
    const instructors = this.getInstructors().map(inst => {
      if (inst.id === course.instructorId) {
        return { ...inst, courseCount: (inst.courseCount || 0) + 1 };
      }
      return inst;
    });
    safeSet(KEYS.INSTRUCTORS, instructors);
    window.dispatchEvent(new Event('storage_data_updated'));

    // Sync to Firestore
    syncToFirebase(async () => {
      const { FirebaseService } = await import('./firebase');
      await FirebaseService.saveCourse(sanitized);
    });
  },
  updateCourse(course: Course): void {
    const sanitized: Course = {
      ...course,
      thumbnail: (course.thumbnail && course.thumbnail.trim()) ? course.thumbnail : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      instructorAvatar: (course.instructorAvatar && course.instructorAvatar.trim()) ? course.instructorAvatar : 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
      reviews: course.reviews?.map(r => ({
        ...r,
        avatar: (r.avatar && r.avatar.trim()) ? r.avatar : undefined,
        dishImage: (r.dishImage && r.dishImage.trim()) ? r.dishImage : undefined
      }))
    };
    const list = this.getCourses().map(c => c.id === course.id ? sanitized : c);
    safeSet(KEYS.COURSES, list);
    window.dispatchEvent(new Event('storage_data_updated'));

    // Sync to Firestore
    syncToFirebase(async () => {
      const { FirebaseService } = await import('./firebase');
      await FirebaseService.saveCourse(sanitized);
    });
  },
  deleteCourse(id: string): void {
    const allCourses = this.getCourses();
    const targetCourse = allCourses.find(c => c.id === id);
    const updatedCourses = allCourses.filter(c => c.id !== id);
    safeSet(KEYS.COURSES, updatedCourses);

    if (targetCourse) {
      const instructors = this.getInstructors().map(inst => {
        if (inst.id === targetCourse.instructorId) {
          return { ...inst, courseCount: Math.max(0, (inst.courseCount || 1) - 1) };
        }
        return inst;
      });
      safeSet(KEYS.INSTRUCTORS, instructors);
    }
    window.dispatchEvent(new Event('storage_data_updated'));

    // Delete course document on Firestore
    syncToFirebase(async () => {
      const { FirebaseService } = await import('./firebase');
      await FirebaseService.deleteCourse(id);
    });
  },

  // Categories
  getCategories(): string[] {
    const DEFAULT_CATEGORIES = ['Mở quán kinh doanh', 'Lươn Xứ Nghệ', 'Bánh Canh', 'Đồ Nhậu', 'Công thức'];
    const list = safeGet<string[]>('hocmonngon_categories_v1', DEFAULT_CATEGORIES);
    return list && list.length > 0 ? list : DEFAULT_CATEGORIES;
  },
  addCategory(category: string): string[] {
    const clean = category.trim();
    if (!clean) return this.getCategories();
    const list = [...this.getCategories()];
    if (!list.some(c => c.trim().toLowerCase() === clean.toLowerCase())) {
      list.push(clean);
      safeSet('hocmonngon_categories_v1', list);
      window.dispatchEvent(new Event('storage_data_updated'));
    }
    return list;
  },
  deleteCategory(category: string): string[] {
    const target = category.trim().toLowerCase();
    const list = this.getCategories().filter(c => c.trim().toLowerCase() !== target);
    safeSet('hocmonngon_categories_v1', list);
    window.dispatchEvent(new Event('storage_data_updated'));
    return list;
  },

  // Chapters & Lessons Management
  addChapter(courseId: string, title: string): Chapter {
    const course = this.getCourseById(courseId);
    if (!course) throw new Error('Course not found');
    const newChap: Chapter = {
      id: 'chap-' + Date.now(),
      courseId,
      title: title.trim(),
      order: course.chapters.length + 1,
      isFree: true,
      lessons: []
    };
    course.chapters.push(newChap);
    this.updateCourse(course);
    return newChap;
  },
  deleteChapter(courseId: string, chapterId: string): void {
    const course = this.getCourseById(courseId);
    if (!course) return;
    course.chapters = course.chapters.filter(c => c.id !== chapterId);
    this.updateCourse(course);
  },
  toggleChapterFree(courseId: string, chapterId: string, isFree: boolean): void {
    const course = this.getCourseById(courseId);
    if (!course) return;
    course.chapters = course.chapters.map(chap => {
      if (chap.id === chapterId) {
        // If chapter is marked as not free, all lessons inside it MUST be not free
        const updatedLessons = isFree
          ? chap.lessons
          : chap.lessons.map(l => ({ ...l, isFreeTrial: false }));
        return {
          ...chap,
          isFree,
          lessons: updatedLessons
        };
      }
      return chap;
    });
    this.updateCourse(course);
  },
  toggleLessonFree(courseId: string, lessonId: string): void {
    const course = this.getCourseById(courseId);
    if (!course) return;
    course.chapters = course.chapters.map(chap => {
      // If the parent chapter is NOT free, lessons cannot be free
      if (chap.isFree === false) {
        return chap;
      }
      const hasLesson = chap.lessons.some(l => l.id === lessonId);
      if (hasLesson) {
        return {
          ...chap,
          lessons: chap.lessons.map(l => {
            if (l.id === lessonId) {
              return { ...l, isFreeTrial: !l.isFreeTrial };
            }
            return l;
          })
        };
      }
      return chap;
    });
    this.updateCourse(course);
  },
  toggleLessonDocPaid(courseId: string, lessonId: string): void {
    const course = this.getCourseById(courseId);
    if (!course) return;
    course.chapters = course.chapters.map(chap => {
      const hasLesson = chap.lessons.some(l => l.id === lessonId);
      if (hasLesson) {
        return {
          ...chap,
          lessons: chap.lessons.map(l => {
            if (l.id === lessonId) {
              return { ...l, requirePaymentForDoc: !l.requirePaymentForDoc };
            }
            return l;
          })
        };
      }
      return chap;
    });
    this.updateCourse(course);
  },
  deleteLesson(courseId: string, lessonId: string): void {
    const course = this.getCourseById(courseId);
    if (!course) return;
    course.chapters = course.chapters.map(chap => ({
      ...chap,
      lessons: chap.lessons.filter(l => l.id !== lessonId)
    }));
    this.updateCourse(course);
  },
  addLesson(courseId: string, chapterId: string, lesson: Lesson): { course: Course; chapter: Chapter; lesson: Lesson } {
    const course = this.getCourseById(courseId);
    if (!course) throw new Error('Course not found');
    if (!course.chapters) course.chapters = [];

    let targetChap = course.chapters.find(c => c.id === chapterId);
    if (!targetChap) {
      if (course.chapters.length > 0) {
        targetChap = course.chapters[0];
      } else {
        targetChap = {
          id: 'chap-' + Date.now(),
          courseId,
          title: 'Chương 1 : Nội dung bài học',
          order: 1,
          isFree: true,
          lessons: []
        };
        course.chapters.push(targetChap);
      }
    }

    const sanitizedLesson: Lesson = {
      ...lesson,
      id: lesson.id || ('les-' + Date.now()),
      chapterId: targetChap.id,
      order: lesson.order || (targetChap.lessons.length + 1)
    };

    targetChap.lessons.push(sanitizedLesson);
    this.updateCourse(course);
    return { course, chapter: targetChap, lesson: sanitizedLesson };
  },
  updateChapter(courseId: string, updatedChapter: Chapter): void {
    const course = this.getCourseById(courseId);
    if (!course) return;
    course.chapters = course.chapters.map(chap => chap.id === updatedChapter.id ? updatedChapter : chap);
    this.updateCourse(course);
  },

  // Students
  getStudents(): Student[] {
    const list = safeGet<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    return list.map(s => ({
      ...s,
      avatar: (s.avatar && s.avatar.trim()) ? s.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
    }));
  },
  getStudentById(id: string): Student | undefined {
    return this.getStudents().find(s => s.id === id || s.email === id);
  },
  findStudentByPhone(phone: string): Student | undefined {
    const clean = phone.trim().replace(/[\s.-]/g, '');
    if (!clean) return undefined;
    return this.getStudents().find(s => s.phone && s.phone.replace(/[\s.-]/g, '') === clean);
  },
  findStudentByEmail(email: string): Student | undefined {
    const clean = email.trim().toLowerCase();
    if (!clean) return undefined;
    return this.getStudents().find(s => s.email && s.email.toLowerCase() === clean);
  },
  addStudent(student: Student): Student {
    const list = this.getStudents();
    const cleanPhone = student.phone ? student.phone.trim().replace(/[\s.-]/g, '') : '';
    const cleanEmail = student.email ? student.email.trim().toLowerCase() : '';

    const sanitizedStudent: Student = {
      ...student,
      avatar: (student.avatar && student.avatar.trim()) ? student.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
    };

    const existing = list.find(s => {
      const sPhone = s.phone ? s.phone.trim().replace(/[\s.-]/g, '') : '';
      const sEmail = s.email ? s.email.trim().toLowerCase() : '';
      return (cleanEmail && sEmail === cleanEmail) || (cleanPhone && sPhone === cleanPhone);
    });

    if (existing) {
      const updated: Student = {
        ...existing,
        name: sanitizedStudent.name || existing.name,
        phone: sanitizedStudent.phone || existing.phone,
        email: sanitizedStudent.email || existing.email,
        goal: sanitizedStudent.goal || existing.goal,
        avatar: sanitizedStudent.avatar || existing.avatar
      };
      const updatedList = list.map(item => item.id === existing.id ? updated : item);
      safeSet(KEYS.STUDENTS, updatedList);

      syncToFirebase(async () => {
        const { FirebaseService } = await import('./firebase');
        await FirebaseService.syncStudentToFirebase(updated);
      });

      return updated;
    }
    list.unshift(sanitizedStudent);
    safeSet(KEYS.STUDENTS, list);

    syncToFirebase(async () => {
      const { FirebaseService } = await import('./firebase');
      await FirebaseService.syncStudentToFirebase(sanitizedStudent);
    });

    return sanitizedStudent;
  },
  deleteStudent(id: string): { studentName: string; deletedEnrollmentsCount: number } {
    const students = this.getStudents();
    const student = students.find(s => s.id === id);
    const studentName = student?.name || 'Học viên';

    // 1. Remove student locally
    const updatedStudents = students.filter(s => s.id !== id);
    safeSet(KEYS.STUDENTS, updatedStudents);

    // 2. Cascade delete all enrollments belonging to this student locally
    const allEnrollments = this.getEnrollments();
    const enrollmentsToDelete = allEnrollments.filter(e => e.studentId === id);
    const updatedEnrollments = allEnrollments.filter(e => e.studentId !== id);
    safeSet(KEYS.ENROLLMENTS, updatedEnrollments);

    // 3. Reset currentUser if they were deleted
    const currentUser = safeGet<Student | null>(KEYS.CURRENT_USER, null);
    if (currentUser && currentUser.id === id) {
      if (updatedStudents.length > 0) {
        safeSet(KEYS.CURRENT_USER, updatedStudents[0]);
      } else {
        localStorage.removeItem(KEYS.CURRENT_USER);
      }
    }

    window.dispatchEvent(new Event('storage_data_updated'));

    // 4. Cascade delete student and all their enrollments on Firestore
    syncToFirebase(async () => {
      const { FirebaseService } = await import('./firebase');
      await FirebaseService.deleteStudent(id);
    });

    return {
      studentName,
      deletedEnrollmentsCount: enrollmentsToDelete.length
    };
  },

  // Student Discounts / Vouchers
  addStudentDiscount(studentId: string, discount: Omit<StudentDiscount, 'id' | 'createdAt'>): StudentDiscount {
    const students = this.getStudents();
    const target = students.find(s => s.id === studentId);
    if (!target) throw new Error('Student not found');

    const newDiscount: StudentDiscount = {
      ...discount,
      id: 'disc-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    const existingDiscounts = target.discounts || [];
    target.discounts = [newDiscount, ...existingDiscounts];

    const updatedStudents = students.map(s => s.id === studentId ? target : s);
    safeSet(KEYS.STUDENTS, updatedStudents);

    // Update currentUser if matching
    const currentUser = safeGet<Student | null>(KEYS.CURRENT_USER, null);
    if (currentUser && currentUser.id === studentId) {
      safeSet(KEYS.CURRENT_USER, target);
    }

    window.dispatchEvent(new Event('storage_data_updated'));

    syncToFirebase(async () => {
      const { FirebaseService } = await import('./firebase');
      await FirebaseService.syncStudentToFirebase(target);
    });

    return newDiscount;
  },

  deleteStudentDiscount(studentId: string, discountId: string): void {
    const students = this.getStudents();
    const target = students.find(s => s.id === studentId);
    if (!target) return;

    target.discounts = (target.discounts || []).filter(d => d.id !== discountId);

    const updatedStudents = students.map(s => s.id === studentId ? target : s);
    safeSet(KEYS.STUDENTS, updatedStudents);

    const currentUser = safeGet<Student | null>(KEYS.CURRENT_USER, null);
    if (currentUser && currentUser.id === studentId) {
      safeSet(KEYS.CURRENT_USER, target);
    }

    window.dispatchEvent(new Event('storage_data_updated'));

    syncToFirebase(async () => {
      const { FirebaseService } = await import('./firebase');
      await FirebaseService.syncStudentToFirebase(target);
    });
  },

  deleteEnrollment(enrollmentId: string): void {
    const enrollments = this.getEnrollments();
    const target = enrollments.find(e => e.id === enrollmentId);
    if (!target) return;

    const updatedEnrollments = enrollments.filter(e => e.id !== enrollmentId);
    safeSet(KEYS.ENROLLMENTS, updatedEnrollments);

    // Update studentCount on course
    const courses = this.getCourses().map(c => {
      if (c.id === target.courseId) {
        return { ...c, studentCount: Math.max(0, (c.studentCount || 1) - 1) };
      }
      return c;
    });
    safeSet(KEYS.COURSES, courses);

    window.dispatchEvent(new Event('storage_data_updated'));

    syncToFirebase(async () => {
      const { FirebaseService } = await import('./firebase');
      await FirebaseService.deleteEnrollment(enrollmentId);
    });
  },

  // Current User
  getCurrentUser(): Student {
    // Default to Minh Hoàng as seen in screenshots
    const defaultUser = INITIAL_STUDENTS[0];
    const user = safeGet<Student>(KEYS.CURRENT_USER, defaultUser);
    return {
      ...user,
      avatar: (user.avatar && user.avatar.trim()) ? user.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
    };
  },
  setCurrentUser(user: Student | null): void {
    if (user) {
      const sanitized = {
        ...user,
        avatar: (user.avatar && user.avatar.trim()) ? user.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
      };
      safeSet(KEYS.CURRENT_USER, sanitized);
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
      window.dispatchEvent(new Event('storage_data_updated'));
    }
  },

  // Enrollments
  getEnrollments(): Enrollment[] {
    const list = safeGet<Enrollment[]>(KEYS.ENROLLMENTS, INITIAL_ENROLLMENTS);
    return list.map(e => ({
      ...e,
      thumbnail: (e.thumbnail && e.thumbnail.trim()) ? e.thumbnail : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
    }));
  },
  getStudentEnrollments(studentId: string): Enrollment[] {
    return this.getEnrollments().filter(e => e.studentId === studentId);
  },
  enrollStudent(params: {
    studentId: string;
    courseId: string;
    type: 'trial' | 'paid';
    price: number;
  }): Enrollment {
    const enrollments = this.getEnrollments();
    const course = this.getCourseById(params.courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check existing enrollment
    const existingIndex = enrollments.findIndex(
      e => e.studentId === params.studentId && e.courseId === params.courseId
    );

    if (existingIndex >= 0) {
      // If upgraded from trial to paid
      if (params.type === 'paid' && enrollments[existingIndex].type === 'trial') {
        enrollments[existingIndex].type = 'paid';
        enrollments[existingIndex].pricePaid = params.price;
        enrollments[existingIndex].status = 'active';
        enrollments[existingIndex].trialExpiresAt = undefined;
        safeSet(KEYS.ENROLLMENTS, enrollments);
        return enrollments[existingIndex];
      }
      return enrollments[existingIndex];
    }

    const newEnrollment: Enrollment = {
      id: 'enr-' + Date.now(),
      studentId: params.studentId,
      courseId: course.id,
      courseTitle: course.title,
      instructorName: course.instructorName,
      thumbnail: course.thumbnail,
      enrolledAt: new Date().toISOString().split('T')[0],
      type: params.type,
      pricePaid: params.price,
      completedLessonIds: [],
      lastActiveAt: 'Vừa xong',
      trialExpiresAt: params.type === 'trial' ? 'Còn 5 ngày' : undefined,
      status: 'active'
    };

    enrollments.unshift(newEnrollment);
    safeSet(KEYS.ENROLLMENTS, enrollments);

    // Update course studentCount
    const courses = this.getCourses().map(c => {
      if (c.id === course.id) {
        return { ...c, studentCount: (c.studentCount || 0) + 1 };
      }
      return c;
    });
    safeSet(KEYS.COURSES, courses);

    return newEnrollment;
  },
  toggleLessonCompletion(enrollmentId: string, lessonId: string): void {
    const enrollments = this.getEnrollments();
    const index = enrollments.findIndex(e => e.id === enrollmentId);
    if (index >= 0) {
      const enr = enrollments[index];
      const hasCompleted = enr.completedLessonIds.includes(lessonId);
      if (hasCompleted) {
        enr.completedLessonIds = enr.completedLessonIds.filter(id => id !== lessonId);
      } else {
        enr.completedLessonIds.push(lessonId);
      }
      enr.lastLessonId = lessonId;
      enr.lastActiveAt = 'Vừa xong';
      safeSet(KEYS.ENROLLMENTS, enrollments);
    }
  },

  // Questions
  getQuestions(): ChefQuestion[] {
    return safeGet<ChefQuestion[]>(KEYS.QUESTIONS, INITIAL_QUESTIONS);
  },
  addQuestion(question: Omit<ChefQuestion, 'id' | 'createdAt' | 'status'>): ChefQuestion {
    const list = this.getQuestions();
    const newQ: ChefQuestion = {
      ...question,
      id: 'q-' + Date.now(),
      createdAt: 'Vừa xong',
      status: 'pending'
    };
    list.unshift(newQ);
    safeSet(KEYS.QUESTIONS, list);
    return newQ;
  },
  replyQuestion(id: string, replyText: string): void {
    const list = this.getQuestions().map(q => {
      if (q.id === id) {
        return {
          ...q,
          status: 'answered' as const,
          reply: replyText,
          answeredAt: 'Vừa xong'
        };
      }
      return q;
    });
    safeSet(KEYS.QUESTIONS, list);
  },

  // Firebase Config
  getFirebaseConfig(): FirebaseConfigState {
    return safeGet<FirebaseConfigState>(KEYS.FIREBASE_CONFIG, {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      isConnected: false
    });
  },
  saveFirebaseConfig(config: FirebaseConfigState): void {
    safeSet(KEYS.FIREBASE_CONFIG, config);
  },

  // Homepage & Landing Page Display Config
  getHomepageConfig(): HomepageConfig {
    const saved = safeGet<HomepageConfig>(KEYS.HOMEPAGE_CONFIG, DEFAULT_HOMEPAGE_CONFIG);
    return {
      ...DEFAULT_HOMEPAGE_CONFIG,
      ...saved,
      header: { ...DEFAULT_HOMEPAGE_CONFIG.header, ...(saved?.header || {}) },
      hero: {
        ...DEFAULT_HOMEPAGE_CONFIG.hero,
        ...(saved?.hero || {}),
        stats: { ...DEFAULT_HOMEPAGE_CONFIG.hero.stats, ...(saved?.hero?.stats || {}) }
      },
      trialSection: {
        ...DEFAULT_HOMEPAGE_CONFIG.trialSection,
        ...(saved?.trialSection || {}),
        fieldOptions: saved?.trialSection?.fieldOptions || DEFAULT_HOMEPAGE_CONFIG.trialSection.fieldOptions
      },
      faq: {
        ...DEFAULT_HOMEPAGE_CONFIG.faq,
        ...(saved?.faq || {}),
        items: saved?.faq?.items || DEFAULT_HOMEPAGE_CONFIG.faq.items
      },
      footer: { ...DEFAULT_HOMEPAGE_CONFIG.footer, ...(saved?.footer || {}) }
    };
  },

  saveHomepageConfig(config: HomepageConfig): void {
    safeSet(KEYS.HOMEPAGE_CONFIG, config);
    window.dispatchEvent(new Event('homepage_config_updated'));
    syncToFirebase(async () => {
      const { FirebaseService } = await import('./firebase');
      await FirebaseService.syncHomepageConfigToFirebase(config);
    });
  },

  resetHomepageConfig(): HomepageConfig {
    safeSet(KEYS.HOMEPAGE_CONFIG, DEFAULT_HOMEPAGE_CONFIG);
    window.dispatchEvent(new Event('homepage_config_updated'));
    syncToFirebase(async () => {
      const { FirebaseService } = await import('./firebase');
      await FirebaseService.syncHomepageConfigToFirebase(DEFAULT_HOMEPAGE_CONFIG);
    });
    return DEFAULT_HOMEPAGE_CONFIG;
  },

  // Reset
  resetDefaults(): void {
    localStorage.clear();
    safeSet(KEYS.INSTRUCTORS, INITIAL_INSTRUCTORS);
    safeSet(KEYS.COURSES, INITIAL_COURSES);
    safeSet(KEYS.STUDENTS, INITIAL_STUDENTS);
    safeSet(KEYS.ENROLLMENTS, INITIAL_ENROLLMENTS);
    safeSet(KEYS.QUESTIONS, INITIAL_QUESTIONS);
    safeSet(KEYS.CURRENT_USER, INITIAL_STUDENTS[0]);
    window.dispatchEvent(new Event('storage_data_updated'));
  }
};
