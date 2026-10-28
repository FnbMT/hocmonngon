import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Users, 
  ChefHat, 
  BookOpen, 
  Plus, 
  Search, 
  CheckCircle2, 
  Lock, 
  Play, 
  Star,
  Trash2, 
  Database, 
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Check,
  RefreshCw,
  Video,
  FileText,
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  X,
  SwitchCamera,
  ShieldAlert,
  ChevronDown,
  ExternalLink,
  Pencil,
  Gift,
  Tag,
  Percent,
  Eye,
  EyeOff,
  ShieldCheck,
  UserX,
  Calendar,
  Award,
  Mail,
  Phone,
  Clock,
  CreditCard,
  CheckCheck,
  Copy,
  GraduationCap,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  Shuffle,
  Layout
} from 'lucide-react';
import { Course, Instructor, Student, StudentDiscount, Enrollment, Chapter, Lesson, FirebaseConfigState, Review } from '../types';
import { StorageService } from '../services/storage';
import { FirebaseService } from '../services/firebase';
import { PaymentService } from '../services/paymentService';
import { compressImage, formatFileSize } from '../utils/imageCompressor';
import { toYouTubeEmbedUrl, extractYouTubeId, DEFAULT_YOUTUBE_ID } from '../utils/youtube';
import { AdminPaymentSettings } from './AdminPaymentSettings';
import { AdminHomepageSettings } from './AdminHomepageSettings';

