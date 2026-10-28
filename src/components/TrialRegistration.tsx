import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Users, 
  Play, 
  ShieldCheck, 
  ArrowRight,
  ChevronDown,
  AlertTriangle,
  LogIn,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Course, Instructor, Student } from '../types';
import { FAQ_ITEMS } from '../data/mockData';
import { StorageService } from '../services/storage';

interface TrialRegistrationProps {
  instructors: Instructor[];
  courses: Course[];
  initialCourseId?: string;
  currentUser?: Student | null;
  onRegisterTrialSuccess: (data: {
    name: string;
    phone: string;
    email: string;
    courseId: string;
    goal: string;
  }) => void;
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
  onOpenAuth?: () => void;
}

export const TrialRegistration: React.FC<TrialRegistrationProps> = ({
  instructors,
  courses,
  initialCourseId,
  currentUser,
  onRegisterTrialSuccess,
  onNavigate,
  onOpenAuth
}) => {
  // Default to initial course or top masterclass
  const defaultCourse = courses.find(c => c.id === initialCourseId) || courses[0];

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState('Nấu ăn cho gia đình ngon hơn mỗi ngày');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Duplicate detection state
  const [duplicateStudent, setDuplicateStudent] = useState<Student | null>(null);
  const [duplicateReason, setDuplicateReason] = useState<string | null>(null);

  // Check phone and email duplicates against registered students
  useEffect(() => {
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();
    let matched: Student | undefined;
    let reason = '';

    if (cleanPhone && cleanPhone.length >= 8) {
      matched = StorageService.findStudentByPhone(cleanPhone);
      if (matched) {
        reason = `Số điện thoại "${cleanPhone}" đã được đăng ký bởi học viên "${matched.name}".`;
      }
    }

    if (!matched && cleanEmail && cleanEmail.includes('@') && cleanEmail.length >= 5) {
      matched = StorageService.findStudentByEmail(cleanEmail);
      if (matched) {
        reason = `Email "${cleanEmail}" đã được đăng ký bởi học viên "${matched.name}".`;
      }
    }

    setDuplicateStudent(matched || null);
    setDuplicateReason(reason || null);
  }, [phone, email]);

  const handleDuplicateLogin = () => {
    if (duplicateStudent) {
      StorageService.setCurrentUser(duplicateStudent);
      onNavigate('catalog');
    } else if (onOpenAuth) {
      onOpenAuth();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Vui lòng nhập họ và tên của bạn!');
      return;
    }

    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    // Requirement: Student can fill in EITHER Phone OR Email (1 of the 2 is required)
    if (!trimmedPhone && !trimmedEmail) {
      alert('Vui lòng điền ít nhất 1 trong 2: Số điện thoại HOẶC Email để nhận tài khoản học thử!');
      return;
    }

    if (!agreeTerms) {
      alert('Vui lòng đồng ý với điều khoản nhận thông tin tài khoản!');
      return;
    }

    // If duplicate student detected, log them in automatically
    if (duplicateStudent) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        StorageService.setCurrentUser(duplicateStudent);
        onRegisterTrialSuccess({
          name: duplicateStudent.name,
          phone: duplicateStudent.phone || trimmedPhone,
          email: duplicateStudent.email || trimmedEmail,
          courseId: defaultCourse.id,
          goal
        });
      }, 600);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
      setIsSubmitting(false);

      onRegisterTrialSuccess({
        name: name.trim(),
        phone: trimmedPhone,
        email: trimmedEmail,
        courseId: defaultCourse.id,
        goal
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Top Hero matching Image 9 */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-block px-3.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-black tracking-wider uppercase">
            TRẢI NGHIỆM ĐỘC QUYỀN KHÔNG GIỚI HẠN
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight">
            Đăng Ký Học Thử Miễn Phí – Trải Nghiệm Công Thức Bếp Trưởng
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Khám phá ngay các bài học video chuẩn Full HD, hệ thống tài liệu PDF chi tiết và nhận sự hỗ trợ trực tiếp từ các Đầu Bếp tận tâm.
          </p>

          {/* 3 Pills in row matching Image 9 */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-bold text-stone-700 shadow-2xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              100% Miễn phí
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-bold text-stone-700 shadow-2xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Kích hoạt tài khoản trong 30 giây
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-bold text-stone-700 shadow-2xs flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-red-600" />
              Hơn 20,000+ học viên tin tưởng
            </span>
          </div>
        </div>

        {/* ALREADY LOGGED IN NOTICE: if student has already registered & logged in */}
        {currentUser ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 text-center space-y-5 max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-stone-900">
                Bạn đã đăng nhập với tài khoản {currentUser.name}!
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Tài khoản của bạn đã được kích hoạt trên hệ thống ({currentUser.email || currentUser.phone}). Bạn không cần phải điền form đăng ký lại nữa.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('catalog')}
                className="w-full sm:w-auto px-6 py-3.5 bg-red-700 hover:bg-red-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Xem Tất Cả Khóa Học & Bài Học Thử Ngay</span>
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto px-5 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
              >
                Vào Tiến Độ Khóa Học Của Tôi
              </button>
            </div>
          </div>
        ) : (
          /* Form and Right Preview Card matching Image 9 (with Instructor/Course select removed) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black text-stone-900">
                  Điền thông tin nhận tài khoản học thử
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Chỉ cần nhập họ tên và <strong>ít nhất 1 trong 2 (Số điện thoại hoặc Email)</strong> để hệ thống tự động kích hoạt tài khoản.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Họ và tên */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Họ và tên của bạn <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white font-medium"
                  />
                </div>

                {/* Helper notice for 1-in-2 rule */}
                <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 text-[11px] text-red-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    <strong>Lưu ý:</strong> Bạn có thể điền <strong>Số điện thoại HOẶC Email</strong> (chỉ cần 1 trong 2 đều được).
                  </span>
                </div>

                {/* Số điện thoại & Email (Điền 1 trong 2 đều được) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Số điện thoại Zalo {email.trim() ? '(Không bắt buộc)' : '(Hoặc điền Email)'}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ví dụ: 0912345678"
                      className={`w-full px-4 py-2.5 text-xs bg-stone-50 border rounded-xl focus:outline-none focus:bg-white ${
                        duplicateStudent && duplicateStudent.phone === phone.trim()
                          ? 'border-amber-400 bg-amber-50/30'
                          : 'border-stone-200 focus:border-red-600'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Email nhận tài khoản {phone.trim() ? '(Không bắt buộc)' : '(Hoặc điền SĐT)'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ví dụ: email@domain.com"
                      className={`w-full px-4 py-2.5 text-xs bg-stone-50 border rounded-xl focus:outline-none focus:bg-white ${
                        duplicateStudent && duplicateStudent.email === email.trim().toLowerCase()
                          ? 'border-amber-400 bg-amber-50/30'
                          : 'border-stone-200 focus:border-red-600'
                      }`}
                    />
                  </div>
                </div>

                {/* DUPLICATE WARNING BANNER (Requirement 4) */}
                {duplicateReason && (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-900 animate-in fade-in duration-200">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1.5 flex-1">
                      <p className="font-black text-amber-900 text-xs">
                        Phát hiện thông tin đã đăng ký trước đó:
                      </p>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        {duplicateReason}
                      </p>
                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleDuplicateLogin}
                          className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Đăng nhập ngay với tài khoản này</span>
                        </button>
                        <span className="text-[10px] text-amber-700">
                          (Không cần đăng ký lại)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mục tiêu học */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Mục tiêu học của bạn là gì?
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white text-stone-700 font-medium"
                  >
                    <option value="Nấu ăn cho gia đình ngon hơn mỗi ngày">Nấu ăn cho gia đình ngon hơn mỗi ngày</option>
                    <option value="Mở quán kinh doanh ẩm thực (Phở, Bún bò, Lẩu, Súp lươn)">Mở quán kinh doanh ẩm thực (Phở, Bún bò, Lẩu, Súp lươn)</option>
                    <option value="Kinh doanh bánh và đồ uống online">Kinh doanh bánh và đồ uống online</option>
                    <option value="Nâng cao tay nghề đầu bếp chuyên nghiệp">Nâng cao tay nghề đầu bếp chuyên nghiệp</option>
                  </select>
                </div>

                {/* Consent checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-600 select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-red-700 focus:ring-red-600 cursor-pointer"
                  />
                  <span>
                    Tôi đồng ý nhận thông tin tài khoản học thử và các chương trình ưu đãi từ Học Món Ngon qua Zalo/Email.
                  </span>
                </label>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-red-700 hover:bg-red-800 disabled:bg-stone-400 text-white font-extrabold text-sm rounded-xl shadow-md shadow-red-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isSubmitting ? 'Đang kích hoạt tài khoản học thử...' : 'Kích Hoạt Tài Khoản Học Thử Ngay'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cam kết bảo mật thông tin 100%. Đăng ký nhanh gọn không ràng buộc.</span>
                </div>
              </form>
            </div>

            {/* Right Preview Card matching Image 9 */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-6">
              {/* Video preview thumbnail */}
              <div className="relative rounded-2xl overflow-hidden aspect-16/10 bg-stone-900 group">
                <img
                  src={defaultCourse?.thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                  alt={defaultCourse?.title || 'Khóa học học thử'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-red-700 text-white flex items-center justify-center shadow-lg">
                    <Play className="w-6 h-6 fill-white translate-x-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-xs p-2.5 rounded-xl text-white text-[11px] font-medium">
                  <p className="font-bold line-clamp-1">{defaultCourse.chapters[0]?.lessons[0]?.title || 'Bí quyết chọn nguyên liệu và sơ chế'}</p>
                  <p className="text-stone-300 text-[10px]">Giảng viên phụ trách: {defaultCourse.instructorName}</p>
                </div>
              </div>

              {/* Inclusions checklist matching Image 9 */}
              <div className="space-y-3">
                <h3 className="font-black text-stone-900 text-sm">
                  Nội dung học thử đặc quyền
                </h3>
                <p className="text-xs text-stone-500">
                  Trải nghiệm chất lượng giảng dạy chuẩn quốc tế với các kỹ thuật được đúc kết từ đầu bếp hàng đầu.
                </p>

                <ul className="space-y-2 text-xs text-stone-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Bài học video chuẩn Full HD chuyên sâu miễn phí</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Tặng kèm file PDF tóm tắt công thức</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Bảng tính Food Cost chuẩn kinh doanh nhà hàng</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Hỗ trợ giải đáp trực tiếp 1-1 cùng trợ giảng</span>
                  </li>
                </ul>
              </div>

              {/* Testimonial Quote matching Image 9 */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
                <p className="text-xs text-stone-700 italic leading-relaxed">
                  &ldquo;Nhờ học thử bài Phở truyền thống mà mình đã tự tin mở quán nhỏ tại Hà Nội. Công thức chuẩn xác và giảng viên hướng dẫn cực kỳ chi tiết!&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80"
                    alt="Minh Hương"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-stone-900">Minh Hương</h4>
                    <p className="text-[10px] text-stone-500">Học viên tại Hà Nội</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section: 3 Bước Đơn Giản Để Bắt Đầu matching Image 9 */}
        <section className="text-center space-y-8 pt-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              3 Bước Đơn Giản Để Bắt Đầu
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
              Quy trình tự động hóa giúp bạn tiếp cận kiến thức ẩm thực chỉ trong vài cú nhấp chuột.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-3">
              <span className="w-9 h-9 rounded-xl bg-red-700 text-white font-black text-sm flex items-center justify-center shadow">
                01
              </span>
              <h3 className="font-black text-stone-900 text-base">Đăng Ký Thông Tin</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Chỉ cần điền họ tên, số điện thoại Zalo hoặc Email vào form đăng ký bên trên.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-3">
              <span className="w-9 h-9 rounded-xl bg-red-700 text-white font-black text-sm flex items-center justify-center shadow">
                02
              </span>
              <h3 className="font-black text-stone-900 text-base">Nhận Tài Khoản Ngay</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Hệ thống tự động kích hoạt và gửi thông tin truy cập tài khoản học thử qua Zalo hoặc Email sau 30 giây.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-3">
              <span className="w-9 h-9 rounded-xl bg-red-700 text-white font-black text-sm flex items-center justify-center shadow">
                03
              </span>
              <h3 className="font-black text-stone-900 text-base">Trải Nghiệm & Nấu Ăn</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Truy cập các khóa học, xem video bài học Full HD, tải tài liệu PDF và bắt đầu thực hành ngay.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Accordion matching Image 9 */}
        <section className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-stone-900">
              Câu Hỏi Thường Gặp
            </h3>
            <p className="text-xs text-stone-500">
              Giải đáp nhanh các thắc mắc về chương trình học thử miễn phí.
            </p>
          </div>

          <div className="divide-y divide-stone-200">
            {FAQ_ITEMS.slice(0, 3).map((faq, idx) => (
              <div key={idx} className="py-3">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-stone-800 py-2 hover:text-red-700 cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === idx ? 'rotate-180 text-red-700' : ''}`} />
                </button>
                {openFaq === idx && (
                  <p className="text-xs text-stone-600 leading-relaxed pt-2 pb-1">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
