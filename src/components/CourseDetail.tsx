import React, { useState } from 'react';
import { 
  Star, 
  Clock, 
  BookOpen, 
  Users, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  Play, 
  Lock, 
  ShieldCheck, 
  FileText, 
  FileSpreadsheet, 
  MessageSquare,
  Droplets,
  Utensils,
  Zap,
  Calculator,
  Flame,
  Sparkles,
  Phone,
  MessageCircle
} from 'lucide-react';
import { Course, Lesson, Student, Enrollment } from '../types';
import { StorageService } from '../services/storage';
import { toYouTubeEmbedUrl } from '../utils/youtube';
import { getLessonUnlockStatus, getChapterUnlockStatus } from '../utils/learningProgress';

interface CourseDetailProps {
  course: Course;
  currentUser: Student | null;
  userEnrollment?: Enrollment;
  onEnroll: (course: Course) => void;
  onStartTrial: (course: Course, lessonId?: string) => void;
  onOpenPlayer: (course: Course, lessonId?: string) => void;
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({
  course,
  currentUser,
  userEnrollment,
  onEnroll,
  onStartTrial,
  onOpenPlayer,
  onNavigate
}) => {
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({
    'chap-1': true,
    'chap-2': true,
    'chap-3': true,
    'chap-4': true,
    [course.chapters[0]?.id || '']: true
  });
  const [playingVideo, setPlayingVideo] = useState(false);

  const toggleChapter = (chapterId: string) => {
    setOpenChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const totalLessons = course.chapters.reduce((acc, c) => acc + c.lessons.length, 0);
  const trialLessons = course.chapters.flatMap(c => c.lessons).filter(l => l.isFreeTrial);

  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  const discountPercent = Math.round(
    ((course.originalPrice - course.discountPrice) / course.originalPrice) * 100
  );

  const isPurchased = userEnrollment?.type === 'paid';
  const isTrialEnrolled = userEnrollment?.type === 'trial';

  // Get benefit icon
  const getBenefitIcon = (iconName: string) => {
    switch (iconName) {
      case 'droplets': return <Droplets className="w-5 h-5 text-red-600" />;
      case 'utensils': return <Utensils className="w-5 h-5 text-red-600" />;
      case 'zap': return <Zap className="w-5 h-5 text-red-600" />;
      case 'calculator': return <Calculator className="w-5 h-5 text-red-600" />;
      case 'flame': return <Flame className="w-5 h-5 text-red-600" />;
      default: return <Sparkles className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb matching Image 1 */}
        <nav className="flex items-center gap-2 text-xs text-stone-500">
          <button onClick={() => onNavigate('home')} className="hover:text-red-700">Trang chủ</button>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <button onClick={() => onNavigate('catalog')} className="hover:text-red-700">{course.category}</button>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className="font-semibold text-stone-900 truncate max-w-xs">{course.title}</span>
        </nav>

        {/* Top Header Block & Video Preview with Right Floating Checkout Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Title & Video */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight leading-snug">
                {course.title}
              </h1>
              <p className="text-stone-600 text-sm mt-2 leading-relaxed">
                {course.shortDescription}
              </p>

              {/* Meta stats matching Image 1 */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-600 mt-4">
                <span className="px-2 py-1 rounded bg-amber-100 text-amber-900 flex items-center gap-1 font-bold">
                  ★ {course.rating} ({course.reviewCount.toLocaleString()} đánh giá)
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-stone-400" />
                  {course.studentCount.toLocaleString()} học viên
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-stone-400" />
                  Thời lượng {course.durationHours}h
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-stone-400" />
                  {totalLessons} bài học
                </span>
              </div>
            </div>

            {/* Video Player Preview Box matching Image 1 */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-stone-950 aspect-16/9 group border-2 border-stone-800">
              {playingVideo ? (
                <iframe
                  src={toYouTubeEmbedUrl(course.previewVideoUrl, { autoplay: true })}
                  title={course.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div 
                  onClick={() => setPlayingVideo(true)}
                  className="w-full h-full relative cursor-pointer"
                >
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-85 group-hover:scale-103 group-hover:opacity-95 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/40" />

                  {/* Header overlay text */}
                  <div className="absolute top-4 left-5 right-5 flex items-center justify-between">
                    <span className="text-white text-xs sm:text-sm font-bold bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                      Học Món Ngon - Chi Tiết Khóa Học {course.title.split(' - ')[0]}
                    </span>
                    <span className="hidden sm:inline-block text-[11px] font-bold text-amber-400 bg-black/60 px-2.5 py-1 rounded">
                      Masterclass
                    </span>
                  </div>

                  {/* Big Red Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-700/95 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-red-600 transition-all">
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white translate-x-0.5" />
                    </div>
                  </div>

                  {/* Bottom Preview Bar matching Image 1 */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 flex items-center justify-between text-white text-xs sm:text-sm font-semibold">
                    <span>
                      Xem bài học thử 1: {course.chapters[0]?.lessons[0]?.title || 'Bí quyết chọn xương và ninh nước dùng'} - {course.chapters[0]?.lessons[0]?.durationMinutes || 18} phút
                    </span>
                    <span className="text-red-400 hover:text-red-300 underline font-bold shrink-0 ml-2">
                      Xem ngay
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Floating Purchase Card matching Image 1 */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xl space-y-6">
              {/* Pricing row */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-red-700">
                    {formatPrice(course.discountPrice)}
                  </span>
                  <span className="text-sm text-stone-400 line-through">
                    {formatPrice(course.originalPrice)}
                  </span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded">
                    Giảm {discountPercent}%
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Đã bao gồm VAT & bộ tài liệu công thức gram chuẩn
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isPurchased ? (
                  <button
                    onClick={() => onOpenPlayer(course)}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Vào Học Ngay (Đã Mua)
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onEnroll(course)}
                      className="w-full py-4 bg-red-700 hover:bg-red-800 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-red-700/25 hover:shadow-red-700/40 transition-all cursor-pointer text-center"
                    >
                      Đăng Ký Khóa Học Trọn Gói
                    </button>

                    <button
                      onClick={() => onStartTrial(course, trialLessons[0]?.id)}
                      className="w-full py-3 bg-white hover:bg-stone-50 text-red-700 font-bold text-sm rounded-xl border-2 border-red-700 hover:border-red-800 transition-all cursor-pointer text-center"
                    >
                      {isTrialEnrolled ? 'Tiếp Tục Học Thử' : 'Học Thử Miễn Phí Khóa Này'}
                    </button>
                  </>
                )}
              </div>

              {/* Course Inclusions List matching Image 1 */}
              <div className="border-t border-stone-100 pt-5 space-y-3">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Khóa học bao gồm:
                </h4>
                <ul className="space-y-2.5 text-xs text-stone-700">
                  {(course.inclusions && course.inclusions.length > 0 ? course.inclusions : [
                    `${totalLessons} video bài học Full HD trọn đời`,
                    'File PDF công thức gram chuẩn cho 50 - 200 bát',
                    'Bảng tính giá vốn Excel tự động',
                    `Nhóm Zalo hỗ trợ 1-1 cùng ${course.instructorName}`,
                    'Cam kết hoàn tiền 100% trong 7 ngày'
                  ]).map((inc, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Guarantee badge */}
              <div className="bg-stone-50 rounded-xl p-3 flex items-center gap-3 border border-stone-200">
                <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                <p className="text-[11px] text-stone-600 leading-tight">
                  Kích hoạt tự động ngay sau khi chuyển khoản. Hỗ trợ 24/7 qua Hotline 1900 8888.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Bạn Sẽ Nhận Được Gì Từ Khóa Học? (4 Cards matching Image 1) */}
        <section className="pt-6">
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mb-6">
            Bạn Sẽ Nhận Được Gì Từ Khóa Học?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(course.benefits.length > 0 ? course.benefits : [
              {
                icon: 'droplets',
                title: 'Nấu nước dùng trong ngọt không mì chính',
                description: 'Bí quyết chọn xương ống, xương cục và ninh hầm đúng nhiệt độ để lấy độ ngọt tự nhiên từ tủy.'
              },
              {
                icon: 'utensils',
                title: 'Tự làm tương ớt & tương đen gia truyền',
                description: 'Công thức pha chế gia vị chấm đặc trưng miền Bắc giúp tăng hương vị đậm đà cho tô phở.'
              },
              {
                icon: 'zap',
                title: 'Quy trình ra món 45s',
                description: 'Tối ưu hóa không gian quầy bếp, sắp xếp vị trí nguyên liệu để phục vụ khách hàng nhanh chóng giờ cao điểm.'
              },
              {
                icon: 'calculator',
                title: 'Quản lý chi phí nguyên liệu',
                description: 'Cách tính giá cost chi tiết từng tô phở, kiểm soát hao hụt và tối ưu hóa lợi nhuận kinh doanh quán ăn.'
              }
            ]).map((benefit, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
                  {getBenefitIcon(benefit.icon)}
                </div>
                <h3 className="font-extrabold text-stone-900 text-sm leading-snug">
                  {benefit.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Giáo Trình Bài Học matching Image 1 */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                  Giáo Trình {totalLessons} Bài Học
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Mở khóa tuần tự
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Lộ trình chuẩn Bếp trưởng: Hoàn thành bài học trước để mở khóa bài tiếp theo và mở khóa chương mới
              </p>
            </div>
            <span className="text-xs font-bold text-stone-600">
              Tổng thời lượng: {course.durationHours} giờ
            </span>
          </div>

          <div className="divide-y divide-stone-200 mt-4">
            {course.chapters.map((chapter) => {
              const isOpen = openChapters[chapter.id] ?? true;
              const chapterIsFree = chapter.isFree !== false;
              const freeLessonsInChapter = chapterIsFree 
                ? chapter.lessons.filter(l => l.isFreeTrial).length 
                : 0;
              const completedLessonIds = userEnrollment?.completedLessonIds || [];
              const isPaidUser = isPurchased;
              const chapUnlockStatus = getChapterUnlockStatus(course, chapter.id, completedLessonIds, isPaidUser);
              const isChapterLocked = isPurchased ? !chapUnlockStatus.unlocked : false;

              return (
                <div key={chapter.id} className="py-4">
                  {/* Chapter Header */}
                  <button
                    onClick={() => toggleChapter(chapter.id)}
                    className="w-full flex items-center justify-between text-left py-2 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronDown
                        className={`w-4 h-4 text-stone-400 group-hover:text-red-700 transition-transform ${
                          isOpen ? 'rotate-180 text-red-700' : ''
                        }`}
                      />
                      <span className="font-bold text-sm sm:text-base text-stone-900 group-hover:text-red-700 flex items-center gap-2">
                        {isChapterLocked && <Lock className="w-4 h-4 text-amber-500 shrink-0" />}
                        <span>{chapter.title}</span>
                      </span>
                    </div>

                    <span className="text-xs font-medium text-stone-500 shrink-0">
                      {isChapterLocked ? (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[11px] font-bold inline-flex items-center gap-1 border border-amber-200">
                          <Lock className="w-3 h-3 text-amber-600" /> Khóa (Cần hoàn thành chương trước)
                        </span>
                      ) : !chapterIsFree ? (
                        <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-700 text-[11px] font-bold inline-flex items-center gap-1">
                          <Lock className="w-3 h-3 text-stone-500" /> Chương mất phí (Khóa tất cả bài)
                        </span>
                      ) : isPurchased && chapUnlockStatus.isFullyCompleted ? (
                        <span className="text-emerald-700 font-bold text-xs inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành
                        </span>
                      ) : freeLessonsInChapter > 0 ? (
                        <span className="text-red-700 font-semibold">Có {freeLessonsInChapter} bài học thử</span>
                      ) : (
                        `${chapter.lessons.length} bài học`
                      )}
                    </span>
                  </button>

                  {/* Lessons list */}
                  {isOpen && (
                    <div className="mt-3 space-y-2 pl-4 sm:pl-7">
                      {chapter.lessons.map((lesson) => {
                        const canAccessLesson = isPurchased || (chapterIsFree && lesson.isFreeTrial);
                        const lessonUnlockStatus = getLessonUnlockStatus(course, lesson.id, completedLessonIds, isPaidUser);
                        const isLessonUnlocked = isPurchased ? lessonUnlockStatus.unlocked : canAccessLesson;
                        const isCompleted = completedLessonIds.includes(lesson.id);

                        return (
                          <div
                            key={lesson.id}
                            className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors text-xs text-stone-800 group ${
                              isCompleted ? 'bg-emerald-50/50' : 'hover:bg-stone-50'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {isCompleted ? (
                                <button
                                  onClick={() => onOpenPlayer(course, lesson.id)}
                                  className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 cursor-pointer"
                                  title="Đã hoàn thành - Bấm để xem lại"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                </button>
                              ) : isLessonUnlocked ? (
                                <button
                                  onClick={() => onOpenPlayer(course, lesson.id)}
                                  className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0 hover:bg-red-200 cursor-pointer"
                                  title="Sẵn sàng học"
                                >
                                  <Play className="w-2.5 h-2.5 fill-red-700 translate-x-0.5" />
                                </button>
                              ) : (
                                <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center shrink-0" title="Bài học bị khóa">
                                  <Lock className="w-3 h-3 text-stone-400" />
                                </span>
                              )}
                              <span 
                                onClick={() => {
                                  onOpenPlayer(course, lesson.id);
                                }}
                                className={`font-medium line-clamp-1 cursor-pointer hover:text-red-700 ${
                                  !isLessonUnlocked ? 'text-stone-500' : isCompleted ? 'text-emerald-900 font-semibold' : 'text-stone-900'
                                }`}
                              >
                                {lesson.title}
                              </span>

                              {lesson.requirePaymentForDoc && !isPurchased && (
                                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 shrink-0">
                                  Tài liệu có phí
                                </span>
                              )}

                              {isPurchased && !isLessonUnlocked && (
                                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                                  Khóa tuần tự
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 shrink-0 ml-2">
                              {canAccessLesson && !isPurchased ? (
                                <button
                                  onClick={() => onOpenPlayer(course, lesson.id)}
                                  className="px-2.5 py-1 rounded bg-red-100 hover:bg-red-200 text-red-800 font-bold text-[11px] cursor-pointer"
                                >
                                  Học thử ({lesson.durationMinutes} phút)
                                </button>
                              ) : isCompleted ? (
                                <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                                  <span>Đã học</span>
                                  <span className="text-stone-400 font-normal">({lesson.durationMinutes}p)</span>
                                </span>
                              ) : isLessonUnlocked ? (
                                <button
                                  onClick={() => onOpenPlayer(course, lesson.id)}
                                  className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[11px] cursor-pointer"
                                >
                                  Vào học ({lesson.durationMinutes}p)
                                </button>
                              ) : (
                                <span className="text-stone-400 font-mono text-[11px] flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5 text-stone-400" />
                                  <span>{lesson.durationMinutes} phút</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Giảng Viên Hướng Dẫn matching Instructor from Storage */}
        {(() => {
          const instructor = StorageService.getInstructors().find(i => i.id === course.instructorId)
            || StorageService.getInstructors().find(i => i.name.toLowerCase() === course.instructorName.toLowerCase())
            || StorageService.getInstructors()[0];

          const chefAvatar = instructor?.avatar || course.instructorAvatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80';
          const chefName = instructor?.name || course.instructorName;
          const chefTitle = instructor?.title || 'Bếp trưởng điều hành, Cố vấn kinh doanh ẩm thực';
          const chefSpecialty = instructor?.specialty;
          const chefBio = instructor?.bio || `Chef ${chefName} là chuyên gia ẩm thực truyền thống với nhiều năm kinh nghiệm thực chiến, tâm huyết đồng hành đào tạo các chủ quán kinh doanh thành công.`;
          const studentCount = instructor?.studentCount || course.studentCount || 1280;
          const courseCount = instructor?.courseCount || 1;
          const rating = instructor?.rating || course.rating || 4.9;

          return (
            <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-black text-stone-900 tracking-tight mb-6">
                Giảng Viên Hướng Dẫn
              </h2>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <img
                  src={chefAvatar}
                  alt={chefName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-red-100 shadow-md shrink-0"
                />
                <div className="space-y-3 text-center sm:text-left flex-1">
                  <div>
                    <h3 className="text-xl font-black text-stone-900">
                      {chefName}
                    </h3>
                    <p className="text-xs font-semibold text-red-700 mt-0.5">
                      {chefTitle}
                    </p>
                    {chefSpecialty && (
                      <p className="text-[11px] font-medium text-stone-500 mt-0.5">
                        Chuyên môn: <span className="text-stone-800 font-bold">{chefSpecialty}</span>
                      </p>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl whitespace-pre-line">
                    {chefBio}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-stone-600 pt-1">
                    <span>👥 {studentCount.toLocaleString('vi-VN')}+ Học viên</span>
                    <span>📖 {courseCount} Khóa học chuyên sâu</span>
                    <span className="text-amber-600">★ {rating} Đánh giá trung bình</span>
                    {instructor?.zalo && (
                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                        💬 Zalo: {instructor.zalo}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* Section: Đánh Giá Từ Học Viên (Tiêu đề chỉ ghi Đánh Giá Từ Học Viên, không ghi gì thêm) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                Đánh Giá Từ Học Viên
              </h2>
            </div>
            <div className="flex items-center gap-1 text-sm font-extrabold text-stone-900">
              <span className="text-amber-500">★★★★★</span>
              <span>{course.rating || 4.9} / 5.0</span>
            </div>
          </div>

          {/* Real Dish Photos Gallery matching Image 1 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl overflow-hidden shadow-sm aspect-4/3 bg-stone-100 group">
              <img
                src="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=500&q=80"
                alt="Thành phẩm học viên nấu thực tế"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-sm aspect-4/3 bg-stone-100 group">
              <img
                src="https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=500&q=80"
                alt="Học viên thao tác bếp"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-sm aspect-4/3 bg-stone-100 group">
              <img
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80"
                alt="Món ăn mở quán kinh doanh"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-sm aspect-4/3 bg-stone-100 group">
              <img
                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80"
                alt="Chủ quán khai trương"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Student Reviews Columns */}
          {(() => {
            const reviewsList = (course.reviews && course.reviews.length > 0)
              ? course.reviews
              : [
                  {
                    id: 'rev-default-1',
                    courseId: course.id,
                    author: 'Minh Hoàng',
                    role: 'Chủ quán ăn tại Đà Nẵng',
                    rating: 5,
                    comment: 'Khóa học cực kỳ chi tiết và thực tế. Nhờ công thức chuẩn vị và bảng tính giá cost của Bếp trưởng mà quán mình đã khai trương thuận lợi, khách khen ngon và quay lại liên tục!',
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
                    dishImage: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=500&q=80'
                  },
                  {
                    id: 'rev-default-2',
                    courseId: course.id,
                    author: 'Thu Hương',
                    role: 'Học viên tại TP. Hồ Chí Minh',
                    rating: 5,
                    comment: 'Ban đầu mình cứ nghĩ nấu món này phức tạp lắm, nhưng Giảng viên hướng dẫn từng li từng tí, từ cách chọn nguyên liệu tươi đến mẹo ninh và nêm nếm. Rất đáng tiền đầu tư!',
                    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
                    dishImage: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=500&q=80'
                  },
                  {
                    id: 'rev-default-3',
                    courseId: course.id,
                    author: 'Quốc Nam',
                    role: 'Chủ quán ăn tại Hà Nội',
                    rating: 5,
                    comment: 'Phần hướng dẫn setup quầy bếp 45 giây giúp quán mình phục vụ nhanh gấp đôi vào giờ cao điểm buổi sáng. Cảm ơn Giảng viên và đội ngũ Học Món Ngon rất nhiều.',
                    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
                    dishImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80'
                  }
                ];

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {reviewsList.map((rev, idx) => (
                  <div key={rev.id || idx} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {rev.avatar ? (
                          <img
                            src={rev.avatar}
                            alt={rev.author}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-red-100 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-red-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {rev.author?.split(' ').slice(-1)[0]?.slice(0, 2).toUpperCase() || 'HV'}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-xs text-stone-900">{rev.author}</h4>
                          <p className="text-[11px] text-stone-500">{rev.role || 'Học viên Học Món Ngon'}</p>
                        </div>
                      </div>
                      <div className="text-amber-500 text-xs">
                        {'★'.repeat(Math.min(5, Math.max(1, rev.rating || 5)))}
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed italic">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>

                    {rev.dishImage && (
                      <div className="mt-2 rounded-xl overflow-hidden aspect-16/9 bg-stone-100 border border-stone-100">
                        <img
                          src={rev.dishImage}
                          alt={`Thành phẩm của ${rev.author}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </section>
      </div>
    </div>
  );
};