interface AdminDashboardProps {
  students: Student[];
  enrollments: Enrollment[];
  courses: Course[];
  instructors: Instructor[];
  currentUser?: Student;
  onRefreshData: () => void;
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  enrollments,
  courses,
  instructors,
  currentUser,
  onRefreshData,
  onNavigate
}) => {
  const isInstructor = currentUser?.role === 'instructor';
  const currentInstructorId = currentUser?.instructorId;
  const currentInstructorProfile = instructors.find(i => i.id === currentInstructorId);

  // Scoped lists: If instructor, strictly isolate to their own courses, enrollments, students and revenue
  const scopedCourses = useMemo(() => {
    if (isInstructor && currentInstructorId) {
      return courses.filter(c => c.instructorId === currentInstructorId);
    }
    return courses;
  }, [courses, isInstructor, currentInstructorId]);

  const scopedEnrollments = useMemo(() => {
    if (isInstructor) {
      const courseIds = new Set(scopedCourses.map(c => c.id));
      return enrollments.filter(e => courseIds.has(e.courseId));
    }
    return enrollments;
  }, [enrollments, scopedCourses, isInstructor]);

  const scopedStudents = useMemo(() => {
    if (isInstructor) {
      const studentIds = new Set(scopedEnrollments.map(e => e.studentId));
      return students.filter(s => studentIds.has(s.id));
    }
    return students;
  }, [students, scopedEnrollments, isInstructor]);

  const scopedRevenue = useMemo(() => {
    return scopedEnrollments
      .filter(e => e.type === 'paid')
      .reduce((sum, e) => sum + (e.pricePaid || 0), 0);
  }, [scopedEnrollments]);

  const [activeTab, setActiveTab] = useState<'students' | 'instructors' | 'courses' | 'homepage' | 'payment' | 'firebase'>(
    isInstructor ? 'courses' : 'students'
  );

  // Search & Filter for Students
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [enrollmentTypeFilter, setEnrollmentTypeFilter] = useState('all');

  // Modal states
  const [showAddInstructorModal, setShowAddInstructorModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<Course>(
    scopedCourses[0] || courses[0] || null
  );

  // New Instructor Form (including username and password requested by user)
  const [newInstName, setNewInstName] = useState('');
  const [newInstTitle, setNewInstTitle] = useState('');
  const [newInstSpecialty, setNewInstSpecialty] = useState('');
  const [newInstAvatar, setNewInstAvatar] = useState('https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80');
  const [newInstBio, setNewInstBio] = useState('');
  const [newInstPhone, setNewInstPhone] = useState('');
  const [newInstZalo, setNewInstZalo] = useState('');
  const [newInstUsername, setNewInstUsername] = useState('');
  const [newInstPassword, setNewInstPassword] = useState('');
  const [newInstEmail, setNewInstEmail] = useState('');
  const [showNewInstPassword, setShowNewInstPassword] = useState(false);

  // Edit Instructor State
  const [showEditInstructorModal, setShowEditInstructorModal] = useState(false);
  const [editingChef, setEditingChef] = useState<Instructor | null>(null);
  const [editInstName, setEditInstName] = useState('');
  const [editInstTitle, setEditInstTitle] = useState('');
  const [editInstSpecialty, setEditInstSpecialty] = useState('');
  const [editInstAvatar, setEditInstAvatar] = useState('');
  const [editInstBio, setEditInstBio] = useState('');
  const [editInstPhone, setEditInstPhone] = useState('');
  const [editInstZalo, setEditInstZalo] = useState('');
  const [editInstUsername, setEditInstUsername] = useState('');
  const [editInstPassword, setEditInstPassword] = useState('');
  const [editInstEmail, setEditInstEmail] = useState('');
  const [showEditInstPassword, setShowEditInstPassword] = useState(false);

  // Instructor Avatar Upload / Camera / Compression State
  const [instAvatarMode, setInstAvatarMode] = useState<'upload' | 'camera' | 'url'>('upload');
  const [instCompressionStats, setInstCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    percentSaved: number;
  } | null>(null);
  const [isInstCompressing, setIsInstCompressing] = useState(false);
  const instFileInputRef = useRef<HTMLInputElement | null>(null);
  const instNativeCameraRef = useRef<HTMLInputElement | null>(null);

  // Categories management state (Requirement 1)
  const [categories, setCategories] = useState<string[]>(StorageService.getCategories());
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [categoryToDeleteConfirm, setCategoryToDeleteConfirm] = useState<string | null>(null);
  const [categoryFeedback, setCategoryFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Course Form (Requirement 1 & 3)
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseInstructorId, setNewCourseInstructorId] = useState(instructors[0]?.id || '');
  const [newCourseCategory, setNewCourseCategory] = useState(categories[0] || 'Mở quán kinh doanh');
  const [newCourseOriginalPrice, setNewCourseOriginalPrice] = useState(1500000);
  const [newCourseDiscountPrice, setNewCourseDiscountPrice] = useState(790000);
  const [newCourseLevel, setNewCourseLevel] = useState('Mở quán kinh doanh');
  const [newCourseDuration, setNewCourseDuration] = useState(4.0);
  const [newCourseThumbnail, setNewCourseThumbnail] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseBadge, setNewCourseBadge] = useState<string>('Bán chạy nhất');
  const [newCourseBadgeColor, setNewCourseBadgeColor] = useState<'red' | 'dark' | 'amber' | 'emerald' | 'purple' | 'blue'>('red');
  const [customBadgeText, setCustomBadgeText] = useState('');
  const [customBadgeColor, setCustomBadgeColor] = useState<'red' | 'dark' | 'amber' | 'emerald' | 'purple' | 'blue'>('red');
  const [newCourseTransferSyntax, setNewCourseTransferSyntax] = useState('');

  // Detailed Course Fields for Student View (Requirement 3)
  const [newCoursePreviewVideoUrl, setNewCoursePreviewVideoUrl] = useState('https://www.youtube.com/embed/Pj13k8Lq0jQ');
  const [newCourseInclusions, setNewCourseInclusions] = useState<string[]>([
    'Video bài học chuẩn Full HD trọn đời',
    'File PDF công thức gram chuẩn cho 50 - 200 bát',
    'Bảng tính giá vốn Excel tự động',
    'Nhóm Zalo hỗ trợ 1-1 cùng Giảng viên',
    'Cam kết hoàn tiền 100% trong 7 ngày'
  ]);
  const [newInclusionText, setNewInclusionText] = useState('');
  const [newCourseBenefits, setNewCourseBenefits] = useState<{
    icon: string;
    title: string;
    description: string;
  }[]>([
    {
      icon: 'droplets',
      title: 'Công thức độc quyền 100%',
      description: 'Chuẩn gram vị không dùng chất tạo ngọt phụ gia.'
    },
    {
      icon: 'calculator',
      title: 'Kiểm soát chi phí & Giá vốn',
      description: 'Tối ưu hóa lợi nhuận kinh doanh quán ăn.'
    },
    {
      icon: 'utensils',
      title: 'Kỹ thuật chế biến đỉnh cao',
      description: 'Quy trình sơ chế khử mùi tanh và lấy trọn vị thơm ngon.'
    },
    {
      icon: 'zap',
      title: 'Quy trình ra món siêu tốc 45s',
      description: 'Sắp xếp quầy bếp khoa học phục vụ nhanh giờ cao điểm.'
    }
  ]);
  const [newCoursePdfUrl, setNewCoursePdfUrl] = useState('https://drive.google.com/file/d/sample-cong-thuc');
  const [newCourseExcelUrl, setNewCourseExcelUrl] = useState('https://docs.google.com/spreadsheets/sample-tinh-cost');
  const [newCourseZaloLink, setNewCourseZaloLink] = useState('https://zalo.me/g/hocmonngon-support');

  // Course Thumbnail Image Compression & Upload/Camera State (Requirement 1)
  const [thumbnailInputMode, setThumbnailInputMode] = useState<'upload' | 'camera' | 'url'>('upload');
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    percentSaved: number;
  } | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraTarget, setCameraTarget] = useState<'course' | 'instructor'>('course');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Chapters & Lessons State for Add Lesson Form (Requirement 2)
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonChapterId, setNewLessonChapterId] = useState(selectedCourseForLessons?.chapters[0]?.id || '');
  const [newLessonDuration, setNewLessonDuration] = useState(20);
  const [newLessonIsFree, setNewLessonIsFree] = useState(false);
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('https://www.youtube.com/embed/Pj13k8Lq0jQ');
  const [newLessonDocUrl, setNewLessonDocUrl] = useState('https://drive.google.com/file/sample-cong-thuc');
  const [newLessonRecipeText, setNewLessonRecipeText] = useState('');
  const [newLessonRequirePaymentForDoc, setNewLessonRequirePaymentForDoc] = useState(false); // Toggle Link Tài liệu

  // Chapter & Lesson Deletion Confirmation & Edit Modal States
  const [chapterToDeleteConfirm, setChapterToDeleteConfirm] = useState<string | null>(null);
  const [lessonToDeleteConfirm, setLessonToDeleteConfirm] = useState<string | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [showEditChapterModal, setShowEditChapterModal] = useState(false);
  const [editingChapterNewLessonTitle, setEditingChapterNewLessonTitle] = useState('');

  // Video tester modal state
  const [videoTestUrl, setVideoTestUrl] = useState<string | null>(null);

  // Reviews for New Course (Yêu cầu: Thêm đánh giá từ học viên bao gồm ảnh, thông tin đánh giá)
  const [newCourseReviews, setNewCourseReviews] = useState<Review[]>([
    {
      id: 'rev-sample-1',
      courseId: '',
      author: 'Minh Hoàng',
      role: 'Chủ quán ăn tại Đà Nẵng',
      rating: 5,
      comment: 'Khóa học cực kỳ chi tiết và thực tế. Nhờ công thức chuẩn vị và bảng tính giá cost của Bếp trưởng mà quán mình đã khai trương thuận lợi, khách khen ngon và quay lại liên tục!',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      dishImage: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 'rev-sample-2',
      courseId: '',
      author: 'Thu Hương',
      role: 'Học viên mở quán tại TP. Hồ Chí Minh',
      rating: 5,
      comment: 'Ban đầu mình sợ phức tạp, nhưng Giảng viên hướng dẫn từng li từng tí, từ cách chọn nguyên liệu đến kỹ thuật ninh và nêm nếm. Rất đáng tiền đầu tư!',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      dishImage: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=500&q=80'
    }
  ]);
  const [showAddReviewInline, setShowAddReviewInline] = useState(false);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRole, setReviewRole] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAvatar, setReviewAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80');
  const [reviewDishImage, setReviewDishImage] = useState('https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=500&q=80');
  const [isReviewAvatarCompressing, setIsReviewAvatarCompressing] = useState(false);
  const [isReviewDishCompressing, setIsReviewDishCompressing] = useState(false);

  const reviewAvatarFileRef = useRef<HTMLInputElement | null>(null);
  const reviewAvatarCameraRef = useRef<HTMLInputElement | null>(null);
  const reviewDishFileRef = useRef<HTMLInputElement | null>(null);
  const reviewDishCameraRef = useRef<HTMLInputElement | null>(null);

  // Helper: Tự động tạo công thức chi tiết & ghi chú chuẩn cho bài học
  const generateLessonRecipeTemplate = (title: string) => {
    return `📌 CÔNG THỨC & QUY TRÌNH THỰC HÀNH: ${title.toUpperCase()}

1. Định lượng nguyên liệu chuẩn (Tính cho 1 mẻ tiêu chuẩn):
- Nguyên liệu chính: 1kg nguyên liệu tươi chọn loại 1 (sơ chế sạch, khử mùi tanh).
- Cốt gia vị truyền thống: 35g muối tinh sấy, 45ml nước mắm cốt nhĩ 40 độ đạm, 20g đường phèn hoa vàng, 10g tiêu sọ rang dập vỡ.
- Túi thơm thảo mộc: 1 hoa hồi, 1 nhánh quế chi 5cm, 2 thảo quả nướng bóc vỏ, 3 đinh hương.

2. Quy trình thao tác & Kỹ thuật khống chế nhiệt:
- Bước 1: Khử tanh và chần nguyên liệu trong nước ấm 75°C với gừng đập dập và rượu trắng 3 phút.
- Bước 2: Cho vào nồi ninh cùng túi thơm thảo mộc đã sao thơm. Duy trì lửa nhỏ lăn tăn ở 90°C - 92°C.
- Bước 3: Không đậy kín vung trong 2 tiếng đầu để thoát hơi nồng và không làm đục nước.
- Bước 4: Nêm cốt gia vị vào 30 phút cuối trước khi hoàn thiện để giữ trọn tầng hương thơm.

3. Lưu ý sống còn từ Bếp Trưởng:
- Không dùng nước mắm công nghiệp chứa nhiều chất điều vị.
- Nước dùng khi chan vào bát phải đạt tối thiểu 85°C.`;
  };

  // Inline chapter addition / management in Add Lesson modal
  const [showAddChapterInModal, setShowAddChapterInModal] = useState(false);
  const [newChapterTitleInModal, setNewChapterTitleInModal] = useState('');
  const [showManageChaptersInModal, setShowManageChaptersInModal] = useState(false);

  // Standalone chapter addition in Tab 3
  const [showAddChapterInTab3, setShowAddChapterInTab3] = useState(false);
  const [newChapterTitleInTab3, setNewChapterTitleInTab3] = useState('');

  // Tab 3: Search and limit displayed courses (Yêu cầu: ô tìm khóa học & chỉ hiện 4 khóa mới nhất)
  const [tab3CourseSearch, setTab3CourseSearch] = useState('');
  const [showAllCoursesTab3, setShowAllCoursesTab3] = useState(false);

  // Filter and limit courses in Tab 3: default shows 4 newest from scoped list
  const filteredCoursesForTab3 = useMemo(() => {
    let list = scopedCourses;
    if (tab3CourseSearch.trim()) {
      const q = tab3CourseSearch.trim().toLowerCase();
      list = list.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.instructorName.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [scopedCourses, tab3CourseSearch]);

  const displayedCoursesTab3 = useMemo(() => {
    if (tab3CourseSearch.trim() || showAllCoursesTab3) {
      return filteredCoursesForTab3;
    }
    return filteredCoursesForTab3.slice(0, 4);
  }, [filteredCoursesForTab3, tab3CourseSearch, showAllCoursesTab3]);

  // Firebase Config Form
  const [fbConfig, setFbConfig] = useState<FirebaseConfigState>(StorageService.getFirebaseConfig());
  const [fbStatusMessage, setFbStatusMessage] = useState('');
  const [fbTesting, setFbTesting] = useState(false);
  const [fbPasteSnippet, setFbPasteSnippet] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const generateVercelEnvSnippet = () => {
    const apiKey = fbConfig.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || '';
    const projectId = fbConfig.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || '';
    const authDomain = fbConfig.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (projectId ? `${projectId}.firebaseapp.com` : '');
    const storageBucket = fbConfig.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (projectId ? `${projectId}.appspot.com` : '');
    const messagingSenderId = fbConfig.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '';
    const appId = fbConfig.appId || import.meta.env.VITE_FIREBASE_APP_ID || '';

    return `VITE_FIREBASE_API_KEY=${apiKey}\nVITE_FIREBASE_AUTH_DOMAIN=${authDomain}\nVITE_FIREBASE_PROJECT_ID=${projectId}\nVITE_FIREBASE_STORAGE_BUCKET=${storageBucket}\nVITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}\nVITE_FIREBASE_APP_ID=${appId}`;
  };

  const handleCopyVercelEnv = () => {
    const snippet = generateVercelEnvSnippet();
    navigator.clipboard.writeText(snippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 3000);
    setActionAlert({
      type: 'success',
      message: 'Đã sao chép toàn bộ biến môi trường Vercel vào bộ nhớ tạm!'
    });
  };

  // Sync selectedCourseForLessons when courses change (strictly scoped)
  useEffect(() => {
    if (selectedCourseForLessons) {
      const fresh = scopedCourses.find(c => c.id === selectedCourseForLessons.id);
      if (fresh) {
        setSelectedCourseForLessons(fresh);
      } else if (scopedCourses.length > 0) {
        setSelectedCourseForLessons(scopedCourses[0]);
      } else {
        setSelectedCourseForLessons(null as unknown as Course);
      }
    } else if (scopedCourses.length > 0) {
      setSelectedCourseForLessons(scopedCourses[0]);
    }
  }, [scopedCourses]);

  // Keep newLessonChapterId synced with valid chapter of currently selected course
  useEffect(() => {
    if (selectedCourseForLessons && selectedCourseForLessons.chapters.length > 0) {
      if (!selectedCourseForLessons.chapters.some(c => c.id === newLessonChapterId)) {
        setNewLessonChapterId(selectedCourseForLessons.chapters[0].id);
      }
    } else {
      setNewLessonChapterId('');
    }
  }, [selectedCourseForLessons]);

  // Delete Confirmation States
  const [chefToDelete, setChefToDelete] = useState<Instructor | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleConfirmDeleteChef = () => {
    if (!chefToDelete) return;
    const chefId = chefToDelete.id;
    const chefName = chefToDelete.name;

    const result = StorageService.deleteInstructor(chefId);

    // If currently selected course belonged to this instructor, reset selection
    if (selectedCourseForLessons?.instructorId === chefId) {
      const remainingCourses = courses.filter(c => c.instructorId !== chefId);
      setSelectedCourseForLessons(remainingCourses[0] || null);
    }

    onRefreshData();
    setChefToDelete(null);
    setActionAlert({
      type: 'success',
      message: `Đã xóa vĩnh viễn Bếp trưởng "${chefName}" cùng ${result.deletedCoursesCount} khóa học liên quan khỏi danh sách và Firebase Firestore!`
    });
  };

  const handleConfirmDeleteCourse = () => {
    if (!courseToDelete) return;
    const courseId = courseToDelete.id;
    const courseTitle = courseToDelete.title;

    StorageService.deleteCourse(courseId);

    if (selectedCourseForLessons?.id === courseId) {
      const remainingCourses = courses.filter(c => c.id !== courseId);
      setSelectedCourseForLessons(remainingCourses[0] || null);
    }

    onRefreshData();
    setCourseToDelete(null);
    setActionAlert({
      type: 'success',
      message: `Đã xóa vĩnh viễn khóa học "${courseTitle}" khỏi hệ thống và Firebase Firestore!`
    });
  };

  // Reorder Instructor Handler
  const handleMoveInstructor = (id: string, direction: 'up' | 'down' | 'top') => {
    const chef = instructors.find(i => i.id === id);
    StorageService.moveInstructor(id, direction);
    onRefreshData();
    if (direction === 'top') {
      setActionAlert({
        type: 'success',
        message: `Đã đưa Giảng viên "${chef?.name || 'Bếp trưởng'}" lên VỊ TRÍ ĐẦU TIÊN (Sẽ hiển thị trên cùng ở Trang Chủ)!`
      });
    } else {
      setActionAlert({
        type: 'success',
        message: `Đã cập nhật thứ tự hiển thị của Giảng viên "${chef?.name || 'Bếp trưởng'}"!`
      });
    }
  };

  // Review Images File / Camera Handlers
  const handleReviewAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsReviewAvatarCompressing(true);
    try {
      const compressed = await compressImage(file, 400, 400, 0.85);
      setReviewAvatar(compressed.dataUrl);
      setActionAlert({
        type: 'success',
        message: `Đã tải và nén ảnh chân dung học viên thành công (${formatFileSize(compressed.compressedSize)})!`
      });
    } catch (err) {
      console.error('Lỗi khi nén ảnh chân dung học viên:', err);
    } finally {
      setIsReviewAvatarCompressing(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleReviewDishFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsReviewDishCompressing(true);
    try {
      const compressed = await compressImage(file, 600, 600, 0.82);
      setReviewDishImage(compressed.dataUrl);
      setActionAlert({
        type: 'success',
        message: `Đã tải và nén ảnh món ăn thực tế thành công (${formatFileSize(compressed.compressedSize)})!`
      });
    } catch (err) {
      console.error('Lỗi khi nén ảnh món ăn học viên:', err);
    } finally {
      setIsReviewDishCompressing(false);
      if (e.target) e.target.value = '';
    }
  };

  // Overall Stats
  const totalRevenue = enrollments
    .filter(e => e.type === 'paid')
    .reduce((sum, e) => sum + (e.pricePaid || 0), 0);

  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  // Student Management & Modal States
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [studentForDiscount, setStudentForDiscount] = useState<Student | null>(null);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<{ studentId: string; enrollmentId: string; courseTitle: string } | null>(null);

  // Discount Form State
  const [discountTab, setDiscountTab] = useState<'voucher' | 'free_course'>('voucher');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [discountCourseId, setDiscountCourseId] = useState<string>('all');
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountTitle, setDiscountTitle] = useState<string>('');
  const [discountExpiryDays, setDiscountExpiryDays] = useState<number>(30);
  const [discountNote, setDiscountNote] = useState<string>('');
  const [giftCourseId, setGiftCourseId] = useState<string>(courses[0]?.id || '');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filtered Students (strictly scoped by instructor's courses)
  const filteredStudents = scopedStudents.filter(student => {
    const studentEnrollments = scopedEnrollments.filter(e => e.studentId === student.id);
    
    // Search query matching student info or enrolled course titles
    const searchLower = studentSearch.trim().toLowerCase();
    const matchesSearch = !searchLower || 
      student.name.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.phone.includes(searchLower) ||
      studentEnrollments.some(e => e.courseTitle.toLowerCase().includes(searchLower));

    // Filter by specific course
    const matchesCourse = selectedCourseFilter === 'all' || 
      studentEnrollments.some(e => e.courseId === selectedCourseFilter);

    // Filter by enrollment type (paid vs trial)
    const matchesType = enrollmentTypeFilter === 'all' ||
      (enrollmentTypeFilter === 'paid' && studentEnrollments.some(e => e.type === 'paid')) ||
      (enrollmentTypeFilter === 'trial' && studentEnrollments.some(e => e.type === 'trial'));

    return matchesSearch && matchesCourse && matchesType;
  });

  // Student Actions Handlers
  const handleConfirmDeleteStudent = () => {
    if (!studentToDelete) return;
    const res = StorageService.deleteStudent(studentToDelete.id);
    onRefreshData();
    if (selectedStudentForDetails?.id === studentToDelete.id) {
      setSelectedStudentForDetails(null);
    }
    setStudentToDelete(null);
    setActionAlert({
      type: 'success',
      message: `Đã xóa học viên "${res.studentName}" cùng ${res.deletedEnrollmentsCount} khóa học liên quan khỏi hệ thống và Firebase Firestore!`
    });
  };

  const handleConfirmDeleteEnrollment = () => {
    if (!enrollmentToDelete) return;
    StorageService.deleteEnrollment(enrollmentToDelete.enrollmentId);
    onRefreshData();
    if (selectedStudentForDetails) {
      const fresh = StorageService.getStudents().find(s => s.id === selectedStudentForDetails.id);
      setSelectedStudentForDetails(fresh || null);
    }
    setActionAlert({
      type: 'success',
      message: `Đã hủy quyền truy cập khóa "${enrollmentToDelete.courseTitle}" của học viên!`
    });
    setEnrollmentToDelete(null);
  };

  const handleAddDiscountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForDiscount) return;

    if (discountTab === 'voucher') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (Number(discountExpiryDays) || 30));

      const targetCourse = discountCourseId !== 'all' ? courses.find(c => c.id === discountCourseId) : undefined;
      const codeGenerated = discountCode.trim().toUpperCase() || `VIP${Math.floor(1000 + Math.random() * 9000)}`;
      const titleGenerated = discountTitle.trim() || 
        (discountType === 'percent' 
          ? `Mã giảm giá ${discountValue}% toàn diện` 
          : `Voucher giảm ${new Intl.NumberFormat('vi-VN').format(discountValue)}đ`);

      StorageService.addStudentDiscount(studentForDiscount.id, {
        code: codeGenerated,
        title: titleGenerated,
        type: discountType,
        value: Number(discountValue) || 10,
        courseId: discountCourseId !== 'all' ? discountCourseId : undefined,
        courseTitle: targetCourse ? targetCourse.title.split(' - ')[0] : undefined,
        expiresAt: expiresAt.toISOString().split('T')[0],
        status: 'active',
        note: discountNote.trim() || 'Ưu đãi dành riêng cho học viên từ Quản trị viên'
      });

      setActionAlert({
        type: 'success',
        message: `Đã cấp mã ưu đãi "${codeGenerated}" thành công cho học viên "${studentForDiscount.name}"!`
      });
    } else {
      // Free Course Gift
      if (!giftCourseId) {
        alert('Vui lòng chọn khóa học muốn tặng!');
        return;
      }
      const targetCourse = courses.find(c => c.id === giftCourseId);
      if (!targetCourse) return;

      StorageService.enrollStudent({
        studentId: studentForDiscount.id,
        courseId: giftCourseId,
        type: 'paid',
        price: 0
      });

      StorageService.addStudentDiscount(studentForDiscount.id, {
        code: `FREE-${Math.floor(1000 + Math.random() * 9000)}`,
        title: `Tặng miễn phí trọn đời: ${targetCourse.title.split(' - ')[0]}`,
        type: 'free_course',
        value: targetCourse.discountPrice || targetCourse.originalPrice || 0,
        courseId: giftCourseId,
        courseTitle: targetCourse.title,
        expiresAt: '2099-12-31',
        status: 'active',
        note: discountNote.trim() || 'Khóa học tặng thưởng đặc quyền trọn đời'
      });

      setActionAlert({
        type: 'success',
        message: `Đã kích hoạt tặng khóa học "${targetCourse.title.split(' - ')[0]}" (0đ) cho học viên "${studentForDiscount.name}"!`
      });
    }

    onRefreshData();
    const freshStudent = StorageService.getStudents().find(s => s.id === studentForDiscount.id);
    if (freshStudent && selectedStudentForDetails?.id === freshStudent.id) {
      setSelectedStudentForDetails(freshStudent);
    }
    setStudentForDiscount(null);
    setDiscountCode('');
    setDiscountTitle('');
    setDiscountValue(20);
    setDiscountNote('');
  };

  const handleDeleteDiscount = (studentId: string, discountId: string) => {
    StorageService.deleteStudentDiscount(studentId, discountId);
    onRefreshData();
    const freshStudent = StorageService.getStudents().find(s => s.id === studentId);
    if (freshStudent && selectedStudentForDetails?.id === freshStudent.id) {
      setSelectedStudentForDetails(freshStudent);
    }
    setActionAlert({
      type: 'success',
      message: 'Đã xóa ưu đãi của học viên thành công!'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // ==========================================
  // REQUIREMENT 1: Category Management Handlers
  // ==========================================
  const handleAddNewCategory = () => {
    const clean = newCategoryName.trim();
    if (!clean) return;
    const updated = StorageService.addCategory(clean);
    setCategories(updated);
    setNewCourseCategory(clean);
    setNewCategoryName('');
    setShowAddCategoryInput(false);
    setCategoryFeedback({
      type: 'success',
      message: `Đã thêm nhóm mới "${clean}" thành công!`
    });
    setTimeout(() => setCategoryFeedback(null), 3000);
    onRefreshData();
  };

  const handleRequestDeleteCategory = (catToDelete: string) => {
    if (categories.length <= 1) {
      setCategoryFeedback({
        type: 'error',
        message: 'Hệ thống cần duy trì ít nhất 1 nhóm phân loại!'
      });
      setTimeout(() => setCategoryFeedback(null), 3000);
      return;
    }
    setCategoryToDeleteConfirm(catToDelete);
  };

  const handleConfirmDeleteCategory = (catToDelete: string) => {
    if (categories.length <= 1) {
      setCategoryFeedback({
        type: 'error',
        message: 'Hệ thống cần duy trì ít nhất 1 nhóm phân loại!'
      });
      setTimeout(() => setCategoryFeedback(null), 3000);
      setCategoryToDeleteConfirm(null);
      return;
    }

    const updated = StorageService.deleteCategory(catToDelete);
    setCategories(updated);
    if (newCourseCategory === catToDelete) {
      setNewCourseCategory(updated[0] || 'Mở quán kinh doanh');
    }
    setCategoryToDeleteConfirm(null);
    setCategoryFeedback({
      type: 'success',
      message: `Đã xóa nhóm "${catToDelete}" thành công!`
    });
    setTimeout(() => setCategoryFeedback(null), 3500);
    setActionAlert({
      type: 'success',
      message: `Đã xóa nhóm phân loại "${catToDelete}" khỏi hệ thống thành công!`
    });
    onRefreshData();
  };

  const handleDeleteCategory = (catToDelete: string) => {
    handleConfirmDeleteCategory(catToDelete);
  };

  // ========================================================
  // REQUIREMENT 1: Image Compression & Upload/Camera Handlers
  // ========================================================
  const processImageFile = async (file: File | Blob | string) => {
    setIsCompressing(true);
    try {
      const res = await compressImage(file, 900, 600, 0.75);
      setNewCourseThumbnail(res.dataUrl);
      const percent = Math.round((1 - res.compressedSize / (res.originalSize || 1)) * 100);
      setCompressionStats({
        originalSize: res.originalSize,
        compressedSize: res.compressedSize,
        percentSaved: percent > 0 ? percent : 0
      });
    } catch (err) {
      console.error('Error compressing image:', err);
      alert('Không thể xử lý hoặc nén ảnh. Vui lòng thử lại!');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Instructor Avatar Compression & File Handler (Requirement 1)
  const processInstructorImageFile = async (file: File | Blob | string) => {
    setIsInstCompressing(true);
    try {
      const res = await compressImage(file, 500, 500, 0.8);
      setNewInstAvatar(res.dataUrl);
      const percent = Math.round((1 - res.compressedSize / (res.originalSize || 1)) * 100);
      setInstCompressionStats({
        originalSize: res.originalSize,
        compressedSize: res.compressedSize,
        percentSaved: percent > 0 ? percent : 0
      });
    } catch (err) {
      console.error('Error compressing instructor avatar:', err);
      alert('Không thể xử lý hoặc nén ảnh đại diện. Vui lòng thử lại!');
    } finally {
      setIsInstCompressing(false);
    }
  };

  const handleInstFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processInstructorImageFile(file);
    }
  };

  const startCamera = async (facing: 'environment' | 'user' = cameraFacing, target: 'course' | 'instructor' = 'course') => {
    setCameraTarget(target);
    setShowCameraModal(true);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Direct webcam access not available, triggering native device camera:', err);
      if (target === 'instructor') {
        instNativeCameraRef.current?.click();
      } else {
        nativeCameraInputRef.current?.click();
      }
      setShowCameraModal(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCamera(nextFacing, cameraTarget);
  };

  const capturePhotoFromCamera = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    if (cameraTarget === 'instructor') {
      await processInstructorImageFile(dataUrl);
    } else {
      await processImageFile(dataUrl);
    }
  };

  // ==========================================
  // REQUIREMENT 2: Chapter Management in Modal
  // ==========================================
  const handleAddChapterInModal = () => {
    if (!newChapterTitleInModal.trim() || !selectedCourseForLessons) return;
    try {
      const newChap = StorageService.addChapter(selectedCourseForLessons.id, newChapterTitleInModal);
      const updated = StorageService.getCourseById(selectedCourseForLessons.id);
      if (updated) setSelectedCourseForLessons(updated);
      setNewLessonChapterId(newChap.id);
      setNewChapterTitleInModal('');
      setShowAddChapterInModal(false);
      onRefreshData();
      setActionAlert({
        type: 'success',
        message: `Đã thêm chương "${newChap.title}" thành công!`
      });
    } catch (err) {
      console.error(err);
      setActionAlert({
        type: 'error',
        message: 'Không tìm thấy khóa học để thêm chương!'
      });
    }
  };

  const handleRequestDeleteChapter = (chapId: string) => {
    setChapterToDeleteConfirm(chapId);
  };

  const handleConfirmDeleteChapter = (chapId: string) => {
    if (!selectedCourseForLessons) return;
    const chap = selectedCourseForLessons.chapters.find(c => c.id === chapId);
    const chapTitle = chap?.title || 'Chương';
    StorageService.deleteChapter(selectedCourseForLessons.id, chapId);
    const updated = StorageService.getCourseById(selectedCourseForLessons.id);
    if (updated) {
      setSelectedCourseForLessons(updated);
      if (newLessonChapterId === chapId) {
        setNewLessonChapterId(updated.chapters[0]?.id || '');
      }
    }
    setChapterToDeleteConfirm(null);
    onRefreshData();
    setActionAlert({
      type: 'success',
      message: `Đã xóa vĩnh viễn chương "${chapTitle}" thành công!`
    });
  };

  const handleDeleteChapterFromModal = (chapId: string) => {
    handleConfirmDeleteChapter(chapId);
  };

  // ========================================================
  // REQUIREMENT 3: Chapter & Lessons Editing Handlers
  // ========================================================
  const handleOpenEditChapter = (chap: Chapter) => {
    setEditingChapter(JSON.parse(JSON.stringify(chap)));
    setEditingChapterNewLessonTitle('');
    setShowEditChapterModal(true);
  };

  const handleUpdateEditingChapterField = (field: 'title' | 'order' | 'isFree', value: unknown) => {
    if (!editingChapter) return;
    if (field === 'isFree') {
      const isFree = Boolean(value);
      setEditingChapter({
        ...editingChapter,
        isFree,
        lessons: isFree ? editingChapter.lessons : editingChapter.lessons.map(l => ({ ...l, isFreeTrial: false }))
      });
    } else {
      setEditingChapter({
        ...editingChapter,
        [field]: value
      });
    }
  };

  const handleUpdateLessonInEditingChapter = (lessonId: string, updates: Partial<Lesson>) => {
    if (!editingChapter) return;
    setEditingChapter({
      ...editingChapter,
      lessons: editingChapter.lessons.map(l => {
        if (l.id === lessonId) {
          return { ...l, ...updates };
        }
        return l;
      })
    });
  };

  const handleRemoveLessonInEditingChapter = (lessonId: string) => {
    if (!editingChapter) return;
    setEditingChapter({
      ...editingChapter,
      lessons: editingChapter.lessons.filter(l => l.id !== lessonId)
    });
  };

  const handleAddLessonInEditingChapter = () => {
    if (!editingChapter || !editingChapterNewLessonTitle.trim()) return;
    const title = editingChapterNewLessonTitle.trim();
    const newLesson: Lesson = {
      id: 'les-' + Date.now(),
      chapterId: editingChapter.id,
      title,
      durationMinutes: 15,
      isFreeTrial: Boolean(editingChapter.isFree),
      requirePaymentForDoc: false,
      videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
      recipeDocumentUrl: '',
      recipeText: generateLessonRecipeTemplate(title),
      order: editingChapter.lessons.length + 1
    };
    setEditingChapter({
      ...editingChapter,
      lessons: [...editingChapter.lessons, newLesson]
    });
    setEditingChapterNewLessonTitle('');
  };

  const handleSaveEditChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter || !selectedCourseForLessons) return;
    if (!editingChapter.title.trim()) {
      setActionAlert({ type: 'error', message: 'Vui lòng nhập tên chương!' });
      return;
    }

    const sanitizedLessons: Lesson[] = editingChapter.lessons.map((l, idx) => ({
      ...l,
      title: l.title.trim() || `Bài học ${idx + 1}`,
      durationMinutes: Math.max(1, Number(l.durationMinutes) || 10),
      isFreeTrial: editingChapter.isFree ? Boolean(l.isFreeTrial) : false,
      requirePaymentForDoc: Boolean(l.requirePaymentForDoc),
      videoUrl: toYouTubeEmbedUrl(l.videoUrl) || l.videoUrl || 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
      recipeDocumentUrl: l.recipeDocumentUrl ? l.recipeDocumentUrl.trim() : '',
      recipeText: l.recipeText ? l.recipeText.trim() : generateLessonRecipeTemplate(l.title),
      order: idx + 1
    }));

    const updatedChapter: Chapter = {
      ...editingChapter,
      title: editingChapter.title.trim(),
      order: Number(editingChapter.order) || 1,
      isFree: editingChapter.isFree,
      lessons: sanitizedLessons
    };

    StorageService.updateChapter(selectedCourseForLessons.id, updatedChapter);
    const updatedCourse = StorageService.getCourseById(selectedCourseForLessons.id);
    if (updatedCourse) setSelectedCourseForLessons(updatedCourse);
    setShowEditChapterModal(false);
    setEditingChapter(null);
    onRefreshData();
    setActionAlert({
      type: 'success',
      message: `Đã cập nhật chương "${updatedChapter.title}" và ${sanitizedLessons.length} bài học thành công!`
    });
  };

  // Add Chapter directly in Tab 3
  const handleAddChapterInTab3 = () => {
    if (!newChapterTitleInTab3.trim() || !selectedCourseForLessons) return;
    try {
      const newChap = StorageService.addChapter(selectedCourseForLessons.id, newChapterTitleInTab3);
      const updated = StorageService.getCourseById(selectedCourseForLessons.id);
      if (updated) setSelectedCourseForLessons(updated);
      setNewLessonChapterId(newChap.id);
      setNewChapterTitleInTab3('');
      setShowAddChapterInTab3(false);
      onRefreshData();
      setActionAlert({
        type: 'success',
        message: `Đã tạo chương mới "${newChap.title}" thành công!`
      });
    } catch (err) {
      console.error(err);
      setActionAlert({
        type: 'error',
        message: 'Lỗi khi tạo chương mới!'
      });
    }
  };

  // ========================================================
  // REQUIREMENT 3: Tắt / Bật Miễn Phí (Chương & Bài Học)
  // Quy tắc: Nếu 1 chương mất phí => tất cả bài đều mất phí
  // ========================================================
  const handleToggleChapterFree = (chapId: string, currentIsFree: boolean) => {
    if (!selectedCourseForLessons) return;
    const nextFree = !currentIsFree;
    StorageService.toggleChapterFree(selectedCourseForLessons.id, chapId, nextFree);
    const updated = StorageService.getCourseById(selectedCourseForLessons.id);
    if (updated) setSelectedCourseForLessons(updated);
    onRefreshData();
  };

  const handleToggleLessonFree = (lessonId: string, chapIsFree: boolean) => {
    if (!selectedCourseForLessons) return;
    if (!chapIsFree) {
      alert('Chương này đang đặt MẤT PHÍ. Để đặt bài học miễn phí, bạn cần bật miễn phí cho cả chương trước!');
      return;
    }
    StorageService.toggleLessonFree(selectedCourseForLessons.id, lessonId);
    const updated = StorageService.getCourseById(selectedCourseForLessons.id);
    if (updated) setSelectedCourseForLessons(updated);
    onRefreshData();
  };

  const handleToggleLessonDocPaid = (lessonId: string) => {
    if (!selectedCourseForLessons) return;
    StorageService.toggleLessonDocPaid(selectedCourseForLessons.id, lessonId);
    const updated = StorageService.getCourseById(selectedCourseForLessons.id);
    if (updated) setSelectedCourseForLessons(updated);
    onRefreshData();
  };

  // Handler: Add Instructor
  const handleSaveInstructor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstName.trim()) return;

    const assignedUsername = newInstUsername.trim().toLowerCase() || `chef${Math.floor(100 + Math.random() * 900)}`;
    const assignedPassword = newInstPassword.trim() || '123456';
    const assignedEmail = newInstEmail.trim() || `${assignedUsername}@hocmonngon.vn`;

    const newInst: Instructor = {
      id: 'chef-' + Date.now(),
      name: newInstName.trim(),
      title: newInstTitle.trim() || 'Đầu bếp chuyên nghiệp',
      specialty: newInstSpecialty.trim() || 'Món truyền thống & Mở quán',
      avatar: newInstAvatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
      bio: newInstBio.trim() || 'Chuyên gia giảng dạy ẩm thực tại Học Món Ngon.',
      courseCount: 0,
      studentCount: 0,
      rating: 5.0,
      phone: newInstPhone.trim(),
      zalo: newInstZalo.trim(),
      username: assignedUsername,
      password: assignedPassword,
      email: assignedEmail
    };

    StorageService.addInstructor(newInst);
    setShowAddInstructorModal(false);
    onRefreshData();

    // Reset fields
    setNewInstName('');
    setNewInstTitle('');
    setNewInstSpecialty('');
    setNewInstBio('');
    setNewInstPhone('');
    setNewInstZalo('');
    setNewInstUsername('');
    setNewInstPassword('');
    setNewInstEmail('');

    // Requirement 2: Automatically select new chef and open course creation modal!
    setNewCourseInstructorId(newInst.id);
    setActionAlert({
      type: 'success',
      message: `Đã thêm Giảng viên "${newInst.name}" thành công với User: "${assignedUsername}" (MK: "${assignedPassword}"). Giảng viên có thể đăng nhập bằng tài khoản này để quản lý khóa học của mình!`
    });
    setShowAddCourseModal(true);
  };

  // Handler: Open Edit Chef Modal
  const handleOpenEditChef = (chef: Instructor) => {
    setEditingChef(chef);
    setEditInstName(chef.name);
    setEditInstTitle(chef.title || '');
    setEditInstSpecialty(chef.specialty || '');
    setEditInstAvatar(chef.avatar || '');
    setEditInstBio(chef.bio || '');
    setEditInstPhone(chef.phone || '');
    setEditInstZalo(chef.zalo || '');
    setEditInstUsername(chef.username || '');
    setEditInstPassword(chef.password || '');
    setEditInstEmail(chef.email || '');
    setShowEditInstructorModal(true);
  };

  // Handler: Update Existing Instructor
  const handleUpdateInstructor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChef || !editInstName.trim()) return;

    const updated: Instructor = {
      ...editingChef,
      name: editInstName.trim(),
      title: editInstTitle.trim() || 'Đầu bếp chuyên nghiệp',
      specialty: editInstSpecialty.trim() || 'Món truyền thống & Mở quán',
      avatar: editInstAvatar || editingChef.avatar,
      bio: editInstBio.trim() || editingChef.bio,
      phone: editInstPhone.trim(),
      zalo: editInstZalo.trim(),
      username: editInstUsername.trim().toLowerCase() || editingChef.username,
      password: editInstPassword.trim() || editingChef.password,
      email: editInstEmail.trim() || editingChef.email
    };

    StorageService.updateInstructor(updated);
    setShowEditInstructorModal(false);
    onRefreshData();
    setActionAlert({
      type: 'success',
      message: `Đã cập nhật thông tin và tài khoản đăng nhập của Bếp trưởng "${updated.name}" thành công!`
    });
  };

  // Handler: Add Course (Requirement 1 & 3: Detailed student view fields saved)
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    const effectiveInstructorId = (isInstructor && currentInstructorId) ? currentInstructorId : newCourseInstructorId;
    const chef = instructors.find(i => i.id === effectiveInstructorId) || currentInstructorProfile || instructors[0];
    const defaultThumb = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
    const defaultChefAvatar = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80';

    const newCourse: Course = {
      id: 'course-' + Date.now(),
      title: newCourseTitle.trim(),
      slug: newCourseTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      instructorId: chef?.id || 'chef-default',
      instructorName: chef?.name || 'Bếp trưởng',
      instructorAvatar: (chef?.avatar && chef.avatar.trim()) ? chef.avatar : defaultChefAvatar,
      category: newCourseCategory,
      shortDescription: newCourseDesc.trim() || 'Khóa học thực chiến cùng Bếp trưởng giàu kinh nghiệm.',
      description: newCourseDesc.trim(),
      thumbnail: (newCourseThumbnail && newCourseThumbnail.trim()) ? newCourseThumbnail : defaultThumb,
      previewVideoUrl: '',
      originalPrice: Number(newCourseOriginalPrice),
      discountPrice: Number(newCourseDiscountPrice),
      level: newCourseLevel,
      durationHours: Number(newCourseDuration),
      rating: 5.0,
      reviewCount: newCourseReviews.length > 0 ? newCourseReviews.length : 1,
      studentCount: 0,
      benefits: newCourseBenefits.length > 0 ? newCourseBenefits : [
        {
          icon: 'droplets',
          title: 'Công thức độc quyền 100%',
          description: 'Chuẩn gram vị không dùng chất tạo ngọt phụ gia.'
        },
        {
          icon: 'calculator',
          title: 'Kiểm soát chi phí vốn',
          description: 'Tối ưu hóa lợi nhuận kinh doanh quán ăn.'
        }
      ],
      chapters: [],
      inclusions: newCourseInclusions.length > 0 ? newCourseInclusions : [
        'Bài học video chuẩn HD trọn đời',
        'File công thức PDF chuẩn gram',
        'Hỗ trợ 1-1 cùng giảng viên'
      ],
      pdfRecipeUrl: newCoursePdfUrl.trim(),
      excelCostSheetUrl: undefined,
      zaloGroupLink: newCourseZaloLink.trim(),
      badge: newCourseBadge,
      badgeColor: newCourseBadgeColor,
      reviews: newCourseReviews,
      transferSyntax: newCourseTransferSyntax.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || undefined
    };

    StorageService.addCourse(newCourse);
    setSelectedCourseForLessons(newCourse);
    setShowAddCourseModal(false);
    onRefreshData();
    setActionAlert({
      type: 'success',
      message: `Đã xuất bản thành công khóa học "${newCourse.title}" cho Bếp trưởng ${chef.name} và đồng bộ lên Firebase! Bạn có thể thêm các chương và bài học cho khóa học này bất kỳ lúc nào.`
    });
  };

  // Handler: Update Course Badge on Homepage
  const handleUpdateCourseBadge = (badge: string, color: 'red' | 'dark' | 'amber' | 'emerald' | 'purple' | 'blue' = 'red') => {
    if (!selectedCourseForLessons) return;
    const updated: Course = {
      ...selectedCourseForLessons,
      badge,
      badgeColor: color
    };
    StorageService.updateCourse(updated);
    setSelectedCourseForLessons(updated);
    onRefreshData();
    setActionAlert({
      type: 'success',
      message: badge === 'none' 
        ? `Đã tắt hiển thị huy hiệu cho khóa "${updated.title}" trên Trang Chủ!`
        : `Đã đổi huy hiệu khóa "${updated.title}" thành "${badge}" thành công và đồng bộ lên Trang Chủ!`
    });
  };

  // Helper: Open Add Lesson modal with pre-selected chapter
  const handleOpenAddLessonModal = (targetChapterId?: string) => {
    if (!selectedCourseForLessons) return;

    let validChapId = '';
    if (selectedCourseForLessons.chapters.length === 0) {
      const autoChap = StorageService.addChapter(selectedCourseForLessons.id, 'Chương 1: Nội dung bài học');
      const updated = StorageService.getCourseById(selectedCourseForLessons.id);
      if (updated) setSelectedCourseForLessons(updated);
      validChapId = autoChap.id;
      onRefreshData();
    } else {
      validChapId = (targetChapterId && selectedCourseForLessons.chapters.some(c => c.id === targetChapterId))
        ? targetChapterId
        : (selectedCourseForLessons.chapters.some(c => c.id === newLessonChapterId)
            ? newLessonChapterId
            : selectedCourseForLessons.chapters[0].id);
    }

    setNewLessonChapterId(validChapId);
    setNewLessonTitle('');
    setNewLessonDuration(20);
    setNewLessonIsFree(false);
    setNewLessonRecipeText('');
    setNewLessonRequirePaymentForDoc(false);
    setShowAddLessonModal(true);
  };

  // Handler: Add Lesson to Course (Requirement 2: Chapter + Document Paid Toggle)
  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim() || !selectedCourseForLessons) return;

    const course = StorageService.getCourseById(selectedCourseForLessons.id) || selectedCourseForLessons;
    
    // Ensure target chapter exists or fallback safely
    let targetChapId = newLessonChapterId;
    if (!course.chapters || course.chapters.length === 0) {
      const autoChap = StorageService.addChapter(course.id, 'Chương 1 : Nội dung bài học');
      targetChapId = autoChap.id;
    } else if (!course.chapters.some(c => c.id === targetChapId)) {
      targetChapId = course.chapters[0].id;
    }

    // Check if parent chapter is free
    const parentChap = course.chapters.find(c => c.id === targetChapId);
    const chapIsFree = parentChap?.isFree !== false;

    // Requirement 3 rule: if chapter is not free, lesson CANNOT be free
    const finalIsFree = chapIsFree ? Boolean(newLessonIsFree) : false;

    // Auto-generate recipe if empty
    const finalRecipeText = newLessonRecipeText.trim() 
      ? newLessonRecipeText.trim() 
      : generateLessonRecipeTemplate(newLessonTitle.trim());

    const newLesson: Lesson = {
      id: 'les-' + Date.now(),
      chapterId: targetChapId,
      title: newLessonTitle.trim(),
      durationMinutes: Math.max(1, Number(newLessonDuration) || 15),
      isFreeTrial: finalIsFree,
      requirePaymentForDoc: Boolean(newLessonRequirePaymentForDoc),
      videoUrl: toYouTubeEmbedUrl(newLessonVideoUrl) || 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
      recipeDocumentUrl: newLessonDocUrl.trim(),
      recipeText: finalRecipeText,
      order: (parentChap?.lessons.length || 0) + 1
    };

    const res = StorageService.addLesson(course.id, targetChapId, newLesson);
    const updated = StorageService.getCourseById(course.id) || res.course;
    setSelectedCourseForLessons(updated);
    setNewLessonChapterId(targetChapId);
    setShowAddLessonModal(false);
    setNewLessonTitle('');
    onRefreshData();
    setActionAlert({
      type: 'success',
      message: `Đã thêm bài học "${newLesson.title}" vào "${parentChap?.title || 'chương'}" thành công!`
    });
  };

  // Handler: Delete Lesson (Non-blocking with inline confirm)
  const handleRequestDeleteLesson = (lessonId: string) => {
    setLessonToDeleteConfirm(lessonId);
  };

  const handleConfirmDeleteLesson = (lessonId: string) => {
    if (!selectedCourseForLessons) return;
    let deletedTitle = 'Bài học';
    for (const chap of selectedCourseForLessons.chapters) {
      const found = chap.lessons.find(l => l.id === lessonId);
      if (found) {
        deletedTitle = found.title;
        break;
      }
    }
    StorageService.deleteLesson(selectedCourseForLessons.id, lessonId);
    const updated = StorageService.getCourseById(selectedCourseForLessons.id);
    if (updated) setSelectedCourseForLessons(updated);
    setLessonToDeleteConfirm(null);
    onRefreshData();
    setActionAlert({
      type: 'success',
      message: `Đã xóa bài học "${deletedTitle}" thành công!`
    });
  };

  const handleDeleteLesson = (lessonId: string) => {
    handleConfirmDeleteLesson(lessonId);
  };

  // Parse Firebase Config Snippet
  const handleParseFirebaseSnippet = () => {
    if (!fbPasteSnippet.trim()) return;
    const text = fbPasteSnippet;

    const extract = (key: string): string => {
      const regex = new RegExp(`["']?${key}["']?\\s*:\\s*["'\`]([^"'\`]+)["'\`]`, 'i');
      const match = text.match(regex);
      return match ? match[1].trim() : '';
    };

    const apiKey = extract('apiKey') || fbConfig.apiKey;
    const authDomain = extract('authDomain') || fbConfig.authDomain;
    const projectId = extract('projectId') || fbConfig.projectId;
    const storageBucket = extract('storageBucket') || fbConfig.storageBucket;
    const messagingSenderId = extract('messagingSenderId') || fbConfig.messagingSenderId;
    const appId = extract('appId') || fbConfig.appId;

    if (!apiKey && !projectId) {
      alert('Không tìm thấy thông tin apiKey hoặc projectId trong đoạn mã bạn dán. Vui lòng kiểm tra lại!');
      return;
    }

    const newCfg: FirebaseConfigState = {
      ...fbConfig,
      apiKey: apiKey || '',
      authDomain: authDomain || (projectId ? `${projectId}.firebaseapp.com` : ''),
      projectId: projectId || '',
      storageBucket: storageBucket || (projectId ? `${projectId}.appspot.com` : ''),
      messagingSenderId: messagingSenderId || '',
      appId: appId || ''
    };

    setFbConfig(newCfg);
    StorageService.saveFirebaseConfig(newCfg);
    setShowPasteBox(false);
    setFbStatusMessage('Đã tự động nhận diện và điền đầy đủ 6 thông số cấu hình Firebase! Bấm "Lưu & Kiểm Tra Kết Nối" hoặc "Đồng Bộ Toàn Diện Dữ Liệu Lên Firestore" để kiểm tra.');
  };

  // Firebase test
  const handleTestFirebase = async () => {
    setFbTesting(true);
    StorageService.saveFirebaseConfig(fbConfig);
    const res = await FirebaseService.testConnection();
    setFbStatusMessage(res.message);
    setFbTesting(false);
  };

  // Firebase sync all students
  const handleSyncAllStudents = async () => {
    setFbTesting(true);
    let count = 0;
    for (const s of students) {
      const ok = await FirebaseService.syncStudentToFirebase(s);
      if (ok) count++;
    }
    setFbStatusMessage(`Đã đồng bộ ${count}/${students.length} học viên lên Firebase Firestore.`);
    setFbTesting(false);
  };

  // Firebase sync all data (instructors, courses, students, enrollments, homepage, payment)
  const handleSyncAllData = async () => {
    setFbTesting(true);
    StorageService.saveFirebaseConfig(fbConfig);
    const hpConfig = StorageService.getHomepageConfig();
    const bankConfig = PaymentService.getBankConfig();
    const sepayConfig = PaymentService.getSePayConfig();

    const res = await FirebaseService.syncAllDataToFirebase({
      instructors,
      courses,
      students,
      enrollments,
      homepageConfig: hpConfig,
      bankConfig,
      sepayConfig
    });
    setFbStatusMessage(`${res.message} ${res.details}`);
    setFbTesting(false);
  };

  // Firebase load remote data
  const handleLoadRemoteFromFirebase = async () => {
    setFbTesting(true);
    StorageService.saveFirebaseConfig(fbConfig);
    const remote = await FirebaseService.loadAllFromFirestore();
    if (!remote) {
      setFbStatusMessage('Không thể kết nối Firestore hoặc Firestore chưa có bộ sưu tập dữ liệu.');
    } else {
      let instCount = 0;
      let courseCount = 0;
      if (remote.instructors && remote.instructors.length > 0) {
        StorageService.setInstructorsFromRemote(remote.instructors);
        instCount = remote.instructors.length;
      }
      if (remote.courses && remote.courses.length > 0) {
        StorageService.setCoursesFromRemote(remote.courses);
        courseCount = remote.courses.length;
      }
      if (remote.students && remote.students.length > 0) {
        StorageService.setStudentsFromRemote(remote.students);
      }
      if (remote.enrollments && remote.enrollments.length > 0) {
        const currentEnrollments = StorageService.getEnrollments();
        const currentIds = new Set(currentEnrollments.map(e => e.id));
        const newEnrollments = remote.enrollments.filter(e => !currentIds.has(e.id));
        if (newEnrollments.length > 0) {
          const merged = [...currentEnrollments, ...newEnrollments];
          localStorage.setItem('hocmonngon_enrollments_v1', JSON.stringify(merged));
        }
      }
      if (remote.homepageConfig) {
        StorageService.saveHomepageConfig(remote.homepageConfig);
      }
      if (remote.bankConfig) {
        PaymentService.saveBankConfig(remote.bankConfig);
      }
      if (remote.sepayConfig) {
        PaymentService.saveSePayConfig(remote.sepayConfig);
      }
      onRefreshData();
      setFbStatusMessage(`Đã tải về và cập nhật: ${instCount} Giảng viên, ${courseCount} Khóa học, cùng cài đặt Trang chủ & Thanh toán từ Firestore!`);
    }
    setFbTesting(false);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isInstructor ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-red-100 text-red-800'
              }`}>
                {isInstructor ? 'CỔNG QUẢN LÝ DÀNH CHO GIẢNG VIÊN' : 'TRUNG TÂM QUẢN LÝ MỤC TIÊU'}
              </span>
              {isInstructor && (
                <span className="px-2 py-0.5 rounded-md bg-stone-900 text-amber-400 text-[11px] font-bold">
                  {currentInstructorProfile?.specialty || 'Bếp Trưởng Chuyên Nghiệp'}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
              {isInstructor 
                ? `Kênh Giảng Viên: ${currentInstructorProfile?.name || currentUser?.name || 'Bếp Trưởng'}` 
                : 'Quản Trị Học Viên, Giảng Viên & Khóa Học'}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {isInstructor
                ? `Xem thông tin học viên, số tiền doanh thu và toàn quyền thêm/sửa/xóa bài học cho ${scopedCourses.length} khóa học của riêng bạn.`
                : 'Theo dõi doanh số, quản lý bài giảng video YouTube và nén ảnh lưu trữ Firebase.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold rounded-xl border border-stone-300 transition-colors cursor-pointer"
            >
              Về Trang Chủ
            </button>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionAlert && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in duration-200 ${
            actionAlert.type === 'success' 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs' 
              : 'bg-red-50 border-red-300 text-red-900 shadow-xs'
          }`}>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionAlert.message}</span>
            </div>
            <button 
              type="button"
              onClick={() => setActionAlert(null)}
              className="p-1 hover:bg-black/5 rounded-lg text-stone-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4 Summary Stats (Strictly scoped when logged in as Instructor) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
            <p className="text-xs text-stone-500 font-semibold">
              {isInstructor ? 'Học viên các khóa của tôi' : 'Tổng học viên đăng ký'}
            </p>
            <p className="text-3xl font-black text-stone-900">
              {isInstructor ? scopedStudents.length : students.length}
            </p>
            <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {isInstructor ? 'Chỉ tính học viên của bạn' : '+100% tự động kích hoạt'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
            <p className="text-xs text-stone-500 font-semibold">
              {isInstructor ? 'Học viên đã mua khóa của tôi' : 'Học viên đã mua khóa học'}
            </p>
            <p className="text-3xl font-black text-red-700">
              {isInstructor 
                ? scopedEnrollments.filter(e => e.type === 'paid').length 
                : enrollments.filter(e => e.type === 'paid').length}
            </p>
            <p className="text-[11px] text-stone-500">
              {isInstructor 
                ? `${scopedEnrollments.filter(e => e.type === 'trial').length} học viên đang học thử khóa của bạn`
                : `${enrollments.filter(e => e.type === 'trial').length} học viên đang học thử`}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
            <p className="text-xs text-stone-500 font-semibold">
              {isInstructor ? 'Doanh thu các khóa của tôi' : 'Doanh thu thanh toán'}
            </p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700">
              {formatPrice(isInstructor ? scopedRevenue : totalRevenue)}
            </p>
            <p className="text-[11px] text-stone-500">
              {isInstructor ? 'Thực nhận từ học viên mua khóa của bạn' : 'Chuyển khoản VietQR tự động'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
            <p className="text-xs text-stone-500 font-semibold">
              {isInstructor ? 'Khóa học của tôi' : 'Giảng viên / Khóa học'}
            </p>
            <p className="text-3xl font-black text-stone-900">
              {isInstructor ? `${scopedCourses.length} Khóa học` : `${instructors.length} / ${courses.length}`}
            </p>
            <p className="text-[11px] text-stone-500">
              {isInstructor 
                ? `${scopedCourses.reduce((sum, c) => sum + c.chapters.reduce((ls, ch) => ls + ch.lessons.length, 0), 0)} bài giảng video`
                : `${categories.length} nhóm phân loại`}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('students')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'students'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>
              {isInstructor ? `1. Học Viên Của Tôi (${scopedStudents.length})` : '1. Học Viên & Tiến Độ Học Tập'}
            </span>
          </button>

          {!isInstructor && (
            <button
              onClick={() => setActiveTab('instructors')}
              className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'instructors'
                  ? 'border-red-700 text-red-700'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>2. Quản Lý Giảng Viên ({instructors.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('courses')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'courses'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>
              {isInstructor ? `2. Khóa Học & Bài Học Của Tôi (${scopedCourses.length})` : `3. Quản Lý Khóa Học & Bài Học (${courses.length})`}
            </span>
          </button>

          {isInstructor && (
            <button
              onClick={() => setActiveTab('instructors')}
              className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'instructors'
                  ? 'border-red-700 text-red-700'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>3. Hồ Sơ Bếp Trưởng & Tài Khoản</span>
            </button>
          )}

          {!isInstructor && (
            <button
              onClick={() => setActiveTab('homepage')}
              className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'homepage'
                  ? 'border-red-700 text-red-700 font-bold'
                  : 'border-transparent text-stone-600 hover:text-stone-900 font-medium'
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>4. Cài Đặt Trang Chủ & Giao Diện</span>
            </button>
          )}

          {!isInstructor && (
            <button
              onClick={() => setActiveTab('payment')}
              className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'payment'
                  ? 'border-red-700 text-red-700 font-bold'
                  : 'border-transparent text-stone-600 hover:text-stone-900 font-medium'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>5. Cài Đặt Thanh Toán & Ngân Hàng (SePay)</span>
            </button>
          )}

          {!isInstructor && (
            <button
              onClick={() => setActiveTab('firebase')}
              className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'firebase'
                  ? 'border-red-700 text-red-700 font-bold'
                  : 'border-transparent text-stone-600 hover:text-stone-900 font-medium'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>6. Cấu Hình Firebase Storage</span>
            </button>
          )}
        </div>

        {/* TAB 1: Học Viên & Tiến Độ (Quản Lý Theo Từng Học Viên) */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
              <div className="relative flex-1 w-full md:max-w-md">
                <input
                  type="text"
                  placeholder="Tìm theo tên học viên, email, số điện thoại, khóa học..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-red-600 transition-colors"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 focus:outline-none focus:border-red-600"
                >
                  <option value="all">{isInstructor ? 'Tất cả khóa của tôi' : 'Tất cả khóa học'}</option>
                  {scopedCourses.map(c => (
                    <option key={c.id} value={c.id}>{c.title.split(' - ')[0]}</option>
                  ))}
                </select>

                <select
                  value={enrollmentTypeFilter}
                  onChange={(e) => setEnrollmentTypeFilter(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 focus:outline-none focus:border-red-600"
                >
                  <option value="all">Tất cả hình thức</option>
                  <option value="paid">Đã mua (Trả phí)</option>
                  <option value="trial">Học thử (0đ)</option>
                </select>

                <div className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-2 rounded-xl">
                  {filteredStudents.length} / {students.length} học viên
                </div>
              </div>
            </div>

            {/* Students Table - Managed by UNIQUE STUDENT */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Học Viên</th>
                      <th className="p-4">Khóa Học Đã Đăng Ký</th>
                      <th className="p-4">Tổng Chi Tiêu</th>
                      <th className="p-4">Tiến Độ Trung Bình</th>
                      <th className="p-4">Ưu Đãi & Voucher</th>
                      <th className="p-4">Ngày Tham Gia</th>
                      <th className="p-4 text-right">Thao Tác Quản Lý</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-stone-400">
                          <Users className="w-10 h-10 mx-auto mb-2 text-stone-300 stroke-[1.5]" />
                          <p className="font-bold text-sm text-stone-600">Không tìm thấy học viên nào phù hợp</p>
                          <p className="text-xs text-stone-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc</p>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => {
                        const studentEnrollments = enrollments.filter(e => e.studentId === student.id);
                        const paidEnrollments = studentEnrollments.filter(e => e.type === 'paid');
                        const trialEnrollments = studentEnrollments.filter(e => e.type === 'trial');
                        const totalSpent = paidEnrollments.reduce((sum, e) => sum + (e.pricePaid || 0), 0);

                        // Average progress calculation across all enrolled courses
                        let totalCompletedLessons = 0;
                        let totalAvailableLessons = 0;
                        studentEnrollments.forEach(enr => {
                          const crs = courses.find(c => c.id === enr.courseId);
                          const crsLessons = crs ? crs.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0) : 18;
                          totalAvailableLessons += crsLessons;
                          totalCompletedLessons += enr.completedLessonIds.length;
                        });
                        const avgProgress = totalAvailableLessons > 0 
                          ? Math.min(100, Math.round((totalCompletedLessons / totalAvailableLessons) * 100))
                          : 0;

                        const activeDiscountsCount = (student.discounts || []).length;

                        return (
                          <tr key={student.id} className="hover:bg-stone-50/80 transition-colors group">
                            {/* Cột 1: Thông tin học viên (Bấm vào tên để mở modal chi tiết) */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => setSelectedStudentForDetails(student)}
                                  className="relative group/avatar cursor-pointer shrink-0"
                                  title="Bấm để xem hồ sơ chi tiết"
                                >
                                  <img
                                    src={student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                                    alt={student.name}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover/avatar:ring-red-600 transition-all"
                                  />
                                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                                    <Eye className="w-4 h-4 text-white" />
                                  </div>
                                </button>
                                <div className="space-y-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedStudentForDetails(student)}
                                    className="font-bold text-stone-900 text-xs sm:text-sm hover:text-red-700 hover:underline text-left cursor-pointer flex items-center gap-1.5"
                                  >
                                    <span>{student.name}</span>
                                    {student.role === 'admin' && (
                                      <span className="px-1.5 py-0.5 text-[9px] font-black bg-stone-900 text-white rounded">ADMIN</span>
                                    )}
                                  </button>
                                  <p className="text-[11px] text-stone-500 flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-stone-400" />
                                    <span>{student.email}</span>
                                  </p>
                                  <p className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-stone-400" />
                                    <span>{student.phone}</span>
                                  </p>
                                  {student.goal && (
                                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600 max-w-[200px] truncate" title={student.goal}>
                                      🎯 {student.goal}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Cột 2: Các khóa học đã đăng ký */}
                            <td className="p-4">
                              <div className="space-y-1.5 max-w-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-stone-900 text-xs">
                                    {studentEnrollments.length} khóa
                                  </span>
                                  {paidEnrollments.length > 0 && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      {paidEnrollments.length} đã mua
                                    </span>
                                  )}
                                  {trialEnrollments.length > 0 && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                      {trialEnrollments.length} học thử
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {studentEnrollments.map(e => (
                                    <span
                                      key={e.id}
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium truncate max-w-[190px] inline-flex items-center gap-1 ${
                                        e.type === 'paid' 
                                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                                      }`}
                                      title={e.courseTitle}
                                    >
                                      {e.type === 'paid' ? '✓' : '⏱'} {e.courseTitle.split(' - ')[0]}
                                    </span>
                                  ))}
                                  {studentEnrollments.length === 0 && (
                                    <span className="text-[11px] text-stone-400 italic">Chưa đăng ký khóa nào</span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Cột 3: Tổng chi tiêu */}
                            <td className="p-4">
                              <div className="space-y-0.5">
                                <p className="font-black text-stone-900 text-xs sm:text-sm">
                                  {formatPrice(totalSpent)}
                                </p>
                                <p className="text-[10px] text-stone-500">
                                  {paidEnrollments.length > 0 ? 'Thanh toán thành công' : 'Chưa phát sinh mua'}
                                </p>
                              </div>
                            </td>

                            {/* Cột 4: Tiến độ học tập trung bình */}
                            <td className="p-4">
                              <div className="space-y-1 w-32">
                                <div className="flex justify-between text-[11px] font-bold">
                                  <span className="text-stone-700">{totalCompletedLessons}/{totalAvailableLessons} bài</span>
                                  <span className="text-red-700">{avgProgress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-red-700 rounded-full transition-all duration-300"
                                    style={{ width: `${avgProgress}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Cột 5: Ưu đãi & Voucher */}
                            <td className="p-4">
                              <div className="space-y-1">
                                {activeDiscountsCount > 0 ? (
                                  <div className="flex items-center gap-1">
                                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-extrabold flex items-center gap-1">
                                      <Gift className="w-3 h-3" />
                                      {activeDiscountsCount} ưu đãi
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-stone-400">Chưa có mã</span>
                                )}
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setStudentForDiscount(student);
                                      setDiscountCode(`VIP${Math.floor(1000 + Math.random() * 9000)}`);
                                    }}
                                    className="text-[11px] font-bold text-red-700 hover:text-red-800 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Tặng thêm</span>
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Cột 6: Ngày tham gia */}
                            <td className="p-4 text-stone-500 text-[11px] whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-stone-400" />
                                <span>{student.registeredAt || 'Mới đây'}</span>
                              </div>
                            </td>

                            {/* Cột 7: Thao tác quản lý */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedStudentForDetails(student)}
                                  className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Xem toàn bộ hồ sơ, khóa học và tiến độ của học viên"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Chi tiết</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setStudentForDiscount(student);
                                    setDiscountCode(`VIP${Math.floor(1000 + Math.random() * 9000)}`);
                                  }}
                                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Tặng mã giảm giá hoặc tặng khóa học 0đ cho học viên"
                                >
                                  <Gift className="w-3.5 h-3.5 text-amber-700" />
                                  <span>Ưu đãi</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setStudentToDelete(student)}
                                  className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Xóa tài khoản học viên"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Quản Lý Giảng Viên / Hồ Sơ Giảng Viên */}
        {activeTab === 'instructors' && (
          isInstructor ? (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-xs space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                  <div className="flex items-center gap-4">
                    <img
                      src={currentInstructorProfile?.avatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80'}
                      alt={currentInstructorProfile?.name}
                      className="w-20 h-20 rounded-2xl object-cover ring-4 ring-amber-100 shadow-md"
                    />
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                        Hồ Sơ Giảng Viên Của Bạn
                      </span>
                      <h2 className="text-2xl font-black text-stone-900 mt-1">
                        {currentInstructorProfile?.name || currentUser?.name}
                      </h2>
                      <p className="text-xs text-red-700 font-semibold">{currentInstructorProfile?.title}</p>
                      <p className="text-xs text-stone-500">{currentInstructorProfile?.specialty}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentInstructorProfile) {
                        handleOpenEditChef(currentInstructorProfile);
                      }
                    }}
                    className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Chỉnh Sửa Hồ Sơ & Mật Khẩu</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <h4 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Tài Khoản Đăng Nhập Của Bạn</span>
                    </h4>
                    <div className="text-xs space-y-1.5 pt-1">
                      <p className="text-stone-600">Tên đăng nhập (User): <strong className="font-mono text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">{currentInstructorProfile?.username || 'cheftuan'}</strong></p>
                      <p className="text-stone-600">Mật khẩu: <strong className="font-mono text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">{currentInstructorProfile?.password || '123456'}</strong></p>
                      <p className="text-stone-600">Email: <span className="font-mono text-stone-900">{currentInstructorProfile?.email || `${currentInstructorProfile?.username || 'chef'}@hocmonngon.vn`}</span></p>
                    </div>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <h4 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>Thông Tin Liên Hệ & Tư Vấn</span>
                    </h4>
                    <div className="text-xs space-y-1.5 pt-1">
                      <p className="text-stone-600">Số điện thoại: <strong className="text-stone-900">{currentInstructorProfile?.phone || '0988409798'}</strong></p>
                      <p className="text-stone-600">Zalo giải đáp 1-1: <strong className="text-stone-900">{currentInstructorProfile?.zalo || '0988409798'}</strong></p>
                      <p className="text-stone-600">Số khóa học đang giảng dạy: <strong className="text-red-700">{scopedCourses.length} khóa học</strong></p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                  <h4 className="text-xs font-black text-stone-900">Tiểu sử & Kinh nghiệm thực chiến</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {currentInstructorProfile?.bio || 'Chuyên gia giảng dạy ẩm thực tại Học Món Ngon.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-stone-900">Danh Sách Bếp Trưởng & Giảng Viên</h2>
                  <p className="text-xs text-stone-500">
                    Sắp xếp thứ tự giảng viên hiển thị trên Trang Chủ (Giảng viên ở vị trí #1 sẽ xuất hiện đầu tiên) • Thêm mới & cấp user/mật khẩu đăng nhập
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddInstructorModal(true)}
                    className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Giảng Viên Mới</span>
                  </button>
                </div>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructors.map((chef, index) => (
                <div key={chef.id} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative">
                  {/* Thứ tự hiển thị & Nút di chuyển vị trí */}
                  <div className={`flex items-center justify-between pb-3 border-b ${index === 0 ? 'border-red-100 bg-red-50/50 -mx-6 -mt-6 p-4 rounded-t-2xl' : 'border-stone-100'}`}>
                    {index === 0 ? (
                      <span className="px-2.5 py-1 rounded-full bg-linear-to-r from-red-700 to-amber-600 text-white font-black text-[10px] flex items-center gap-1 shadow-2xs">
                        <Star className="w-3 h-3 fill-current text-yellow-300" />
                        <span>#1 ĐẦU TIÊN TRÊN TRANG CHỦ</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold text-[10px]">
                        Vị trí #{index + 1} trên Trang Chủ
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveInstructor(chef.id, 'top')}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                          title="Đưa giảng viên này lên vị trí #1 để hiển thị đầu tiên trên Trang Chủ"
                        >
                          <ChevronsUp className="w-3.5 h-3.5 text-amber-700" />
                          <span>Lên đầu</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveInstructor(chef.id, 'up')}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                          index === 0
                            ? 'opacity-30 cursor-not-allowed text-stone-300 bg-stone-50'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer'
                        }`}
                        title="Di chuyển lên trên 1 bậc"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={index === instructors.length - 1}
                        onClick={() => handleMoveInstructor(chef.id, 'down')}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                          index === instructors.length - 1
                            ? 'opacity-30 cursor-not-allowed text-stone-300 bg-stone-50'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer'
                        }`}
                        title="Di chuyển xuống dưới 1 bậc"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <img
                        src={chef.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80'}
                        alt={chef.name}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-red-100 shadow-xs"
                      />
                      <div>
                        <h3 className="font-black text-base text-stone-900">{chef.name}</h3>
                        <p className="text-[11px] text-red-700 font-semibold">{chef.title}</p>
                        <p className="text-[10px] text-stone-400 font-mono">Zalo/SĐT: {chef.phone || '0988409798'}</p>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      {chef.bio}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-stone-500 font-semibold pt-1 border-t border-stone-100">
                      <span>📖 {chef.courseCount} khóa</span>
                      <span>👥 {chef.studentCount.toLocaleString()}+ học viên</span>
                      <span className="text-amber-600">★ {chef.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        const filtered = courses.filter(c => c.instructorId === chef.id);
                        if (filtered.length > 0) {
                          setSelectedCourseForLessons(filtered[0]);
                          setActiveTab('courses');
                        } else {
                          setNewCourseInstructorId(chef.id);
                          setShowAddCourseModal(true);
                        }
                      }}
                      className="text-xs font-bold text-stone-700 hover:text-red-700 cursor-pointer flex items-center gap-1"
                    >
                      {courses.filter(c => c.instructorId === chef.id).length > 0 ? (
                        <span>Xem các khóa học ({courses.filter(c => c.instructorId === chef.id).length}) →</span>
                      ) : (
                        <span className="text-red-700 font-extrabold flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Tạo khóa học đầu tiên →
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setNewCourseInstructorId(chef.id);
                          setShowAddCourseModal(true);
                        }}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title={`Thêm khóa học mới cho ${chef.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm khóa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditChef(chef)}
                        className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title={`Chỉnh sửa thông tin ${chef.name}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setChefToDelete(chef)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title={`Xóa bếp trưởng ${chef.name} và toàn bộ khóa học liên quan`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )
        )}

        {/* TAB 3: Quản Lý Khóa Học, Nhóm & Bài Học (Yêu Cầu 1, 2, 3) */}
        {activeTab === 'courses' && (
          <div className="space-y-8">
            {/* Top Course Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-stone-900">Quản Lý Khóa Học, Phân Loại & Bài Học</h2>
                <p className="text-xs text-stone-500">
                  Tắt/bật học thử miễn phí theo chương & bài học • Cơ chế bán công thức tài liệu riêng biệt
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddCourseModal(true)}
                  className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Khóa Học Mới</span>
                </button>
              </div>
            </div>

            {/* Course Selector to manage its lessons */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-2">
                    <span>Chọn Khóa Học Để Quản Lý Bài Học</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                      {scopedCourses.length} khóa
                    </span>
                  </label>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {isInstructor
                      ? 'Chỉ hiển thị các khóa học do bạn trực tiếp giảng dạy. Chọn một khóa để thêm hoặc quản lý bài học.'
                      : 'Mặc định hiển thị 4 khóa học mới nhất. Tìm kiếm nhanh theo tên khóa hoặc giảng viên.'}
                  </p>
                </div>

                {/* Ô tìm kiếm khóa học (Yêu cầu 2) */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Tìm khóa học hoặc tên giảng viên..."
                    value={tab3CourseSearch}
                    onChange={(e) => setTab3CourseSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-600 focus:bg-white focus:ring-1 focus:ring-red-600 transition-all placeholder:text-stone-400"
                  />
                  {tab3CourseSearch && (
                    <button
                      type="button"
                      onClick={() => setTab3CourseSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                      title="Xóa tìm kiếm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {scopedCourses.length === 0 ? (
                <div className="text-center py-10 px-4 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 space-y-3">
                  <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="font-black text-stone-900 text-sm">
                      {isInstructor ? 'Bạn chưa có khóa học nào' : 'Chưa có khóa học nào trên hệ thống'}
                    </h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      {isInstructor 
                        ? 'Hãy tạo khóa học đầu tiên của bạn để bắt đầu tải lên giáo trình, bài giảng video và công thức.'
                        : 'Hãy tạo khóa học đầu tiên để bắt đầu thêm bài học và cấu hình học thử miễn phí.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (isInstructor && currentInstructorId) {
                        setNewCourseInstructorId(currentInstructorId);
                      }
                      setShowAddCourseModal(true);
                    }}
                    className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo Khóa Học Mới Ngay</span>
                  </button>
                </div>
              ) : displayedCoursesTab3.length === 0 ? (
                <div className="text-center py-8 px-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <p className="text-xs text-stone-600 font-medium">
                    Không tìm thấy khóa học nào phù hợp với từ khóa <span className="font-bold text-stone-900">&quot;{tab3CourseSearch}&quot;</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setTab3CourseSearch('')}
                    className="text-xs font-bold text-red-700 hover:underline cursor-pointer"
                  >
                    Xóa bộ lọc tìm kiếm
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Danh sách 4 khóa học mới nhất với giảng viên hiển thị rõ ràng (Yêu cầu 1, 3) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {displayedCoursesTab3.map(course => {
                      const totalLessons = course.chapters.reduce((acc, c) => acc + c.lessons.length, 0);
                      const isSelected = selectedCourseForLessons?.id === course.id;

                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => setSelectedCourseForLessons(course)}
                          className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                            isSelected
                              ? 'bg-red-50/90 border-red-500 ring-2 ring-red-500/20 shadow-xs'
                              : 'bg-stone-50 hover:bg-stone-100 border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <img
                              src={course.thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                              alt={course.title}
                              className="w-12 h-12 rounded-lg object-cover ring-1 ring-stone-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              {/* Hiển thị Giảng viên trên mỗi khóa học */}
                              <div className="flex items-center gap-1.5 mb-1">
                                <img
                                  src={course.instructorAvatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=100&q=80'}
                                  alt={course.instructorName}
                                  className="w-4 h-4 rounded-full object-cover ring-1 ring-stone-200 shrink-0"
                                />
                                <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded truncate max-w-[130px]" title={course.instructorName}>
                                  GV: {course.instructorName}
                                </span>
                              </div>
                              <h4 className="text-xs font-black text-stone-900 line-clamp-2 leading-tight">
                                {course.title.split(' - ')[0]}
                              </h4>
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-stone-200/70 flex items-center justify-between text-[11px]">
                            <span className="text-stone-500 font-semibold text-[10px]">
                              {totalLessons} bài học
                            </span>
                            {isSelected ? (
                              <span className="font-bold text-red-700 flex items-center gap-1 text-[10px]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Đang chọn
                              </span>
                            ) : (
                              <span className="text-stone-400 group-hover:text-stone-700 text-[10px] font-bold">
                                Chọn quản lý →
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Nút Xem tất cả / Thu gọn khi có hơn 4 khóa học (Yêu cầu 3) */}
                  {!tab3CourseSearch.trim() && filteredCoursesForTab3.length > 4 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-stone-100">
                      <p className="text-xs text-stone-500">
                        {showAllCoursesTab3
                          ? `Đang hiển thị toàn bộ ${filteredCoursesForTab3.length} khóa học`
                          : `Đang hiển thị 4 khóa học mới nhất (còn ${filteredCoursesForTab3.length - 4} khóa khác)`
                        }
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAllCoursesTab3(!showAllCoursesTab3)}
                        className="self-start sm:self-auto px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{showAllCoursesTab3 ? 'Thu gọn (chỉ hiện 4 khóa mới nhất)' : `Xem tất cả ${filteredCoursesForTab3.length} khóa học`}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllCoursesTab3 ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Inline Add Chapter Form in Tab 3 */}
            {showAddChapterInTab3 && selectedCourseForLessons && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-stone-900 text-xs flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-amber-700" />
                    Thêm chương học mới cho khóa: {selectedCourseForLessons.title}
                  </h4>
                  <button
                    onClick={() => setShowAddChapterInTab3(false)}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ví dụ: Chương 3: Kỹ thuật căn chỉnh gia vị & Nấu sốt"
                    value={newChapterTitleInTab3}
                    onChange={(e) => setNewChapterTitleInTab3(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold"
                  />
                  <button
                    onClick={handleAddChapterInTab3}
                    className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Lưu Chương
                  </button>
                </div>
              </div>
            )}

            {/* Selected Course's Detailed Curriculum & Rules (Requirement 3) */}
            {selectedCourseForLessons && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                  <div className="flex items-start gap-4">
                    <img
                      src={selectedCourseForLessons.thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                      alt={selectedCourseForLessons.title}
                      className="w-16 h-16 rounded-xl object-cover ring-1 ring-stone-200 shrink-0"
                    />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                          Nhóm: {selectedCourseForLessons.category}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1">
                          <img
                            src={selectedCourseForLessons.instructorAvatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=100&q=80'}
                            alt={selectedCourseForLessons.instructorName}
                            className="w-3.5 h-3.5 rounded-full object-cover"
                          />
                          GV: {selectedCourseForLessons.instructorName}
                        </span>
                        <span className="text-xs text-stone-500">
                          • Học phí: <span className="font-bold text-stone-800">{formatPrice(selectedCourseForLessons.discountPrice)}</span>
                        </span>
                      </div>
                      <h3 className="font-black text-stone-900 text-base leading-tight">
                        {selectedCourseForLessons.title}
                      </h3>

                      {/* 2 NÚT THAO TÁC ĐIỀU CHỈNH KHÓA HỌC: HIỂN THỊ NGAY GẦN TÊN KHÓA HỌC (YÊU CẦU 4) */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setShowAddChapterInTab3(true)}
                          className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          title="Tạo chương học mới cho khóa học này"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-800" />
                          <span>+ Thêm chương mới</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAddLessonModal()}
                          className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          title="Thêm bài học vào khóa học này"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Thêm bài học cho khóa này</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start lg:self-center">
                    <button
                      onClick={() => onNavigate('course', { courseId: selectedCourseForLessons.id })}
                      className="px-3 py-1.5 text-xs font-bold text-stone-700 hover:text-red-700 hover:bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span>Xem giao diện học viên</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseToDelete(selectedCourseForLessons)}
                      className="px-3 py-1.5 bg-stone-50 hover:bg-red-50 text-stone-600 hover:text-red-700 border border-stone-200 hover:border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Xóa khóa học này khỏi hệ thống"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Xóa khóa học này</span>
                    </button>
                  </div>
                </div>

                {/* DÒNG ĐÁNH GIÁ / HUY HIỆU NỔI BẬT KHÓA HỌC TRÊN TRANG CHỦ (YÊU CẦU THAY ĐỔI HUY HIỆU) */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-black text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-red-700" />
                        <span>Dòng đánh giá / Huy hiệu nổi bật trên góc ảnh Trang Chủ</span>
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Dòng chữ nổi bật ở góc trên bên trái ảnh bìa khóa học tại Trang Chủ (vd: &quot;Bán chạy nhất&quot;, &quot;Chuyên sâu mở quán&quot;, &quot;Công thức độc quyền&quot;...).
                      </p>
                    </div>

                    {/* Current Badge Status */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-stone-500">Đang hiển thị:</span>
                      {selectedCourseForLessons.badge === 'none' ? (
                        <span className="px-2.5 py-1 rounded bg-stone-200 text-stone-600 text-xs font-bold">
                          ⚪ Không hiển thị nhãn
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded text-xs font-bold shadow-xs ${
                          (selectedCourseForLessons.badgeColor === 'dark' || (!selectedCourseForLessons.badgeColor && selectedCourseForLessons.badge === 'Chuyên sâu mở quán')) ? 'bg-stone-900 text-white' :
                          (selectedCourseForLessons.badgeColor === 'amber' || (!selectedCourseForLessons.badgeColor && selectedCourseForLessons.badge === 'Công thức độc quyền')) ? 'bg-amber-600 text-white' :
                          (selectedCourseForLessons.badgeColor === 'emerald') ? 'bg-emerald-700 text-white' :
                          (selectedCourseForLessons.badgeColor === 'purple') ? 'bg-purple-700 text-white' :
                          (selectedCourseForLessons.badgeColor === 'blue') ? 'bg-blue-700 text-white' :
                          'bg-red-700 text-white'
                        }`}>
                          {selectedCourseForLessons.badge || 'Bán chạy nhất (Tự động)'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-stone-500 mr-1">Bấm để đổi ngay:</span>
                    
                    <button
                      type="button"
                      onClick={() => handleUpdateCourseBadge('Bán chạy nhất', 'red')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                        selectedCourseForLessons.badge === 'Bán chạy nhất'
                          ? 'bg-red-700 text-white ring-2 ring-red-400'
                          : 'bg-white hover:bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      🔴 Bán chạy nhất
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateCourseBadge('Chuyên sâu mở quán', 'dark')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                        selectedCourseForLessons.badge === 'Chuyên sâu mở quán'
                          ? 'bg-stone-900 text-white ring-2 ring-stone-500'
                          : 'bg-white hover:bg-stone-100 text-stone-800 border border-stone-300'
                      }`}
                    >
                      ⚫ Chuyên sâu mở quán
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateCourseBadge('Công thức độc quyền', 'amber')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                        selectedCourseForLessons.badge === 'Công thức độc quyền'
                          ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                          : 'bg-white hover:bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      🟠 Công thức độc quyền
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateCourseBadge('Khóa mới phát hành', 'emerald')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                        selectedCourseForLessons.badge === 'Khóa mới phát hành'
                          ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                          : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      🟢 Khóa mới phát hành
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateCourseBadge('Masterclass VIP', 'purple')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                        selectedCourseForLessons.badge === 'Masterclass VIP'
                          ? 'bg-purple-700 text-white ring-2 ring-purple-400'
                          : 'bg-white hover:bg-purple-50 text-purple-800 border border-purple-200'
                      }`}
                    >
                      🟣 Masterclass VIP
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateCourseBadge('none', 'red')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedCourseForLessons.badge === 'none'
                          ? 'bg-stone-400 text-white ring-2 ring-stone-500'
                          : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                      }`}
                      title="Không hiển thị huy hiệu trên góc ảnh bìa"
                    >
                      ⚪ Không gắn nhãn
                    </button>
                  </div>

                  {/* Custom Badge Input */}
                  <div className="pt-2.5 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <span className="text-[11px] font-bold text-stone-600 shrink-0">Hoặc tự gõ chữ tùy ý:</span>
                    <input
                      type="text"
                      placeholder="Ví dụ: Giảm giá 50%, Bí quyết gia truyền..."
                      value={customBadgeText}
                      onChange={(e) => setCustomBadgeText(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs flex-1 font-medium focus:outline-none focus:border-red-600"
                    />
                    <select
                      value={customBadgeColor}
                      onChange={(e) => setCustomBadgeColor(e.target.value as any)}
                      className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      <option value="red">Màu đỏ (Nổi bật)</option>
                      <option value="dark">Màu đen (Sang trọng)</option>
                      <option value="amber">Màu cam (Độc quyền)</option>
                      <option value="emerald">Màu xanh lá (Mới)</option>
                      <option value="purple">Màu tím (VIP)</option>
                      <option value="blue">Màu xanh dương</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!customBadgeText.trim()) return;
                        handleUpdateCourseBadge(customBadgeText.trim(), customBadgeColor);
                        setCustomBadgeText('');
                      }}
                      className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs shrink-0"
                    >
                      Lưu huy hiệu
                    </button>
                  </div>
                </div>

                {/* Explanation Rule Banner */}
                <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1.5">
                  <p className="font-black flex items-center gap-1.5 text-blue-800">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Quy tắc học tập & phân quyền bài học:
                  </p>
                  <ul className="list-disc list-inside text-[11px] space-y-1 text-blue-800/90 pl-1">
                    <li>
                      <strong>Cơ chế mở khóa tuần tự (Chuẩn sư phạm Bếp trưởng):</strong> Học viên phải học và hoàn thành bài trước mới mở khóa bài sau; hoàn thành toàn bộ bài học trong chương này mới mở khóa chương tiếp theo.
                    </li>
                    <li>
                      <strong>Cơ chế phân cấp chương:</strong> Nếu 1 Chương được đặt là <em>Mất phí</em>, tất cả các bài học trong chương đó tự động bị khóa đối với học viên chưa thanh toán.
                    </li>
                    <li>
                      <strong>Cơ chế bán công thức riêng:</strong> Khi bật <em>Khóa tài liệu</em>, học viên được xem video miễn phí nhưng muốn tải File công thức PDF gram chuẩn phải thanh toán mua khóa học.
                    </li>
                  </ul>
                </div>

                {/* Chapters and Lessons Detailed Breakdown with Toggles */}
                <div className="space-y-6">
                  {selectedCourseForLessons.chapters.length === 0 ? (
                    <div className="p-8 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 space-y-3">
                      <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 border border-amber-200">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-stone-900 text-sm">Khóa học này hiện chưa có chương nào</h4>
                        <p className="text-xs text-stone-500 max-w-md mx-auto">
                          Bấm nút <strong>&quot;+ Thêm chương mới&quot;</strong> ở cạnh tên khóa học phía trên để tạo chương đầu tiên cho bài học.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddChapterInTab3(true)}
                        className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tạo Chương Đầu Tiên</span>
                      </button>
                    </div>
                  ) : (
                    selectedCourseForLessons.chapters.map(chap => {
                      const isChapterFree = chap.isFree !== false;

                      return (
                        <div 
                          key={chap.id} 
                          className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                            isChapterFree 
                              ? 'bg-stone-50/80 border-stone-200' 
                              : 'bg-stone-100/90 border-stone-300'
                          }`}
                        >
                          {/* Chapter Header with Edit, Free/Paid Toggle & Delete */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-stone-900 text-sm sm:text-base">
                                  📂 {chap.title}
                                </h4>
                                <span className="text-[11px] text-stone-500 font-medium">
                                  ({chap.lessons.length} bài)
                                </span>
                              </div>
                              {!isChapterFree && (
                                <p className="text-[11px] text-red-700 font-semibold flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Chương này đang khóa mất phí: Tất cả {chap.lessons.length} bài học đều yêu cầu thanh toán
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Quick Add Lesson to this specific Chapter */}
                              <button
                                type="button"
                                onClick={() => handleOpenAddLessonModal(chap.id)}
                                className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                title={`Thêm bài học mới vào chương "${chap.title}"`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Thêm bài</span>
                              </button>

                              {/* Edit Chapter Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditChapter(chap)}
                                className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 hover:text-red-700 border border-stone-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                title="Chỉnh sửa tên chương và các bài học trong chương này"
                              >
                                <Pencil className="w-3.5 h-3.5 text-red-600" />
                                <span>Sửa chương</span>
                              </button>

                              {/* Chapter Free/Paid Toggle (Requirement 3) */}
                              <button
                                type="button"
                                onClick={() => handleToggleChapterFree(chap.id, isChapterFree)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                  isChapterFree
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : 'bg-stone-800 hover:bg-stone-900 text-white'
                                }`}
                                title="Bấm để chuyển trạng thái miễn phí/mất phí cho cả chương"
                              >
                                {isChapterFree ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Chương: Miễn phí (Cho học thử)</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Chương: Mất phí (Khóa toàn bộ)</span>
                                  </>
                                )}
                              </button>

                              {/* Delete Chapter with inline confirmation */}
                              {chapterToDeleteConfirm === chap.id ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-300 rounded-xl text-xs shadow-xs animate-fadeIn">
                                  <span className="font-bold text-red-800">Xóa chương & {chap.lessons.length} bài?</span>
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmDeleteChapter(chap.id)}
                                    className="px-2 py-0.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs transition-colors"
                                  >
                                    Xóa ngay
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setChapterToDeleteConfirm(null)}
                                    className="px-2 py-0.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg font-semibold text-[11px] cursor-pointer transition-colors"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleRequestDeleteChapter(chap.id)}
                                  className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Xóa chương này"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Lessons List in Chapter */}
                          <div className="mt-3 divide-y divide-stone-200 bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
                            {chap.lessons.length === 0 ? (
                              <div className="p-5 text-center text-xs text-stone-500 bg-stone-50/50 space-y-2">
                                <p className="font-semibold text-stone-700">Chương này chưa có bài học nào.</p>
                                <button
                                  type="button"
                                  onClick={() => handleOpenAddLessonModal(chap.id)}
                                  className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Thêm bài học vào chương này</span>
                                </button>
                              </div>
                            ) : (
                              chap.lessons.map(lesson => (
                                <div
                                  key={lesson.id}
                                  className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:bg-stone-50/60 transition-colors"
                                >
                                  <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold text-stone-900 text-xs sm:text-sm">
                                        {lesson.title}
                                      </span>
                                      
                                      {/* Free / Paid Status Pill */}
                                      {!isChapterFree ? (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-200 text-stone-700 flex items-center gap-1" title="Chương mất phí nên bài này mất phí">
                                          <Lock className="w-2.5 h-2.5" /> Khóa theo chương
                                        </span>
                                      ) : lesson.isFreeTrial ? (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                          <CheckCircle2 className="w-2.5 h-2.5" /> Học thử miễn phí
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1">
                                          <Lock className="w-2.5 h-2.5" /> Có phí (Phải mua)
                                        </span>
                                      )}

                                      {/* Document lock status pill (Requirement 2) */}
                                      {lesson.requirePaymentForDoc ? (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                                          <Lock className="w-2.5 h-2.5 text-purple-700" /> Bán công thức riêng (Tài liệu khóa)
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600">
                                          Tài liệu mở cùng video
                                        </span>
                                      )}
                                    </div>

                                    <p className="text-[11px] text-stone-500 flex items-center gap-3">
                                      <span>⏱ {lesson.durationMinutes} phút</span>
                                      <span>📹 Video YouTube Embed</span>
                                      {lesson.recipeDocumentUrl && (
                                        <span>📄 Tài liệu: {lesson.recipeDocumentUrl.slice(0, 30)}...</span>
                                      )}
                                    </p>
                                  </div>

                                  {/* Action Buttons: Toggle Free + Toggle Doc + Delete */}
                                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                    {/* Toggle Free for this lesson (Requirement 3) */}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleLessonFree(lesson.id, isChapterFree)}
                                      disabled={!isChapterFree}
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                                        !isChapterFree
                                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                                          : lesson.isFreeTrial
                                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 cursor-pointer'
                                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 cursor-pointer'
                                      }`}
                                      title={!isChapterFree ? 'Chương này đang đặt Mất phí' : 'Click để chuyển đổi Học thử / Có phí'}
                                    >
                                      {lesson.isFreeTrial && isChapterFree ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-600" />
                                          <span>Đang Miễn Phí</span>
                                        </>
                                      ) : (
                                        <>
                                          <Lock className="w-3 h-3 text-stone-500" />
                                          <span>Đang Có Phí</span>
                                        </>
                                      )}
                                    </button>

                                    {/* Toggle Doc Lock for this lesson (Requirement 2) */}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleLessonDocPaid(lesson.id)}
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                        lesson.requirePaymentForDoc
                                          ? 'bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300'
                                          : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200'
                                      }`}
                                      title="Tắt/Bật chế độ bán công thức: khi bật, tài liệu yêu cầu trả tiền mới được tải"
                                    >
                                      <FileText className="w-3 h-3" />
                                      <span>{lesson.requirePaymentForDoc ? 'Khóa Tài Liệu' : 'Mở Tài Liệu'}</span>
                                    </button>

                                    {/* Delete lesson with inline confirmation */}
                                    {lessonToDeleteConfirm === lesson.id ? (
                                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-300 rounded-lg text-[11px] shadow-xs animate-fadeIn">
                                        <span className="font-bold text-red-800">Xóa bài này?</span>
                                        <button
                                          type="button"
                                          onClick={() => handleConfirmDeleteLesson(lesson.id)}
                                          className="px-2 py-0.5 bg-red-700 hover:bg-red-800 text-white rounded font-bold text-[10px] cursor-pointer shadow-2xs transition-colors"
                                        >
                                          Xóa
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setLessonToDeleteConfirm(null)}
                                          className="px-1.5 py-0.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded font-semibold text-[10px] cursor-pointer transition-colors"
                                        >
                                          Hủy
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleRequestDeleteLesson(lesson.id)}
                                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title="Xóa bài học này"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Cài Đặt Trang Chủ & Giao Diện Website */}
        {activeTab === 'homepage' && (
          <AdminHomepageSettings
            onNavigateHome={() => onNavigate('home')}
            showToast={(msg: string) => setActionAlert({ type: 'success', message: msg })}
          />
        )}

        {/* TAB 5: Cài Đặt Thanh Toán & Ngân Hàng & SePay Webhook */}
        {activeTab === 'payment' && (
          <AdminPaymentSettings
            courses={courses}
            onCourseUpdated={onRefreshData}
            showToast={(msg: string) => setActionAlert({ type: 'success', message: msg })}
          />
        )}

        {/* TAB 5: Firebase Storage Integration */}
        {activeTab === 'firebase' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 max-w-3xl">
            <div>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
                LƯU TRỮ HỌC VIÊN CLOUD
              </span>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight mt-2">
                Kết Nối & Đồng Bộ Firebase Firestore
              </h2>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Ứng dụng hỗ trợ lưu trữ thông tin học viên, tiến độ hoàn thành bài học và danh sách khóa học lên Firebase Firestore để triển khai trực tiếp lên Vercel. Chế độ nén ảnh tự động giúp tiết kiệm 90%+ dung lượng Firestore!
              </p>
            </div>

            <div className="space-y-4">
              {/* Quick Paste Snippet Tool */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Dán nhanh mã cấu hình từ Firebase Console (Tùy chọn)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPasteBox(!showPasteBox)}
                    className="text-xs font-bold text-red-700 hover:text-red-800 cursor-pointer"
                  >
                    {showPasteBox ? 'Đóng ô dán mã' : '+ Mở ô dán mã'}
                  </button>
                </div>

                {showPasteBox && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] text-stone-500">
                      Copy toàn bộ đoạn mã <code className="px-1 py-0.5 bg-stone-200 rounded font-mono text-stone-800">const firebaseConfig = &#123; ... &#125;;</code> trong Firebase Console và dán vào đây:
                    </p>
                    <textarea
                      rows={4}
                      value={fbPasteSnippet}
                      onChange={(e) => setFbPasteSnippet(e.target.value)}
                      placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "hocmonngon.firebaseapp.com",\n  projectId: "hocmonngon",\n  storageBucket: "hocmonngon.appspot.com",\n  messagingSenderId: "123456789",\n  appId: "1:123456789:web:abcdef"\n};`}
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={handleParseFirebaseSnippet}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tự Động Nhận Diện & Điền 6 Thông Số</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 6 Full Firebase Config Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    1. Firebase API Key <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="AIzaSy..."
                    value={fbConfig.apiKey}
                    onChange={(e) => {
                      const updated = { ...fbConfig, apiKey: e.target.value.trim() };
                      setFbConfig(updated);
                      StorageService.saveFirebaseConfig(updated);
                    }}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                  <p className="text-[10px] text-stone-400 mt-0.5">Khóa API Web của dự án</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    2. Project ID <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="hocmonngon"
                    value={fbConfig.projectId}
                    onChange={(e) => {
                      const pId = e.target.value.trim();
                      const updated = { 
                        ...fbConfig, 
                        projectId: pId,
                        authDomain: fbConfig.authDomain || (pId ? `${pId}.firebaseapp.com` : ''),
                        storageBucket: fbConfig.storageBucket || (pId ? `${pId}.appspot.com` : '')
                      };
                      setFbConfig(updated);
                      StorageService.saveFirebaseConfig(updated);
                    }}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                  <p className="text-[10px] text-stone-400 mt-0.5">Mã định danh dự án trên Firebase</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    3. Auth Domain
                  </label>
                  <input
                    type="text"
                    placeholder="hocmonngon.firebaseapp.com"
                    value={fbConfig.authDomain}
                    onChange={(e) => {
                      const updated = { ...fbConfig, authDomain: e.target.value.trim() };
                      setFbConfig(updated);
                      StorageService.saveFirebaseConfig(updated);
                    }}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                  <p className="text-[10px] text-stone-400 mt-0.5">Tên miền xác thực người dùng</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    4. Storage Bucket
                  </label>
                  <input
                    type="text"
                    placeholder="hocmonngon.appspot.com hoặc .firebasestorage.app"
                    value={fbConfig.storageBucket}
                    onChange={(e) => {
                      const updated = { ...fbConfig, storageBucket: e.target.value.trim() };
                      setFbConfig(updated);
                      StorageService.saveFirebaseConfig(updated);
                    }}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                  <p className="text-[10px] text-stone-400 mt-0.5">Máy chủ lưu trữ file & hình ảnh</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    5. Messaging Sender ID
                  </label>
                  <input
                    type="text"
                    placeholder="123456789012"
                    value={fbConfig.messagingSenderId}
                    onChange={(e) => {
                      const updated = { ...fbConfig, messagingSenderId: e.target.value.trim() };
                      setFbConfig(updated);
                      StorageService.saveFirebaseConfig(updated);
                    }}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                  <p className="text-[10px] text-stone-400 mt-0.5">Mã số định danh gửi thông báo (FCM)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    6. App ID
                  </label>
                  <input
                    type="text"
                    placeholder="1:123456789012:web:abcdef..."
                    value={fbConfig.appId}
                    onChange={(e) => {
                      const updated = { ...fbConfig, appId: e.target.value.trim() };
                      setFbConfig(updated);
                      StorageService.saveFirebaseConfig(updated);
                    }}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                  <p className="text-[10px] text-stone-400 mt-0.5">Mã định danh ứng dụng Web Client</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={fbTesting}
                  onClick={handleTestFirebase}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {fbTesting ? 'Đang kiểm tra kết nối...' : 'Lưu & Kiểm Tra Kết Nối'}
                </button>

                <button
                  type="button"
                  disabled={fbTesting}
                  onClick={handleSyncAllData}
                  className="px-4 py-2.5 bg-red-700 hover:bg-red-800 disabled:bg-stone-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${fbTesting ? 'animate-spin' : ''}`} />
                  <span>Đồng Bộ Toàn Diện Dữ Liệu Lên Firestore</span>
                </button>

                <button
                  type="button"
                  disabled={fbTesting}
                  onClick={handleLoadRemoteFromFirebase}
                  className="px-4 py-2.5 bg-white hover:bg-stone-100 disabled:bg-stone-100 text-stone-700 font-bold text-xs rounded-xl border border-stone-300 shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5 text-stone-500" />
                  <span>Tải Dữ Liệu Từ Firestore Về Trình Duyệt</span>
                </button>

                <button
                  type="button"
                  disabled={fbTesting}
                  onClick={handleSyncAllStudents}
                  className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 disabled:bg-stone-100 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Đồng Bộ Học Viên
                </button>
              </div>

              {fbStatusMessage && (
                <div className="p-3 bg-stone-100 rounded-xl text-xs font-semibold text-stone-800 border border-stone-200">
                  {fbStatusMessage}
                </div>
              )}
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <p className="font-extrabold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Chế độ Đồng Bộ Thông Minh (Offline-First)
              </p>
              <p className="text-emerald-800">
                Khi chưa điền key Firebase, hệ thống tự động lưu trữ đầy đủ trong localStorage trình duyệt để bạn trải nghiệm và test mọi tính năng mà không bị gián đoạn!
              </p>
            </div>

            {/* VERCEL ENVIRONMENT VARIABLES HELPER (CRITICAL FOR LIVE VERCEL DEPLOYMENT) */}
            <div className="p-5 bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl text-white space-y-4 shadow-lg border border-stone-700">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                  BẮT BUỘC ĐỂ WEBSITE TRÊN VERCEL CẬP NHẬT GIAO DIỆN & DỮ LIỆU
                </div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Cấu Hình Biến Môi Trường (Environment Variables) Cho Vercel
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Vì lý do an toàn bảo mật, trình duyệt áp dụng nguyên tắc <b>cô lập LocalStorage theo từng tên miền</b> (Same-Origin). Khi bạn truy cập website qua đường link <b>.vercel.app</b>, trình duyệt sẽ không có sẵn các key Firebase đã lưu ở môi trường làm việc này. Để website Vercel tự động kết nối và hiển thị dữ liệu mới nhất từ Firestore cho mọi người dùng, bạn chỉ cần thực hiện 3 bước sau:
                </p>
              </div>

              {/* 3 Step Guide Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-stone-200">
                <div className="p-3.5 bg-stone-800/90 rounded-2xl border border-stone-700/80 space-y-1">
                  <div className="font-black text-amber-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-[10px] font-black">1</span>
                    Sao Chép Biến Môi Trường
                  </div>
                  <p className="text-stone-300">
                    Bấm nút <b>"Sao chép biến môi trường Vercel"</b> bên dưới để lấy toàn bộ 6 biến <code className="text-amber-300">VITE_FIREBASE_*</code>.
                  </p>
                </div>

                <div className="p-3.5 bg-stone-800/90 rounded-2xl border border-stone-700/80 space-y-1">
                  <div className="font-black text-amber-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-[10px] font-black">2</span>
                    Dán Vào Vercel Settings
                  </div>
                  <p className="text-stone-300">
                    Mở <b>Vercel Dashboard</b> &rarr; Dự án của bạn &rarr; <b>Settings</b> &rarr; <b>Environment Variables</b> &rarr; Dán vào và bấm <b>Save</b>.
                  </p>
                </div>

                <div className="p-3.5 bg-stone-800/90 rounded-2xl border border-stone-700/80 space-y-1">
                  <div className="font-black text-amber-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-[10px] font-black">3</span>
                    Redeploy Trên Vercel
                  </div>
                  <p className="text-stone-300">
                    Vào tab <b>Deployments</b> trên Vercel, bấm dấu <b>...</b> ở bản triển khai mới nhất và chọn <b>Redeploy</b> để Vercel nạp các biến này.
                  </p>
                </div>
              </div>

              {/* Code Box with 1-click copy */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                    Đoạn mã .env dành riêng cho dự án của bạn:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyVercelEnv}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    {copiedEnv ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-stone-950" />
                        <span>Đã Sao Chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-950" />
                        <span>Sao chép biến môi trường Vercel (.env)</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <pre className="p-3.5 bg-black/70 rounded-2xl font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed border border-stone-700">
                    {generateVercelEnvSnippet()}
                  </pre>
                </div>
                <p className="text-[10px] text-stone-400 italic">
                  * Mẹo: Trong giao diện Environment Variables của Vercel, bạn có thể dán toàn bộ đoạn văn bản nhiều dòng này vào ô "Key", Vercel sẽ tự động chia tách thành từng biến một cách chính xác!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Thêm Giảng Viên */}
      {showAddInstructorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-stone-900">Thêm Giảng Viên Mới</h3>
            <form onSubmit={handleSaveInstructor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Họ và tên giảng viên</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bếp trưởng Lê Minh"
                  value={newInstName}
                  onChange={(e) => setNewInstName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Danh hiệu & Kinh nghiệm</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 12 năm kinh nghiệm Bếp trưởng Món Việt"
                  value={newInstTitle}
                  onChange={(e) => setNewInstTitle(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Chuyên môn ẩm thực</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lẩu & Nướng, Bún Bò, Đồ Nhậu mở quán"
                  value={newInstSpecialty}
                  onChange={(e) => setNewInstSpecialty(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border rounded-xl"
                />
              </div>
              {/* Requirement 1: Ảnh đại diện Giảng viên Tải từ máy / Chụp ảnh camera / Tự động nén */}
              <div className="space-y-2 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-red-700" />
                    <span>Ảnh chân dung Bếp trưởng (Tự động nén ảnh)</span>
                  </label>
                  <div className="flex rounded-lg p-0.5 bg-stone-200 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setInstAvatarMode('upload')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${
                        instAvatarMode === 'upload' ? 'bg-white shadow text-stone-900' : 'text-stone-600'
                      }`}
                    >
                      Tải lên
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstAvatarMode('camera')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${
                        instAvatarMode === 'camera' ? 'bg-white shadow text-stone-900' : 'text-stone-600'
                      }`}
                    >
                      Chụp ảnh
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstAvatarMode('url')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${
                        instAvatarMode === 'url' ? 'bg-white shadow text-stone-900' : 'text-stone-600'
                      }`}
                    >
                      Link URL
                    </button>
                  </div>
                </div>

                {/* Hidden File Inputs for Instructor */}
                <input
                  type="file"
                  ref={instFileInputRef}
                  accept="image/*"
                  onChange={handleInstFileInputChange}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={instNativeCameraRef}
                  accept="image/*"
                  capture="user"
                  onChange={handleInstFileInputChange}
                  className="hidden"
                />

                {/* Mode: Upload from device */}
                {instAvatarMode === 'upload' && (
                  <div
                    onClick={() => instFileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 hover:border-red-600 rounded-xl p-3.5 text-center cursor-pointer bg-white transition-all hover:bg-red-50/20 space-y-1"
                  >
                    <Upload className="w-6 h-6 text-stone-400 mx-auto" />
                    <p className="font-bold text-stone-800 text-xs">
                      Bấm vào đây để chọn ảnh chân dung từ máy tính hoặc điện thoại
                    </p>
                    <p className="text-[10px] text-stone-500">
                      Hỗ trợ JPG, PNG, WEBP. Ảnh được tự động nén vuông chuẩn 500x500 tối ưu hóa dung lượng.
                    </p>
                  </div>
                )}

                {/* Mode: Camera capture */}
                {instAvatarMode === 'camera' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => startCamera('user', 'instructor')}
                        className="py-2.5 px-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs text-xs"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Mở Camera chụp ngay</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => instNativeCameraRef.current?.click()}
                        className="py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs text-xs"
                      >
                        <SwitchCamera className="w-4 h-4" />
                        <span>Máy ảnh thiết bị</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-500 text-center">
                      Chụp trực tiếp chân dung Bếp trưởng, tự động tối ưu hóa kích thước lưu trữ.
                    </p>
                  </div>
                )}

                {/* Mode: Direct URL */}
                {instAvatarMode === 'url' && (
                  <input
                    type="text"
                    value={newInstAvatar}
                    onChange={(e) => {
                      setNewInstAvatar(e.target.value);
                      setInstCompressionStats(null);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl font-mono text-[11px]"
                  />
                )}

                {/* Compression Progress */}
                {isInstCompressing && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                    <span>Đang nén ảnh chân dung để tiết kiệm dung lượng...</span>
                  </div>
                )}

                {/* Compression Result & Image Preview */}
                {Boolean(newInstAvatar && newInstAvatar.trim()) && (
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-stone-200">
                    <img
                      src={newInstAvatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80'}
                      alt="Xem trước ảnh"
                      className="w-12 h-12 object-cover rounded-xl border border-stone-200 shrink-0 ring-2 ring-red-100"
                    />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="font-bold text-stone-900 text-xs line-clamp-1">Xem trước ảnh đại diện</p>
                      {instCompressionStats ? (
                        <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>
                            Đã nén tối ưu: {formatFileSize(instCompressionStats.compressedSize)} (Giảm {instCompressionStats.percentSaved}% dung lượng)
                          </span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-stone-500">Đang dùng ảnh đại diện hiện tại</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Tiểu sử chi tiết</label>
                <textarea
                  rows={3}
                  value={newInstBio}
                  onChange={(e) => setNewInstBio(e.target.value)}
                  placeholder="Kinh nghiệm thực chiến, nhà hàng đã tư vấn..."
                  className="w-full p-2.5 bg-stone-50 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={newInstPhone}
                    onChange={(e) => setNewInstPhone(e.target.value)}
                    placeholder="0912..."
                    className="w-full p-2.5 bg-stone-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Zalo hỗ trợ</label>
                  <input
                    type="text"
                    value={newInstZalo}
                    onChange={(e) => setNewInstZalo(e.target.value)}
                    placeholder="0912..."
                    className="w-full p-2.5 bg-stone-50 border rounded-xl"
                  />
                </div>
              </div>

              {/* Cấp Tài Khoản Đăng Nhập Cho Giảng Viên Mới (User request) */}
              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <h4 className="font-black text-amber-950 text-xs">Tạo Tài Khoản & Mật Khẩu Đăng Nhập</h4>
                    <p className="text-[10px] text-amber-800">Giảng viên đăng nhập bằng thông tin này để tự thêm/xóa bài học và xem doanh thu của mình</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-amber-950 mb-1">
                      Tên đăng nhập (User) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="vd: cheftuan, beptruong_dong"
                      value={newInstUsername}
                      onChange={(e) => setNewInstUsername(e.target.value)}
                      className="w-full p-2 bg-white border border-amber-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-amber-950 mb-1">
                      Mật khẩu <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewInstPassword ? 'text' : 'password'}
                        required
                        placeholder="Mặc định: 123456"
                        value={newInstPassword}
                        onChange={(e) => setNewInstPassword(e.target.value)}
                        className="w-full p-2 pr-8 bg-white border border-amber-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600 font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewInstPassword(!showNewInstPassword)}
                        className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                      >
                        {showNewInstPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-amber-950 mb-1">Email giảng viên (tùy chọn)</label>
                  <input
                    type="email"
                    placeholder="vd: tuan@hocmonngon.vn"
                    value={newInstEmail}
                    onChange={(e) => setNewInstEmail(e.target.value)}
                    className="w-full p-2 bg-white border border-amber-200 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddInstructorModal(false)}
                  className="px-4 py-2 bg-stone-100 rounded-xl font-bold text-stone-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  Lưu Giảng Viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Chỉnh Sửa Giảng Viên */}
      {showEditInstructorModal && editingChef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="text-lg font-black text-stone-900">
                Chỉnh Sửa Thông Tin Giảng Viên
              </h3>
              <button
                type="button"
                onClick={() => setShowEditInstructorModal(false)}
                className="p-1 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateInstructor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Họ và tên giảng viên</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bếp trưởng Lê Minh"
                  value={editInstName}
                  onChange={(e) => setEditInstName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Danh hiệu & Kinh nghiệm</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 15+ năm kinh nghiệm Bếp trưởng Món Việt"
                  value={editInstTitle}
                  onChange={(e) => setEditInstTitle(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Chuyên môn ẩm thực</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lẩu & Nướng, Bún Bò, Đồ Nhậu mở quán"
                  value={editInstSpecialty}
                  onChange={(e) => setEditInstSpecialty(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">URL Ảnh đại diện</label>
                <input
                  type="text"
                  value={editInstAvatar}
                  onChange={(e) => setEditInstAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-stone-50 border rounded-xl font-mono text-[11px]"
                />
                {editInstAvatar && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-stone-50 rounded-xl border border-stone-200">
                    <img
                      src={editInstAvatar}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-stone-300"
                    />
                    <span className="text-[11px] text-stone-500 font-medium">Ảnh đại diện xem trước</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Tiểu sử chi tiết</label>
                <textarea
                  rows={3}
                  value={editInstBio}
                  onChange={(e) => setEditInstBio(e.target.value)}
                  placeholder="Kinh nghiệm thực chiến, nhà hàng đã tư vấn..."
                  className="w-full p-2.5 bg-stone-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={editInstPhone}
                    onChange={(e) => setEditInstPhone(e.target.value)}
                    placeholder="0912..."
                    className="w-full p-2.5 bg-stone-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Zalo hỗ trợ</label>
                  <input
                    type="text"
                    value={editInstZalo}
                    onChange={(e) => setEditInstZalo(e.target.value)}
                    placeholder="0912..."
                    className="w-full p-2.5 bg-stone-50 border rounded-xl"
                  />
                </div>
              </div>

              {/* Tài Khoản & Mật Khẩu Đăng Nhập Của Giảng Viên */}
              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <h4 className="font-black text-amber-950 text-xs">Tài Khoản Đăng Nhập & Mật Khẩu</h4>
                    <p className="text-[10px] text-amber-800">Thông tin dùng để đăng nhập vào Cổng Quản Lý Giảng Viên</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-amber-950 mb-1">
                      Tên đăng nhập (User) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="vd: cheftuan"
                      value={editInstUsername}
                      onChange={(e) => setEditInstUsername(e.target.value)}
                      className="w-full p-2 bg-white border border-amber-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-amber-950 mb-1">
                      Mật khẩu <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showEditInstPassword ? 'text' : 'password'}
                        required
                        placeholder="Nhập mật khẩu mới..."
                        value={editInstPassword}
                        onChange={(e) => setEditInstPassword(e.target.value)}
                        className="w-full p-2 pr-8 bg-white border border-amber-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600 font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditInstPassword(!showEditInstPassword)}
                        className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                      >
                        {showEditInstPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-amber-950 mb-1">Email giảng viên</label>
                  <input
                    type="email"
                    placeholder="vd: tuan@hocmonngon.vn"
                    value={editInstEmail}
                    onChange={(e) => setEditInstEmail(e.target.value)}
                    className="w-full p-2 bg-white border border-amber-200 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditInstructorModal(false)}
                  className="px-4 py-2 bg-stone-100 rounded-xl font-bold text-stone-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Chỉnh Sửa Chương & Danh Sách Bài Học (Yêu cầu 3) */}
      {showEditChapterModal && editingChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-red-100 text-red-700 rounded-lg">
                    <Pencil className="w-4 h-4" />
                  </span>
                  <h3 className="text-lg font-black text-stone-900">
                    Chỉnh Sửa Chương & Các Bài Học
                  </h3>
                </div>
                <p className="text-xs text-stone-500">
                  Cập nhật tiêu đề chương, trạng thái khóa/học thử và chỉnh sửa trực tiếp từng bài học bên dưới
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditChapterModal(false);
                  setEditingChapter(null);
                }}
                className="p-1.5 hover:bg-stone-100 rounded-xl text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditChapter} className="space-y-5 text-xs">
              {/* Section 1: Thông tin Chương */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>1. Thông tin chương học</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-stone-700 mb-1">
                      Tên chương học <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingChapter.title}
                      onChange={(e) => handleUpdateEditingChapterField('title', e.target.value)}
                      placeholder="Ví dụ: Chương 1: Kỹ thuật nền tảng & Sơ chế"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-semibold text-xs focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Thứ tự hiển thị
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editingChapter.order || 1}
                      onChange={(e) => handleUpdateEditingChapterField('order', Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-semibold text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200">
                  <div>
                    <p className="font-bold text-stone-900 text-xs">Chế độ phân quyền chương:</p>
                    <p className="text-[11px] text-stone-500">
                      {editingChapter.isFree 
                        ? 'Chương Miễn phí: Học viên chưa mua khóa có thể học thử các bài được cấp quyền trong chương.'
                        : 'Chương Mất phí: Tự động khóa toàn bộ bài học trong chương, yêu cầu mua khóa học.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdateEditingChapterField('isFree', !editingChapter.isFree)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5 ${
                      editingChapter.isFree
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-stone-800 hover:bg-stone-900 text-white'
                    }`}
                  >
                    {editingChapter.isFree ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Chương Miễn Phí</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Chương Mất Phí</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Section 2: Danh sách bài học trong chương */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>2. Các bài học trong chương ({editingChapter.lessons.length} bài)</span>
                  </h4>
                  <span className="text-[11px] text-stone-500">
                    Chỉnh sửa trực tiếp tên, video, tài liệu và công thức của từng bài
                  </span>
                </div>

                {editingChapter.lessons.length === 0 ? (
                  <div className="p-4 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 text-stone-500 text-xs">
                    Chương này hiện chưa có bài học nào. Bạn có thể thêm bài học mới bằng ô bên dưới.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {editingChapter.lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 hover:border-stone-300 transition-colors"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                          <span className="px-2 py-0.5 bg-stone-200 text-stone-800 rounded font-black text-[10px]">
                            Bài #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveLessonInEditingChapter(lesson.id)}
                            className="text-stone-400 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                            title="Xóa bài học này khỏi chương"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa bài này</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="sm:col-span-2">
                            <label className="block font-bold text-stone-700 mb-1">
                              Tên bài học <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={lesson.title}
                              onChange={(e) => handleUpdateLessonInEditingChapter(lesson.id, { title: e.target.value })}
                              placeholder="Ví dụ: Bí quyết chọn nguyên liệu và định lượng"
                              className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-red-600"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-stone-700 mb-1">Thời lượng (phút)</label>
                            <input
                              type="number"
                              min={1}
                              value={lesson.durationMinutes || 15}
                              onChange={(e) => handleUpdateLessonInEditingChapter(lesson.id, { durationMinutes: Number(e.target.value) })}
                              className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-bold text-stone-700 flex items-center gap-1">
                                <Video className="w-3 h-3 text-red-600" />
                                <span>Link Video YouTube (Embed / Unlisted)</span>
                              </label>
                              {Boolean(lesson.videoUrl && lesson.videoUrl.trim()) && (
                                <button
                                  type="button"
                                  onClick={() => setVideoTestUrl(lesson.videoUrl)}
                                  className="text-red-700 hover:text-red-800 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer bg-red-50 hover:bg-red-100 px-1.5 py-0.5 rounded"
                                >
                                  <Play className="w-2.5 h-2.5" />
                                  <span>Xem thử</span>
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={lesson.videoUrl}
                              onChange={(e) => handleUpdateLessonInEditingChapter(lesson.id, { videoUrl: e.target.value })}
                              placeholder="https://youtu.be/... hoặc https://www.youtube.com/embed/..."
                              className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs font-mono text-[11px]"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1">
                              <FileText className="w-3 h-3 text-amber-600" />
                              <span>Link File Tài liệu công thức (PDF / Drive)</span>
                            </label>
                            <input
                              type="text"
                              value={lesson.recipeDocumentUrl || ''}
                              onChange={(e) => handleUpdateLessonInEditingChapter(lesson.id, { recipeDocumentUrl: e.target.value })}
                              placeholder="https://drive.google.com/file/..."
                              className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs font-mono text-[11px]"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-stone-700">Công thức & Ghi chú thực hành:</label>
                            <button
                              type="button"
                              onClick={() => handleUpdateLessonInEditingChapter(lesson.id, {
                                recipeText: generateLessonRecipeTemplate(lesson.title || 'Bài học')
                              })}
                              className="text-amber-700 hover:text-amber-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Tự động tạo mẫu công thức gram</span>
                            </button>
                          </div>
                          <textarea
                            rows={3}
                            value={lesson.recipeText || ''}
                            onChange={(e) => handleUpdateLessonInEditingChapter(lesson.id, { recipeText: e.target.value })}
                            placeholder="Nhập định lượng gram gia vị, các bước canh lửa và lưu ý thực hành..."
                            className="w-full p-2 bg-white border border-stone-300 rounded-lg font-mono text-[11px] leading-relaxed"
                          />
                        </div>

                        {/* Phân quyền bài học */}
                        <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px]">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              disabled={!editingChapter.isFree}
                              checked={editingChapter.isFree && Boolean(lesson.isFreeTrial)}
                              onChange={(e) => handleUpdateLessonInEditingChapter(lesson.id, { isFreeTrial: e.target.checked })}
                              className="w-4 h-4 text-red-600 rounded"
                            />
                            <span className={!editingChapter.isFree ? 'text-stone-400' : 'font-semibold text-stone-800'}>
                              Cho phép học viên học thử miễn phí
                            </span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={Boolean(lesson.requirePaymentForDoc)}
                              onChange={(e) => handleUpdateLessonInEditingChapter(lesson.id, { requirePaymentForDoc: e.target.checked })}
                              className="w-4 h-4 text-purple-600 rounded"
                            />
                            <span className="font-semibold text-purple-900">
                              Khóa tài liệu công thức riêng (chỉ người mua khóa mới tải được)
                            </span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Section 3: Thêm nhanh bài học mới vào chương */}
                <div className="p-3 bg-red-50/60 rounded-2xl border border-red-200 space-y-2">
                  <p className="font-bold text-red-900 text-xs flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-red-700" />
                    <span>Thêm bài học mới vào chương này:</span>
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập tên bài học mới..."
                      value={editingChapterNewLessonTitle}
                      onChange={(e) => setEditingChapterNewLessonTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddLessonInEditingChapter();
                        }
                      }}
                      className="flex-1 p-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-red-600 font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleAddLessonInEditingChapter}
                      className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-2xs whitespace-nowrap"
                    >
                      + Thêm bài
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditChapterModal(false);
                    setEditingChapter(null);
                  }}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-stone-700 cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu Thay Đổi Chương & Bài Học</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Thêm Khóa Học Mới (YÊU CẦU 1: Nhóm + / Xóa & Nén Ảnh/Camera) */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-xl font-black text-stone-900">Thêm Khóa Học Mới</h3>
                <p className="text-xs text-stone-500">Tự do thêm nhóm mới & tải ảnh nén dung lượng cao</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCourseModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Tên khóa học</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bí Quyết Nấu Bún Riêu Cua Đồng Mở Quán"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Giảng viên & Nhóm phân loại (Requirement 1: Category with + and trash) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Giảng viên phụ trách</label>
                  {isInstructor ? (
                    <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl font-bold text-amber-950 flex items-center justify-between">
                      <span>{currentInstructorProfile?.name || currentUser?.name}</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                        Khóa học của bạn
                      </span>
                    </div>
                  ) : (
                    <select
                      value={newCourseInstructorId}
                      onChange={(e) => setNewCourseInstructorId(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                    >
                      {instructors.map(chef => (
                        <option key={chef.id} value={chef.id}>{chef.name}</option>
                      ))}
                    </select>
                  )}

                  {/* Selected Instructor Preview */}
                  {(() => {
                    const selectedChef = instructors.find(i => i.id === newCourseInstructorId) || instructors[0];
                    if (!selectedChef) return null;
                    return (
                      <div className="mt-2 p-2 bg-stone-100/90 rounded-xl border border-stone-200 flex items-center gap-2.5">
                        <img
                          src={selectedChef.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80'}
                          alt={selectedChef.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-red-100 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-stone-900 text-xs truncate">{selectedChef.name}</p>
                          <p className="text-[10px] text-red-700 font-semibold truncate">{selectedChef.title}</p>
                          <p className="text-[10px] text-stone-500 truncate">{selectedChef.specialty ? `Chuyên môn: ${selectedChef.specialty}` : selectedChef.bio}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-stone-700">Nhóm / Phân loại</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowAddCategoryInput(!showAddCategoryInput)}
                        className="px-1.5 py-0.5 bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-black rounded flex items-center gap-0.5 cursor-pointer"
                        title="Thêm nhóm mới"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm nhóm</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowManageCategories(!showManageCategories)}
                        className="px-1.5 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold rounded cursor-pointer"
                        title="Quản lý & xóa nhóm cũ"
                      >
                        Quản lý ({categories.length})
                      </button>
                    </div>
                  </div>

                  {/* Inline Add Category Form */}
                  {showAddCategoryInput && (
                    <div className="mb-2 p-2.5 bg-red-50/70 rounded-xl border border-red-200 space-y-2">
                      <p className="text-[10px] font-black text-red-800 uppercase">Tạo nhóm phân loại mới:</p>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Ví dụ: Món Lẩu Nướng, Bánh Âu..."
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNewCategory();
                            }
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-red-600"
                        />
                        <button
                          type="button"
                          onClick={handleAddNewCategory}
                          className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg cursor-pointer text-xs transition-colors"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Manage / Delete Existing Categories list */}
                  {showManageCategories && (
                    <div className="mb-2 p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2 max-h-48 overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-stone-600 uppercase tracking-wider">
                          Danh sách nhóm ({categories.length}):
                        </p>
                        <span className="text-[10px] text-stone-400">Bấm icon thùng rác để xóa</span>
                      </div>

                      {/* In-box Feedback Message */}
                      {categoryFeedback && (
                        <div className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                          categoryFeedback.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                          {categoryFeedback.type === 'success' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          )}
                          <span>{categoryFeedback.message}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5">
                        {categories.map(cat => {
                          const isConfirming = categoryToDeleteConfirm === cat;
                          return isConfirming ? (
                            <div
                              key={cat}
                              className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-300 rounded-lg text-[11px] shadow-xs"
                            >
                              <span className="font-bold text-red-800">Xóa "{cat}"?</span>
                              <button
                                type="button"
                                onClick={() => handleConfirmDeleteCategory(cat)}
                                className="px-2 py-0.5 bg-red-700 hover:bg-red-800 text-white rounded font-bold text-[10px] cursor-pointer transition-colors shadow-2xs"
                              >
                                Xóa ngay
                              </button>
                              <button
                                type="button"
                                onClick={() => setCategoryToDeleteConfirm(null)}
                                className="px-1.5 py-0.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded font-semibold text-[10px] cursor-pointer transition-colors"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <div
                              key={cat}
                              className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-stone-200 hover:border-stone-300 rounded-lg text-[11px] font-semibold text-stone-800 shadow-2xs transition-colors"
                            >
                              <span>{cat}</span>
                              <button
                                type="button"
                                onClick={() => handleRequestDeleteCategory(cat)}
                                className="text-stone-400 hover:text-red-700 hover:bg-red-50 p-1 rounded cursor-pointer transition-colors"
                                title={`Xóa nhóm "${cat}"`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <select
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Giá bán & Giá gốc */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Giá bán ưu đãi (VNĐ)</label>
                  <input
                    type="number"
                    value={newCourseDiscountPrice}
                    onChange={(e) => setNewCourseDiscountPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Giá gốc (VNĐ)</label>
                  <input
                    type="number"
                    value={newCourseOriginalPrice}
                    onChange={(e) => setNewCourseOriginalPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Thời lượng & Cấp độ */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Thời lượng (giờ)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newCourseDuration}
                    onChange={(e) => setNewCourseDuration(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Cấp độ</label>
                  <select
                    value={newCourseLevel}
                    onChange={(e) => setNewCourseLevel(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Mở quán kinh doanh">Mở quán kinh doanh</option>
                    <option value="Cơ bản">Cơ bản</option>
                    <option value="Trung cấp">Trung cấp</option>
                    <option value="Nâng cao">Nâng cao</option>
                  </select>
                </div>
              </div>

              {/* Cú pháp chuyển khoản riêng cho khóa học (SePay Webhook) */}
              <div className="p-3 bg-red-50/60 rounded-2xl border border-red-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-red-700" />
                    <span>Mã Cú Pháp Chuyển Khoản Riêng (SePay Webhook)</span>
                  </label>
                  <span className="text-[10px] text-red-700 font-bold bg-white px-2 py-0.5 rounded border border-red-200">
                    Nhận diện tự động
                  </span>
                </div>
                <input
                  type="text"
                  value={newCourseTransferSyntax}
                  onChange={(e) => setNewCourseTransferSyntax(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="vd: PHOBO, BANHMI, TRASUA (để trống hệ thống sẽ tự sinh)"
                  className="w-full p-2.5 text-xs font-mono font-bold uppercase text-red-900 bg-white border border-red-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white"
                />
                <p className="text-[10px] text-stone-500">
                  Học viên chuyển khoản với cú pháp này kèm SĐT sẽ được SePay tự động kích hoạt khóa học ngay lập tức.
                </p>
              </div>

              {/* Huy hiệu nổi bật hiển thị trên Trang Chủ */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <label className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                  <Tag className="w-4 h-4 text-red-700" />
                  <span>Dòng đánh giá / Huy hiệu nổi bật trên ảnh bìa Trang Chủ</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Nội dung huy hiệu</label>
                    <input
                      type="text"
                      value={newCourseBadge}
                      onChange={(e) => setNewCourseBadge(e.target.value)}
                      placeholder="Bán chạy nhất / Chuyên sâu mở quán..."
                      className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Màu sắc huy hiệu</label>
                    <select
                      value={newCourseBadgeColor}
                      onChange={(e) => setNewCourseBadgeColor(e.target.value as any)}
                      className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <option value="red">🔴 Màu đỏ (Bán chạy nhất)</option>
                      <option value="dark">⚫ Màu đen (Chuyên sâu mở quán)</option>
                      <option value="amber">🟠 Màu cam (Công thức độc quyền)</option>
                      <option value="emerald">🟢 Màu xanh lá (Khóa mới)</option>
                      <option value="purple">🟣 Màu tím (VIP / Masterclass)</option>
                      <option value="blue">🔵 Màu xanh dương</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-stone-500 font-bold">Mẫu nhanh:</span>
                  <button
                    type="button"
                    onClick={() => { setNewCourseBadge('Bán chạy nhất'); setNewCourseBadgeColor('red'); }}
                    className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-[10px] font-bold cursor-pointer"
                  >
                    Bán chạy nhất
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewCourseBadge('Chuyên sâu mở quán'); setNewCourseBadgeColor('dark'); }}
                    className="px-2 py-0.5 bg-stone-200 text-stone-800 rounded text-[10px] font-bold cursor-pointer"
                  >
                    Chuyên sâu mở quán
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewCourseBadge('Công thức độc quyền'); setNewCourseBadgeColor('amber'); }}
                    className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold cursor-pointer"
                  >
                    Công thức độc quyền
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewCourseBadge('none'); }}
                    className="px-2 py-0.5 bg-stone-200 text-stone-600 rounded text-[10px] font-medium cursor-pointer"
                  >
                    Không gắn nhãn
                  </button>
                </div>
              </div>

              {/* Requirement 1: Ảnh đại diện Khóa học Tải từ máy / Chụp ảnh camera / Tự động nén Firestore */}
              <div className="space-y-2 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-red-700" />
                    <span>Ảnh đại diện khóa học (Tự động nén ảnh Firestore)</span>
                  </label>
                  <div className="flex rounded-lg p-0.5 bg-stone-200 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setThumbnailInputMode('upload')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${
                        thumbnailInputMode === 'upload' ? 'bg-white shadow text-stone-900' : 'text-stone-600'
                      }`}
                    >
                      Tải lên
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbnailInputMode('camera')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${
                        thumbnailInputMode === 'camera' ? 'bg-white shadow text-stone-900' : 'text-stone-600'
                      }`}
                    >
                      Chụp ảnh
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbnailInputMode('url')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${
                        thumbnailInputMode === 'url' ? 'bg-white shadow text-stone-900' : 'text-stone-600'
                      }`}
                    >
                      Link URL
                    </button>
                  </div>
                </div>

                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={nativeCameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* Mode: Upload from device */}
                {thumbnailInputMode === 'upload' && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 hover:border-red-600 rounded-xl p-4 text-center cursor-pointer bg-white transition-all hover:bg-red-50/20 space-y-1.5"
                  >
                    <Upload className="w-7 h-7 text-stone-400 mx-auto" />
                    <p className="font-bold text-stone-800">
                      Bấm vào đây để chọn ảnh từ máy tính hoặc điện thoại
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Hỗ trợ JPG, PNG, WEBP. Hệ thống tự động nén thu gọn dung lượng tối ưu cho Firestore.
                    </p>
                  </div>
                )}

                {/* Mode: Camera capture */}
                {thumbnailInputMode === 'camera' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        className="py-3 px-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Mở Camera chụp ngay</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => nativeCameraInputRef.current?.click()}
                        className="py-3 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <SwitchCamera className="w-4 h-4" />
                        <span>Máy ảnh thiết bị</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-500 text-center">
                      Chụp trực tiếp món ăn từ quầy bếp thực tế, tự động nén kích thước lưu trữ.
                    </p>
                  </div>
                )}

                {/* Mode: Direct URL */}
                {thumbnailInputMode === 'url' && (
                  <input
                    type="text"
                    value={newCourseThumbnail}
                    onChange={(e) => {
                      setNewCourseThumbnail(e.target.value);
                      setCompressionStats(null);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl font-mono text-[11px]"
                  />
                )}

                {/* Compression Progress */}
                {isCompressing && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                    <span>Đang nén ảnh để tiết kiệm dung lượng Firestore...</span>
                  </div>
                )}

                {/* Compression Result & Image Preview */}
                {Boolean(newCourseThumbnail && newCourseThumbnail.trim()) && (
                  <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-stone-200">
                    <img
                      src={newCourseThumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                      alt="Xem trước ảnh"
                      className="w-16 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="font-bold text-stone-900 line-clamp-1">Xem trước ảnh đại diện</p>
                      {compressionStats ? (
                        <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>
                            Đã nén tối ưu: {formatFileSize(compressionStats.compressedSize)} (Giảm {compressionStats.percentSaved}% dung lượng Firestore)
                          </span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-stone-500">Đang dùng liên kết ảnh</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mô tả ngắn */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Mô tả ngắn khóa học</label>
                <textarea
                  rows={2}
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  placeholder="Làm chủ công thức chuẩn vị..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              {/* Requirement 3: Bạn sẽ nhận được gì từ khóa học */}
              <div className="space-y-2.5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Mục: &quot;Bạn Sẽ Nhận Được Gì Từ Khóa Học?&quot; (4 Thẻ giá trị cốt lõi)</span>
                    </label>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Cài đặt các kỹ năng, bí quyết độc quyền mà học viên sẽ đạt được sau khi học xong.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (newCourseBenefits.length >= 6) {
                        alert('Tối đa 6 thẻ giá trị!');
                        return;
                      }
                      setNewCourseBenefits([
                        ...newCourseBenefits,
                        { icon: 'zap', title: 'Điểm nổi bật mới', description: 'Mô tả chi tiết kỹ năng học viên nhận được.' }
                      ]);
                    }}
                    className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm mục</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {newCourseBenefits.map((b, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded-xl border border-stone-200 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={b.title}
                          onChange={(e) => {
                            const updated = [...newCourseBenefits];
                            updated[idx].title = e.target.value;
                            setNewCourseBenefits(updated);
                          }}
                          placeholder="Tiêu đề (Ví dụ: Khử tanh lươn đồng 100%)"
                          className="flex-1 font-bold text-stone-900 px-2.5 py-1 bg-stone-50 border rounded-lg text-xs"
                        />
                        {newCourseBenefits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewCourseBenefits(newCourseBenefits.filter((_, i) => i !== idx));
                            }}
                            className="p-1 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                            title="Xóa thẻ này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        value={b.description}
                        onChange={(e) => {
                          const updated = [...newCourseBenefits];
                          updated[idx].description = e.target.value;
                          setNewCourseBenefits(updated);
                        }}
                        placeholder="Mô tả giá trị (Ví dụ: Bí quyết dùng tro bếp hoặc muối chanh giúp lươn sạch nhớt, thịt săn ngọt đậm.)"
                        className="w-full text-stone-600 px-2.5 py-1 bg-stone-50 border rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirement 3: Khóa học bao gồm */}
              <div className="space-y-2.5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <div>
                  <label className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Mục: &quot;Khóa Học Bao Gồm:&quot; (Danh sách quyền lợi đi kèm)</span>
                  </label>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Hiển thị ở cột thanh toán bên phải giao diện học viên.
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInclusionText}
                    onChange={(e) => setNewInclusionText(e.target.value)}
                    placeholder="Ví dụ: File PDF công thức gram chuẩn cho 50 - 200 bát..."
                    className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newInclusionText.trim()) return;
                      setNewCourseInclusions([...newCourseInclusions, newInclusionText.trim()]);
                      setNewInclusionText('');
                    }}
                    className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Thêm
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {newCourseInclusions.map((inc, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-[11px] font-medium text-stone-800 shadow-2xs"
                    >
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{inc}</span>
                      <button
                        type="button"
                        onClick={() => setNewCourseInclusions(newCourseInclusions.filter((_, idx) => idx !== i))}
                        className="text-stone-400 hover:text-red-600 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Tài liệu đính kèm & Zalo hỗ trợ (Đã bỏ link Excel theo yêu cầu) */}
              <div className="space-y-2 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <label className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>Đường dẫn tài liệu & Nhóm Zalo hỗ trợ:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1 text-[11px]">Link PDF Công Thức (Google Drive / Firebase)</label>
                    <input
                      type="text"
                      value={newCoursePdfUrl}
                      onChange={(e) => setNewCoursePdfUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-[11px] font-mono focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1 text-[11px]">Link Nhóm Zalo Hỗ Trợ 1-1</label>
                    <input
                      type="text"
                      value={newCourseZaloLink}
                      onChange={(e) => setNewCourseZaloLink(e.target.value)}
                      placeholder="https://zalo.me/g/..."
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-[11px] font-mono focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>
              </div>

              {/* Module: Đánh Giá Từ Học Viên (Hỗ trợ Tải ảnh lên & Chụp ảnh camera cho Chân Dung & Món Ăn) */}
              <div className="space-y-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>Đánh Giá Từ Học Viên ({newCourseReviews.length})</span>
                    </label>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Cài đặt các đánh giá thực tế của học viên, bao gồm ảnh đại diện, ảnh món ăn và nhận xét kinh doanh.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddReviewInline(!showAddReviewInline)}
                    className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showAddReviewInline ? 'Đóng form' : 'Thêm đánh giá mới'}</span>
                  </button>
                </div>

                {/* Form to add a new review */}
                {showAddReviewInline && (
                  <div className="p-3.5 bg-white rounded-xl border border-red-200 space-y-3 shadow-xs">
                    <p className="font-bold text-stone-900 text-xs flex items-center gap-1.5 text-red-800">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nhập thông tin đánh giá mới của học viên:</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Họ tên học viên *</label>
                        <input
                          type="text"
                          required
                          value={reviewAuthor}
                          onChange={(e) => setReviewAuthor(e.target.value)}
                          placeholder="Ví dụ: Minh Hoàng"
                          className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Chức danh / Nơi mở quán</label>
                        <input
                          type="text"
                          value={reviewRole}
                          onChange={(e) => setReviewRole(e.target.value)}
                          placeholder="Chủ quán ăn tại Đà Nẵng"
                          className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Số sao đánh giá</label>
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold"
                        >
                          <option value={5}>5 sao (★★★★★ - Xuất sắc)</option>
                          <option value={4}>4 sao (★★★★ - Rất tốt)</option>
                          <option value={3}>3 sao (★★★ - Bình thường)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Nội dung nhận xét *</label>
                      <textarea
                        rows={2}
                        required
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Nội dung đánh giá, cảm nhận về công thức, sự hỗ trợ của Bếp trưởng..."
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                      />
                    </div>

                    {/* Hidden Inputs for Review Images */}
                    <input
                      type="file"
                      ref={reviewAvatarFileRef}
                      accept="image/*"
                      onChange={handleReviewAvatarFileChange}
                      className="hidden"
                    />
                    <input
                      type="file"
                      ref={reviewAvatarCameraRef}
                      accept="image/*"
                      capture="user"
                      onChange={handleReviewAvatarFileChange}
                      className="hidden"
                    />
                    <input
                      type="file"
                      ref={reviewDishFileRef}
                      accept="image/*"
                      onChange={handleReviewDishFileChange}
                      className="hidden"
                    />
                    <input
                      type="file"
                      ref={reviewDishCameraRef}
                      accept="image/*"
                      capture="environment"
                      onChange={handleReviewDishFileChange}
                      className="hidden"
                    />

                    {/* Image Controls: Upload from device, Capture photo, Pick sample, or URL */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-stone-100">
                      {/* 1. Ảnh chân dung học viên */}
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-bold text-stone-800">
                            Ảnh chân dung học viên
                          </label>
                          {isReviewAvatarCompressing && (
                            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Đang nén...
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5">
                          <img
                            src={reviewAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
                            alt="Chân dung học viên"
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-red-100 shadow-2xs shrink-0"
                          />
                          <div className="flex flex-wrap gap-1.5 flex-1">
                            <button
                              type="button"
                              onClick={() => reviewAvatarFileRef.current?.click()}
                              className="px-2 py-1 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Tải ảnh chân dung từ điện thoại hoặc máy tính"
                            >
                              <Upload className="w-3 h-3 text-red-600" />
                              <span>Tải ảnh lên</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => reviewAvatarCameraRef.current?.click()}
                              className="px-2 py-1 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Chụp ảnh trực tiếp bằng camera thiết bị"
                            >
                              <Camera className="w-3 h-3 text-stone-700" />
                              <span>Chụp ảnh</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const avatars = [
                                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
                                  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
                                  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
                                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
                                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
                                ];
                                setReviewAvatar(avatars[Math.floor(Math.random() * avatars.length)]);
                              }}
                              className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                              title="Đổi ảnh mẫu ngẫu nhiên"
                            >
                              <Shuffle className="w-3 h-3" />
                              <span>Đổi mẫu</span>
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={reviewAvatar}
                          onChange={(e) => setReviewAvatar(e.target.value)}
                          placeholder="Hoặc dán URL ảnh https://..."
                          className="w-full p-1.5 bg-white border border-stone-200 rounded-lg text-[10px] font-mono"
                        />
                      </div>

                      {/* 2. Ảnh món ăn thực tế học viên nấu */}
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-bold text-stone-800">
                            Ảnh món ăn thực tế (Tùy chọn)
                          </label>
                          {isReviewDishCompressing && (
                            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Đang nén...
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5">
                          {reviewDishImage ? (
                            <img
                              src={reviewDishImage}
                              alt="Món ăn thực tế"
                              className="w-14 h-11 rounded-lg object-cover ring-1 ring-stone-200 shadow-2xs shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-11 rounded-lg bg-stone-200 flex items-center justify-center text-[10px] text-stone-500 font-medium shrink-0">
                              Chưa có
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1.5 flex-1">
                            <button
                              type="button"
                              onClick={() => reviewDishFileRef.current?.click()}
                              className="px-2 py-1 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Tải ảnh món ăn từ thiết bị"
                            >
                              <Upload className="w-3 h-3 text-red-600" />
                              <span>Tải ảnh món</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => reviewDishCameraRef.current?.click()}
                              className="px-2 py-1 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Chụp ảnh món ăn ngay bằng camera"
                            >
                              <Camera className="w-3 h-3 text-stone-700" />
                              <span>Chụp món</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const dishes = [
                                  'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=500&q=80',
                                  'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=500&q=80',
                                  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80',
                                  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80'
                                ];
                                setReviewDishImage(dishes[Math.floor(Math.random() * dishes.length)]);
                              }}
                              className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                              title="Chọn ngẫu nhiên ảnh món mẫu"
                            >
                              <Shuffle className="w-3 h-3" />
                              <span>Đổi mẫu</span>
                            </button>

                            {reviewDishImage && (
                              <button
                                type="button"
                                onClick={() => setReviewDishImage('')}
                                className="px-1.5 py-1 text-stone-400 hover:text-red-600 rounded text-[10px] cursor-pointer"
                                title="Bỏ ảnh món"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <input
                          type="text"
                          value={reviewDishImage}
                          onChange={(e) => setReviewDishImage(e.target.value)}
                          placeholder="Hoặc dán URL ảnh món https://..."
                          className="w-full p-1.5 bg-white border border-stone-200 rounded-lg text-[10px] font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => setShowAddReviewInline(false)}
                        className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Đóng
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!reviewAuthor.trim() || !reviewComment.trim()) {
                            alert('Vui lòng nhập họ tên học viên và nội dung nhận xét!');
                            return;
                          }
                          const newRev: Review = {
                            id: 'rev-' + Date.now(),
                            courseId: '',
                            author: reviewAuthor.trim(),
                            role: reviewRole.trim() || 'Học viên Học Món Ngon',
                            rating: reviewRating,
                            comment: reviewComment.trim(),
                            avatar: reviewAvatar.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
                            dishImage: reviewDishImage.trim() || undefined
                          };
                          setNewCourseReviews([...newCourseReviews, newRev]);
                          setReviewAuthor('');
                          setReviewRole('');
                          setReviewComment('');
                          setShowAddReviewInline(false);
                        }}
                        className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Thêm vào danh sách đánh giá
                      </button>
                    </div>
                  </div>
                )}

                {/* Review cards list */}
                <div className="space-y-2">
                  {newCourseReviews.map((rev, idx) => (
                    <div key={rev.id || idx} className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-start justify-between gap-3 shadow-2xs">
                      <div className="flex items-start gap-2.5 min-w-0">
                        {rev.avatar ? (
                          <img
                            src={rev.avatar}
                            alt={rev.author}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-red-100 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-red-700 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                            {rev.author.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-xs">{rev.author}</span>
                            <span className="text-[10px] text-stone-500">({rev.role})</span>
                            <span className="text-amber-500 text-[11px]">{'★'.repeat(rev.rating || 5)}</span>
                          </div>
                          <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 italic">
                            &ldquo;{rev.comment}&rdquo;
                          </p>
                          {rev.dishImage && (
                            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-stone-500">
                              <ImageIcon className="w-3 h-3 text-emerald-600" />
                              <span>Có kèm ảnh món ăn thực tế</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setNewCourseReviews(newCourseReviews.filter((_, i) => i !== idx))}
                        className="p-1 text-stone-400 hover:text-red-700 rounded cursor-pointer shrink-0"
                        title="Xóa đánh giá này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 bg-stone-100 rounded-xl font-bold text-stone-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  Tạo Khóa Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Thêm Bài Học Mới (YÊU CẦU 2: Chương + / Xóa & Nút Tắt/Bật Link Tài Liệu) */}
      {showAddLessonModal && selectedCourseForLessons && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
            {/* Modal Header (Fixed at top) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 shrink-0 bg-white">
              <div>
                <h3 className="text-lg font-black text-stone-900">Thêm Bài Học Mới</h3>
                <p className="text-xs text-stone-500">Cho khóa: {selectedCourseForLessons.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddLessonModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form wrapping scrollable content and sticky footer */}
            <form onSubmit={handleSaveLesson} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tiêu đề bài học</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Bài 3: Kỹ thuật căn chỉnh lửa nước dùng"
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:border-red-600"
                  />
                </div>

                {/* Requirement 2: Ô chương học thêm dấu + để thêm chương mới và các chương cũ được phép xóa */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-stone-700">Chương học</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowAddChapterInModal(!showAddChapterInModal)}
                        className="px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-black rounded flex items-center gap-0.5 cursor-pointer"
                        title="Thêm chương mới"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm chương</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowManageChaptersInModal(!showManageChaptersInModal)}
                        className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold rounded cursor-pointer"
                        title="Quản lý & xóa chương cũ"
                      >
                        Xóa chương cũ ({selectedCourseForLessons.chapters.length})
                      </button>
                    </div>
                  </div>

                  {/* Inline Add Chapter Form */}
                  {showAddChapterInModal && (
                    <div className="p-2.5 bg-red-50/60 rounded-xl border border-red-200 space-y-2">
                      <p className="text-[10px] font-black text-red-800 uppercase">Tạo chương học mới:</p>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Ví dụ: Chương 2: Pha chế nước chấm gia truyền"
                          value={newChapterTitleInModal}
                          onChange={(e) => setNewChapterTitleInModal(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddChapterInModal}
                          className="px-3 py-1.5 bg-red-700 text-white font-bold rounded-lg cursor-pointer text-xs"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List and Delete Existing Chapters (Requirement 2) */}
                  {showManageChaptersInModal && (
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5 max-h-36 overflow-y-auto">
                      <p className="text-[10px] font-bold text-stone-500 uppercase">
                        Danh sách chương (Click biểu tượng thùng rác để xóa chương cũ):
                      </p>
                      <div className="space-y-1">
                        {selectedCourseForLessons.chapters.map(chap => (
                          <div
                            key={chap.id}
                            className="flex items-center justify-between p-2 bg-white rounded-lg border border-stone-200 text-xs"
                          >
                            <span className="font-semibold text-stone-800 line-clamp-1">{chap.title} ({chap.lessons.length} bài)</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteChapterFromModal(chap.id)}
                              className="p-1 text-stone-400 hover:text-red-700 rounded cursor-pointer"
                              title={`Xóa chương "${chap.title}"`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <select
                    value={newLessonChapterId || (selectedCourseForLessons.chapters[0]?.id || '')}
                    onChange={(e) => setNewLessonChapterId(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:border-red-600"
                  >
                    {selectedCourseForLessons.chapters.map(chap => (
                      <option key={chap.id} value={chap.id}>
                        {chap.title} {chap.isFree === false ? '(Chương mất phí)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Thời lượng */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Thời lượng bài học (phút)</label>
                  <input
                    type="number"
                    value={newLessonDuration}
                    onChange={(e) => setNewLessonDuration(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                  />
                </div>

                {/* Free Trial Toggle */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newLessonIsFree}
                      onChange={(e) => setNewLessonIsFree(e.target.checked)}
                      className="rounded text-red-700 focus:ring-red-600 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-stone-900 text-xs">Đặt làm bài học miễn phí (Học thử 0đ)</span>
                      <p className="text-[11px] text-stone-500">
                        Học viên chưa mua vẫn có thể xem video bài học này (Lưu ý: Nếu chương mất phí thì bài học vẫn bị khóa).
                      </p>
                    </div>
                  </label>
                </div>

                {/* Video URL */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-stone-700">
                      Video YouTube URL (Unlisted / Không công khai hoặc Embed)
                    </label>
                    {Boolean(newLessonVideoUrl && newLessonVideoUrl.trim()) && (
                      <button
                        type="button"
                        onClick={() => setVideoTestUrl(newLessonVideoUrl)}
                        className="text-red-700 hover:text-red-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded"
                      >
                        <Play className="w-3 h-3" />
                        <span>Kiểm tra phát video</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={newLessonVideoUrl}
                    onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                    placeholder="https://youtu.be/... hoặc https://www.youtube.com/watch?v=..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    💡 Hỗ trợ link YouTube không công khai (Unlisted), link chia sẻ rút gọn (youtu.be) và link nhúng.
                  </p>
                </div>

                {/* Requirement 2: Link Tài Liệu + Nút Tắt/Bật Cơ Chế Bán Công Thức */}
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2.5">
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Link Tài liệu (Google Drive hoặc PDF Firebase)
                    </label>
                    <input
                      type="text"
                      value={newLessonDocUrl}
                      onChange={(e) => setNewLessonDocUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/..."
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl font-mono text-[11px]"
                    />
                  </div>

                  {/* Toggle switch for requirePaymentForDoc (Requirement 2) */}
                  <div className="p-3 bg-white rounded-xl border border-amber-300/80 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-stone-900 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-purple-700" />
                        Cơ chế hiển thị tài liệu: Bán công thức riêng
                      </span>
                      <button
                        type="button"
                        onClick={() => setNewLessonRequirePaymentForDoc(!newLessonRequirePaymentForDoc)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                          newLessonRequirePaymentForDoc ? 'bg-purple-700' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            newLessonRequirePaymentForDoc ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-[11px] leading-relaxed text-stone-600">
                      {newLessonRequirePaymentForDoc ? (
                        <span className="text-purple-900 font-bold">
                          🔒 ĐANG BẬT: Video bài giảng có thể học thử miễn phí, nhưng Link Tài liệu / Công thức gram chuẩn sẽ YÊU CẦU THANH TOÁN (Trường hợp bán công thức độc quyền).
                        </span>
                      ) : (
                        <span className="text-stone-500">
                          🔓 ĐANG TẮT (Mặc định): Tài liệu luôn hiển thị cùng video khi học viên vào xem bài học.
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Recipe text note (Yêu cầu 3: Tự động tạo công thức chi tiết & ghi chú) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-stone-700">Công thức chi tiết & Lưu ý bài học</label>
                    <button
                      type="button"
                      onClick={() => {
                        const template = generateLessonRecipeTemplate(newLessonTitle.trim() || 'Bài học thực hành');
                        setNewLessonRecipeText(template);
                      }}
                      className="text-amber-800 hover:text-amber-900 text-[10px] font-bold flex items-center gap-1 cursor-pointer bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded border border-amber-300"
                      title="Tự động điền mẫu công thức chuẩn gram, kỹ thuật lửa và lưu ý cốt lõi từ Bếp trưởng"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>⚡ Tự động tạo công thức chuẩn Chef</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={newLessonRecipeText}
                    onChange={(e) => setNewLessonRecipeText(e.target.value)}
                    placeholder="Ghi chú về định lượng gram, lưu ý khi thao tác... (Bấm nút trên để tự động điền mẫu chuẩn Chef)"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono leading-relaxed"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Hệ thống sẽ tự động hoàn thiện công thức chuẩn theo tên bài học nếu để trống khi lưu.
                  </p>
                </div>
              </div>

              {/* Sticky Modal Footer: Always visible buttons */}
              <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-4 py-2.5 bg-stone-200/80 hover:bg-stone-300 text-stone-700 font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl cursor-pointer shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Lưu Bài Học</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CAMERA CAPTURE MODAL (Requirement 1) */}
      {showCameraModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 rounded-3xl max-w-lg w-full overflow-hidden border border-stone-800 shadow-2xl space-y-4 p-5">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-red-500" />
                <h3 className="font-black text-base">
                  {cameraTarget === 'instructor' ? 'Chụp Ảnh Chân Dung Bếp Trưởng' : 'Chụp Ảnh Món Ăn Cho Khóa Học'}
                </h3>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Preview */}
            <div className="relative aspect-4/3 bg-black rounded-2xl overflow-hidden ring-2 ring-stone-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs flex items-center gap-1.5 text-xs font-bold"
                  title="Đổi camera trước/sau"
                >
                  <SwitchCamera className="w-4 h-4" />
                  <span>Đổi camera</span>
                </button>
              </div>
            </div>

            {/* Camera Actions */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={stopCamera}
                className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={capturePhotoFromCamera}
                className="px-7 py-3 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-black text-sm shadow-xl flex items-center gap-2 cursor-pointer transform hover:scale-105 transition-all"
              >
                <Camera className="w-5 h-5" />
                <span>Chụp & Tự Động Nén Ảnh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP CONFIRMATION: DELETE CHEF & ASSOCIATED COURSES */}
      {chefToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-stone-900 leading-snug">
                    Xác nhận xóa Bếp trưởng & Khóa học
                  </h3>
                  <button
                    type="button"
                    onClick={() => setChefToDelete(null)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-stone-500">
                  Thao tác này sẽ xóa vĩnh viễn và không thể khôi phục sau khi xác nhận.
                </p>
              </div>
            </div>

            {/* Chef Info Card */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
              <img
                src={chefToDelete.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80'}
                alt={chefToDelete.name}
                className="w-14 h-14 rounded-xl object-cover ring-2 ring-red-100 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-black text-sm text-stone-900 truncate">{chefToDelete.name}</h4>
                <p className="text-xs text-red-700 font-semibold truncate">{chefToDelete.title}</p>
                <p className="text-[11px] text-stone-400 mt-0.5">SĐT / Zalo: {chefToDelete.phone || '0988409798'}</p>
              </div>
            </div>

            {/* Courses to be deleted */}
            <div className="space-y-2">
              {(() => {
                const chefCourses = courses.filter(c => c.instructorId === chefToDelete.id);
                return (
                  <>
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                      <span>Danh sách khóa học sẽ bị xóa kèm:</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[11px] font-black">
                        {chefCourses.length} khóa học
                      </span>
                    </div>

                    {chefCourses.length > 0 ? (
                      <div className="border border-red-200 bg-red-50/50 rounded-2xl p-3 space-y-2 max-h-48 overflow-y-auto">
                        {chefCourses.map(course => (
                          <div 
                            key={course.id}
                            className="bg-white p-2.5 rounded-xl border border-red-100 flex items-center gap-3 shadow-2xs"
                          >
                            <img
                              src={course.thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                              alt={course.title}
                              className="w-12 h-9 rounded-lg object-cover ring-1 ring-stone-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-stone-900 truncate">{course.title}</p>
                              <p className="text-[10px] text-stone-500">
                                {course.category} • {course.chapters.reduce((acc, c) => acc + c.lessons.length, 0)} bài học
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-500 italic p-3 bg-stone-50 rounded-xl border border-stone-200">
                        Bếp trưởng này hiện chưa có khóa học nào được tạo.
                      </p>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Warning Callout */}
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-black flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                Cảnh báo hệ thống:
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Khi bấm <strong>&quot;Đồng ý xóa toàn bộ&quot;</strong>, hệ thống sẽ xóa sạch hồ sơ Bếp trưởng và tất cả các khóa học cùng video bài học trực thuộc khỏi danh sách khóa học và website.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setChefToDelete(null)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteChef}
                className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Đồng ý xóa toàn bộ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP CONFIRMATION: DELETE SINGLE COURSE */}
      {courseToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-stone-900 leading-snug">
                    Xác nhận xóa Khóa học
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCourseToDelete(null)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-stone-500">
                  Thao tác này sẽ xóa khóa học và toàn bộ bài giảng video liên quan.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
              <img
                src={courseToDelete.thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                alt={courseToDelete.title}
                className="w-14 h-11 rounded-lg object-cover ring-1 ring-stone-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-stone-900 truncate">{courseToDelete.title}</p>
                <p className="text-[11px] text-stone-500">Giảng viên: {courseToDelete.instructorName}</p>
                <p className="text-[10px] text-red-700 font-semibold">{courseToDelete.category}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCourse}
                className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa khóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. MODAL CHI TIẾT HỌC VIÊN TOÀN DIỆN (selectedStudentForDetails) */}
      {selectedStudentForDetails && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-3xl w-full space-y-6 shadow-2xl border border-stone-200 my-8 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-200 shrink-0">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudentForDetails.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                  alt={selectedStudentForDetails.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-red-100 shadow-xs"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-stone-900">{selectedStudentForDetails.name}</h3>
                    {selectedStudentForDetails.role === 'admin' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-stone-900 text-white uppercase">Quản Trị Viên</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800">Học Viên</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <span>{selectedStudentForDetails.email}</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{selectedStudentForDetails.phone}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>Đăng ký: {selectedStudentForDetails.registeredAt || 'Mới đây'}</span>
                    </span>
                  </div>
                  {selectedStudentForDetails.goal && (
                    <p className="text-xs text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-medium inline-block mt-1">
                      🎯 Mục tiêu: {selectedStudentForDetails.goal}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentForDetails(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto pr-1 space-y-6 flex-1">
              {/* Overview Metrics Cards */}
              {(() => {
                const sEnrs = (isInstructor ? scopedEnrollments : enrollments).filter(e => e.studentId === selectedStudentForDetails.id);
                const sPaid = sEnrs.filter(e => e.type === 'paid');
                const sTrial = sEnrs.filter(e => e.type === 'trial');
                const sTotalSpent = sPaid.reduce((sum, e) => sum + (e.pricePaid || 0), 0);

                let completedL = 0;
                let availableL = 0;
                sEnrs.forEach(enr => {
                  const crs = (isInstructor ? scopedCourses : courses).find(c => c.id === enr.courseId);
                  const count = crs ? crs.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0) : 18;
                  availableL += count;
                  completedL += enr.completedLessonIds.length;
                });
                const sProgress = availableL > 0 ? Math.min(100, Math.round((completedL / availableL) * 100)) : 0;
                const discounts = selectedStudentForDetails.discounts || [];

                return (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-0.5">
                        <p className="text-[11px] text-stone-500 font-semibold">Khóa đã đăng ký</p>
                        <p className="text-xl font-black text-stone-900">{sEnrs.length} khóa</p>
                        <p className="text-[10px] text-stone-500 font-medium">{sPaid.length} đã mua • {sTrial.length} học thử</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-0.5">
                        <p className="text-[11px] text-emerald-800 font-semibold">Tổng chi tiêu</p>
                        <p className="text-xl font-black text-emerald-900">{formatPrice(sTotalSpent)}</p>
                        <p className="text-[10px] text-emerald-700 font-medium">{sPaid.length > 0 ? 'Đã thanh toán' : 'Chưa phát sinh mua'}</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 space-y-0.5">
                        <p className="text-[11px] text-red-800 font-semibold">Tiến độ trung bình</p>
                        <p className="text-xl font-black text-red-900">{sProgress}%</p>
                        <p className="text-[10px] text-red-700 font-medium">{completedL}/{availableL} bài hoàn thành</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-0.5">
                        <p className="text-[11px] text-amber-800 font-semibold">Ưu đãi & Voucher</p>
                        <p className="text-xl font-black text-amber-900">{discounts.length} ưu đãi</p>
                        <p className="text-[10px] text-amber-700 font-medium">{discounts.filter(d => d.status === 'active').length} đang hiệu lực</p>
                      </div>
                    </div>

                    {/* Section 1: Registered Courses */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-red-700" />
                          <span>Danh Sách Khóa Học Đang Tham Gia ({sEnrs.length})</span>
                        </h4>
                      </div>

                      {sEnrs.length === 0 ? (
                        <div className="p-6 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-400">
                          <p className="text-xs font-bold">Học viên chưa đăng ký khóa học nào.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setStudentForDiscount(selectedStudentForDetails);
                              setDiscountTab('free_course');
                            }}
                            className="mt-2 text-xs font-bold text-red-700 hover:underline cursor-pointer"
                          >
                            + Tặng khóa học 0đ ngay bây giờ
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {sEnrs.map((enr) => {
                            const course = courses.find(c => c.id === enr.courseId);
                            const totalL = course ? course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0) : 18;
                            const compL = enr.completedLessonIds.length;
                            const pct = enr.status === 'completed' ? 100 : Math.round((compL / (totalL || 1)) * 100);

                            return (
                              <div
                                key={enr.id}
                                className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-100/70 transition-colors"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={enr.thumbnail || course?.thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                                    alt={enr.courseTitle}
                                    className="w-14 h-11 rounded-xl object-cover ring-1 ring-stone-200 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h5 className="text-xs font-extrabold text-stone-900 truncate">
                                        {enr.courseTitle}
                                      </h5>
                                      {enr.type === 'paid' ? (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black whitespace-nowrap">
                                          Đã Mua ({formatPrice(enr.pricePaid)})
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold whitespace-nowrap">
                                          Học thử (0đ)
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-stone-500 mt-0.5">
                                      Giảng viên: <span className="font-semibold text-stone-700">{enr.instructorName}</span> • Tham gia: {enr.enrolledAt}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5 w-48">
                                      <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-700 rounded-full" style={{ width: `${pct}%` }} />
                                      </div>
                                      <span className="text-[10px] font-bold text-stone-700">{compL}/{totalL} bài ({pct}%)</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 justify-end">
                                  {course && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedStudentForDetails(null);
                                          onNavigate('classroom', { courseId: course.id });
                                        }}
                                        className="px-2.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                        title="Mở giao diện phòng học của khóa này"
                                      >
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                        <span>Vào học</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedStudentForDetails(null);
                                          onNavigate('course', { courseId: course.id });
                                        }}
                                        className="px-2.5 py-1.5 bg-white hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                        title="Xem trang giới thiệu khóa học"
                                      >
                                        Chi tiết
                                      </button>
                                    </>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setEnrollmentToDelete({
                                      studentId: selectedStudentForDetails.id,
                                      enrollmentId: enr.id,
                                      courseTitle: enr.courseTitle
                                    })}
                                    className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Hủy khóa học này của học viên"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Section 2: Discounts & Vouchers */}
                    <div className="space-y-3 pt-2 border-t border-stone-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                          <Gift className="w-4 h-4 text-amber-600" />
                          <span>Ưu Đãi, Voucher & Quà Tặng Đã Cấp ({discounts.length})</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setStudentForDiscount(selectedStudentForDetails);
                            setDiscountCode(`VIP${Math.floor(1000 + Math.random() * 9000)}`);
                          }}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm Ưu Đãi Mới</span>
                        </button>
                      </div>

                      {discounts.length === 0 ? (
                        <div className="p-5 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-400">
                          <p className="text-xs">Học viên hiện chưa có mã ưu đãi hoặc voucher riêng nào.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {discounts.map(disc => (
                            <div
                              key={disc.id}
                              className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-1.5 relative group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-black text-xs px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md border border-amber-300 flex items-center gap-1">
                                      <Tag className="w-3 h-3" />
                                      {disc.code}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(disc.code)}
                                      className="p-1 text-stone-400 hover:text-stone-700 rounded cursor-pointer"
                                      title="Sao chép mã"
                                    >
                                      {copiedCode === disc.code ? (
                                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                  <p className="text-xs font-bold text-stone-900 mt-1">{disc.title}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDiscount(selectedStudentForDetails.id, disc.id)}
                                  className="p-1 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                                  title="Xóa / Thu hồi ưu đãi này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-[11px] text-stone-600 space-y-0.5">
                                <p>
                                  Mức ưu đãi: <span className="font-bold text-red-700">
                                    {disc.type === 'percent' ? `-${disc.value}%` : disc.type === 'fixed' ? `-${new Intl.NumberFormat('vi-VN').format(disc.value)}đ` : 'Miễn phí trọn đời (0đ)'}
                                  </span>
                                </p>
                                <p className="truncate">
                                  Phạm vi: <span className="font-medium text-stone-700">{disc.courseTitle || 'Toàn bộ khóa học'}</span>
                                </p>
                                <p className="text-[10px] text-stone-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Hạn dùng: {disc.expiresAt}</span>
                                </p>
                                {disc.note && (
                                  <p className="text-[10px] text-stone-500 italic">Ghi chú: {disc.note}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-200 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setStudentToDelete(selectedStudentForDetails);
                }}
                className="px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa Tài Khoản Học Viên</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStudentForDiscount(selectedStudentForDetails);
                    setDiscountCode(`VIP${Math.floor(1000 + Math.random() * 9000)}`);
                  }}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Gift className="w-4 h-4 text-amber-700" />
                  <span>Tặng Thêm Ưu Đãi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudentForDetails(null)}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL THÊM ƯU ĐÃI / TẶNG KHÓA HỌC CHO HỌC VIÊN (studentForDiscount) */}
      {studentForDiscount && (
        <div className="fixed inset-0 z-65 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl border border-stone-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-stone-200">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-black text-stone-900">Thêm Ưu Đãi Học Viên</h3>
                </div>
                <p className="text-xs text-stone-500">
                  Cấp cho: <span className="font-bold text-stone-900">{studentForDiscount.name}</span> ({studentForDiscount.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStudentForDiscount(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setDiscountTab('voucher')}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  discountTab === 'voucher'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Mã Giảm Giá / Voucher</span>
              </button>
              <button
                type="button"
                onClick={() => setDiscountTab('free_course')}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  discountTab === 'free_course'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Tặng Khóa Học (0đ)</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddDiscountSubmit} className="space-y-4 text-xs">
              {discountTab === 'voucher' ? (
                <>
                  {/* Discount Type */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-700">Hình thức giảm:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDiscountType('percent');
                          setDiscountValue(20);
                        }}
                        className={`p-2.5 rounded-xl border text-left font-bold flex items-center justify-between cursor-pointer ${
                          discountType === 'percent'
                            ? 'bg-amber-50 border-amber-400 text-amber-900'
                            : 'bg-stone-50 border-stone-200 text-stone-700'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Percent className="w-3.5 h-3.5" />
                          Giảm theo %
                        </span>
                        {discountType === 'percent' && <Check className="w-3.5 h-3.5 text-amber-700" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDiscountType('fixed');
                          setDiscountValue(200000);
                        }}
                        className={`p-2.5 rounded-xl border text-left font-bold flex items-center justify-between cursor-pointer ${
                          discountType === 'fixed'
                            ? 'bg-amber-50 border-amber-400 text-amber-900'
                            : 'bg-stone-50 border-stone-200 text-stone-700'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" />
                          Giảm tiền mặt (VNĐ)
                        </span>
                        {discountType === 'fixed' && <Check className="w-3.5 h-3.5 text-amber-700" />}
                      </button>
                    </div>
                  </div>

                  {/* Discount Value */}
                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">
                      {discountType === 'percent' ? 'Mức giảm (%)' : 'Số tiền giảm (VNĐ)'}:
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={discountType === 'percent' ? 100 : 10000000}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  {/* Scope */}
                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">Khóa học áp dụng:</label>
                    <select
                      value={discountCourseId}
                      onChange={(e) => setDiscountCourseId(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-900 focus:outline-none focus:border-red-600"
                    >
                      <option value="all">Áp dụng cho tất cả các khóa học</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Code & Random button */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-stone-700">Mã Voucher:</label>
                      <button
                        type="button"
                        onClick={() => setDiscountCode(`VIP${Math.floor(1000 + Math.random() * 9000)}`)}
                        className="text-[11px] text-amber-700 font-bold hover:underline cursor-pointer"
                      >
                        Tạo mã ngẫu nhiên
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      placeholder="VD: VIP2026, BANQUAN50"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold text-stone-900 focus:outline-none focus:border-red-600 uppercase"
                    />
                  </div>

                  {/* Title & Expiry */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-700">Tên ưu đãi / Tiêu đề:</label>
                      <input
                        type="text"
                        value={discountTitle}
                        onChange={(e) => setDiscountTitle(e.target.value)}
                        placeholder="VD: Ưu đãi tri ân học viên mới"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-stone-700">Thời hạn áp dụng:</label>
                      <select
                        value={discountExpiryDays}
                        onChange={(e) => setDiscountExpiryDays(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-900 focus:outline-none focus:border-red-600"
                      >
                        <option value={7}>7 ngày</option>
                        <option value={15}>15 ngày</option>
                        <option value={30}>30 ngày (1 tháng)</option>
                        <option value={90}>90 ngày (3 tháng)</option>
                        <option value={365}>365 ngày (1 năm)</option>
                      </select>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">Ghi chú (Tùy chọn):</label>
                    <input
                      type="text"
                      value={discountNote}
                      onChange={(e) => setDiscountNote(e.target.value)}
                      placeholder="VD: Khách hàng đăng ký qua hotline tư vấn"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Free Course Mode */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1 text-emerald-900">
                    <p className="font-bold flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Kích hoạt khóa học 0đ trọn đời</span>
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Học viên sẽ được cấp quyền sở hữu vĩnh viễn khóa học này ngay lập tức với học phí 0đ, mở khóa trọn bộ video và tài liệu PDF/Excel.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">Chọn khóa học muốn tặng:</label>
                    <select
                      value={giftCourseId}
                      onChange={(e) => setGiftCourseId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-red-600"
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({formatPrice(c.discountPrice || c.originalPrice)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">Lý do tặng thưởng / Ghi chú:</label>
                    <input
                      type="text"
                      value={discountNote}
                      onChange={(e) => setDiscountNote(e.target.value)}
                      placeholder="VD: Quà tặng thành viên tích cực, học bổng mở quán..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600"
                    />
                  </div>
                </>
              )}

              {/* Submit / Cancel */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setStudentForDiscount(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Gift className="w-4 h-4" />
                  <span>{discountTab === 'voucher' ? 'Cấp Mã Ưu Đãi' : 'Xác Nhận Tặng Khóa Học'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL XÁC NHẬN XÓA TÀI KHOẢN HỌC VIÊN (studentToDelete) */}
      {studentToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-red-200 animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-stone-900 text-base">Xác Nhận Xóa Tài Khoản Học Viên</h4>
                <p className="text-xs text-stone-500">Thao tác này sẽ xóa toàn bộ dữ liệu người dùng</p>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
              <img
                src={studentToDelete.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                alt={studentToDelete.name}
                className="w-12 h-12 rounded-xl object-cover ring-1 ring-stone-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-stone-900 text-sm truncate">{studentToDelete.name}</p>
                <p className="text-xs text-stone-500 truncate">{studentToDelete.email}</p>
                <p className="text-[11px] text-stone-400 font-mono">{studentToDelete.phone}</p>
              </div>
            </div>

            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>Cảnh báo xóa vĩnh viễn:</span>
              </p>
              <p className="text-[11px] text-red-700">
                Toàn bộ các khóa học đã đăng ký, tiến độ học tập và ưu đãi của học viên này sẽ bị xóa khỏi bộ nhớ máy và đồng bộ xóa khỏi Firebase Firestore.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStudent}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác Nhận Xóa Học Viên</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL XÁC NHẬN HỦY KHÓA HỌC CỦA HỌC VIÊN (enrollmentToDelete) */}
      {enrollmentToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-stone-900 text-sm">Hủy Đăng Ký Khóa Học</h4>
                <p className="text-xs text-stone-500">Thu hồi quyền truy cập khóa học</p>
              </div>
            </div>

            <p className="text-xs text-stone-600">
              Bạn có chắc chắn muốn hủy khóa học <span className="font-bold text-stone-900">"{enrollmentToDelete.courseTitle}"</span> của học viên này không?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEnrollmentToDelete(null)}
                className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteEnrollment}
                className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Xác Nhận Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO TESTER MODAL (Kiểm tra video YouTube / Unlisted) */}
      {videoTestUrl && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-stone-900 rounded-3xl p-5 sm:p-6 max-w-xl w-full space-y-3.5 shadow-2xl border border-stone-800 text-stone-100">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-red-500" />
                <h4 className="font-black text-sm">Kiểm Tra Phát Video YouTube (Unlisted / Không Công Khai)</h4>
              </div>
              <button
                type="button"
                onClick={() => setVideoTestUrl(null)}
                className="p-1 text-stone-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-16/9 bg-black rounded-2xl overflow-hidden border border-stone-800 shadow-inner">
              <iframe
                src={toYouTubeEmbedUrl(videoTestUrl, { autoplay: true })}
                title="Kiểm tra phát video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1 text-stone-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Link đã tự động chuẩn hóa dạng nhúng chuẩn</span>
              </span>
              <button
                type="button"
                onClick={() => setVideoTestUrl(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Đóng kiểm tra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
