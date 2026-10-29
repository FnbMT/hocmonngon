export interface Instructor {
  id: string;
  name: string;
  title: string;
  avatar: string;
  specialty: string;
  bio: string;
  courseCount: number;
  studentCount: number;
  rating: number;
  phone?: string;
  zalo?: string;
  badge?: string;
  username?: string;
  password?: string;
  email?: string;
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  durationMinutes: number;
  isFreeTrial: boolean;
  requirePaymentForDoc?: boolean; // If true, document is locked for non-paid users even if video is free
  videoUrl: string; // YouTube embed/unlisted URL or standard video ID
  recipeDocumentUrl?: string; // Google Drive or Firebase PDF link
  recipeText?: string;
  order: number;
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  order: number;
  isFree?: boolean; // If false, the whole chapter is paid and all lessons inside are locked
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  category: string;
  tag?: 'Bán chạy' | 'Khóa mới' | 'Có học thử' | 'Hot Trend' | 'Được yêu thích' | 'Masterclass' | string;
  badge?: string; // Huy hiệu nổi bật hiển thị trên ảnh bìa trang chủ (vd: 'Bán chạy nhất', 'Chuyên sâu mở quán', 'Công thức độc quyền', 'none')
  badgeColor?: 'red' | 'dark' | 'amber' | 'emerald' | 'purple' | 'blue';
  shortDescription: string;
  description: string;
  thumbnail: string;
  previewVideoUrl: string;
  originalPrice: number;
  discountPrice: number;
  level: string;
  durationHours: number;
  rating: number;
  reviewCount: number;
  studentCount: number;
  benefits: {
    icon: string;
    title: string;
    description: string;
  }[];
  chapters: Chapter[];
  inclusions: string[];
  pdfRecipeUrl?: string;
  excelCostSheetUrl?: string;
  zaloGroupLink?: string;
  reviews?: Review[];
  transferSyntax?: string; // Mã cú pháp riêng cho khóa học (vd: 'PHOBO', 'SUPLUON', 'COMTAM') để phân biệt và tự động kích hoạt qua SePay webhook
}

export interface StudentDiscount {
  id: string;
  code: string;
  title: string;
  type: 'percent' | 'fixed' | 'free_course';
  value: number; // e.g. 20 (percent) or 200000 (VND)
  courseId?: string; // specific courseId or undefined for all
  courseTitle?: string;
  expiresAt: string;
  status: 'active' | 'used' | 'expired';
  createdAt: string;
  note?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'student' | 'admin' | 'instructor';
  instructorId?: string;
  registeredAt: string;
  goal?: string;
  discounts?: StudentDiscount[];
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  thumbnail: string;
  enrolledAt: string;
  type: 'trial' | 'paid';
  pricePaid: number;
  completedLessonIds: string[];
  lastLessonId?: string;
  lastActiveAt: string;
  trialExpiresAt?: string;
  status: 'active' | 'completed' | 'expired';
}

export interface Review {
  id: string;
  courseId: string;
  author: string;
  role: string;
  rating: number;
  comment: string;
  avatar?: string;
  dishImage?: string;
}

export interface ChefQuestion {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  chefName: string;
  question: string;
  createdAt: string;
  status: 'pending' | 'answered';
  reply?: string;
}

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  isConnected: boolean;
}

export interface BankOption {
  bin: string;
  shortName: string;
  name: string;
  code: string;
}

export interface PaymentBankConfig {
  bankName: string;
  bankShortName: string;
  bankBin: string;
  accountNumber: string;
  accountHolderName: string;
  branch?: string;
  qrTemplate: 'compact' | 'compact2' | 'qr_only' | 'print';
}

export interface SePayConfig {
  isEnabled: boolean;
  apiKey: string;
  webhookToken: string;
  globalPrefix: string; // ví dụ: 'HMN'
  autoEnrollEnabled: boolean;
  webhookUrl?: string;
}

export interface SePayTransaction {
  id: string;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  code?: string;
  content: string;
  transferType: 'in' | 'out';
  transferAmount: number;
  referenceCode?: string;
  courseId?: string;
  courseTitle?: string;
  studentPhone?: string;
  studentName?: string;
  status: 'success' | 'pending' | 'unmatched' | 'invalid_amount';
  createdAt: string;
  rawPayload?: string;
}
export interface FaqItem {
  question: string;
  answer: string;
}

export interface FooterLinkItem {
  id?: string;
  label: string;
  url?: string;
  isHighlight?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLinkItem[];
}

export interface HomepageConfig {
  header: {
    brandName: string;
    brandSubtitle: string;
    hotline: string;
  };
  hero: {
    topBadge: string;
    title: string;
    subtitle: string;
    ctaExploreText: string;
    ctaTrialText: string;
    stats: {
      studentsCount: string;
      studentsLabel: string;
      ratingValue: string;
      ratingLabel: string;
      chefsCount: string;
      chefsLabel: string;
    };
  };
  trialSection: {
    badge: string;
    title: string;
    subtitle: string;
    buttonText: string;
    fieldOptions: string[];
  };
  faq: {
    tag: string;
    title: string;
    subtitle: string;
    items: FaqItem[];
  };
  footer: {
    brandName: string;
    brandBio: string;
    hotline: string;
    email: string;
    address: string;
    facebookUrl: string;
    youtubeUrl: string;
    zaloUrl: string;
    copyrightText: string;
    securityBadge: string;
    exploreColumn: FooterColumn;
    aboutColumn: FooterColumn;
    contactTitle?: string;
    bottomLinks?: FooterLinkItem[];
  };
}
