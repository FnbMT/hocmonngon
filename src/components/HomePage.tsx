import React, { useState } from 'react';
import { 
  Star, 
  BookOpen, 
  ArrowRight, 
  ChevronDown, 
  Sparkles,
  Users,
  ChefHat,
  CheckCircle2,
  Phone,
  MessageCircle,
  GraduationCap
} from 'lucide-react';
import { Course, Instructor, HomepageConfig } from '../types';
import { StorageService } from '../services/storage';

interface HomePageProps {
  courses: Course[];
  instructors: Instructor[];
  onSelectCourse: (course: Course) => void;
  onSelectTrial: (courseId?: string) => void;
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
  onQuickTrialSubmit: (data: { name: string; contact: string; field: string }) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  courses,
  instructors,
  onSelectCourse,
  onSelectTrial,
  onNavigate,
  onQuickTrialSubmit
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [trialName, setTrialName] = useState('');
  const [trialContact, setTrialContact] = useState('');
  const [trialField, setTrialField] = useState('Món Việt truyền thống & Mở quán');
  const [trialSuccessMsg, setTrialSuccessMsg] = useState(false);
  const [homeConfig, setHomeConfig] = useState<HomepageConfig>(() => StorageService.getHomepageConfig());

  React.useEffect(() => {
    const handleUpdate = () => {
      setHomeConfig(StorageService.getHomepageConfig());
    };
    window.addEventListener('homepage_config_updated', handleUpdate);
    return () => window.removeEventListener('homepage_config_updated', handleUpdate);
  }, []);

  // Active featured chef in Hero section
  const [selectedHeroChefId, setSelectedHeroChefId] = useState<string>(
    instructors[0]?.id || ''
  );

  const featuredChef = instructors.find(i => i.id === selectedHeroChefId) || instructors[0];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialName || !trialContact) return;
    onQuickTrialSubmit({ name: trialName, contact: trialContact, field: trialField });
    setTrialSuccessMsg(true);
    setTimeout(() => {
      onNavigate('trial');
    }, 800);
  };

  const scrollToChefSection = (chefId: string) => {
    const el = document.getElementById(`chef-section-${chefId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      onNavigate('catalog', { chefId });
    }
  };

  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-stone-200 bg-linear-to-b from-stone-50 via-[#faf9f6] to-[#faf9f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 text-red-800 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-red-700" />
                {homeConfig.hero.topBadge || 'Học viện ẩm thực hàng đầu Việt Nam'}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.15]">
                {homeConfig.hero.title || 'Học nấu món ngon cùng những Đầu Bếp bạn tin tưởng'}
              </h1>

              <p className="text-lg text-stone-600 leading-relaxed max-w-2xl font-normal">
                {homeConfig.hero.subtitle || 'Trải nghiệm phương pháp học trực tuyến đỉnh cao từ các Đầu Bếp tận tâm. Nắm vững bí quyết từ món truyền thống đến hiện đại với công thức chuẩn 100%.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('catalog')}
                  className="px-7 py-3.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-lg shadow-red-700/25 hover:shadow-red-700/40 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {homeConfig.hero.ctaExploreText || 'Khám phá khóa học'}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSelectTrial()}
                  className="px-7 py-3.5 bg-white hover:bg-stone-50 text-red-700 font-bold rounded-xl border-2 border-red-700 hover:border-red-800 transition-all cursor-pointer shadow-xs"
                >
                  {homeConfig.hero.ctaTrialText || 'Đăng ký học thử miễn phí'}
                </button>
              </div>

              {/* Social Proof Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-stone-200">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-stone-900">
                    {homeConfig.hero.stats.studentsCount || '15,000+'}
                  </p>
                  <p className="text-xs text-stone-500 font-medium mt-0.5">
                    {homeConfig.hero.stats.studentsLabel || 'Học viên tin tưởng'}
                  </p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center gap-1">
                    {homeConfig.hero.stats.ratingValue || '4.9'} <Star className="w-5 h-5 text-amber-500 fill-amber-500 inline" />
                  </p>
                  <p className="text-xs text-stone-500 font-medium mt-0.5">
                    {homeConfig.hero.stats.ratingLabel || 'Đánh giá trung bình'}
                  </p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-stone-900">
                    {homeConfig.hero.stats.chefsCount || `${instructors.length}+`}
                  </p>
                  <p className="text-xs text-stone-500 font-medium mt-0.5">
                    {homeConfig.hero.stats.chefsLabel || 'Đầu bếp lành nghề'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Featured Chef Card */}
            <div className="lg:col-span-5 relative">
              {featuredChef ? (
                <div className="space-y-4">
                  <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-900 group">
                    <img
                      src={featuredChef.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80'}
                      alt={featuredChef.name}
                      className="w-full h-[460px] object-cover object-top group-hover:scale-102 transition-transform duration-500"
                    />
                    
                    {/* Floating Badge on Image */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-red-700 text-white font-bold flex items-center justify-center text-xs shadow-xs uppercase">
                          {featuredChef.name.split(' ').slice(-2).map(n => n[0]).join('') || 'CB'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-stone-900 text-sm leading-snug truncate uppercase">
                            {featuredChef.name}
                          </p>
                          <p className="text-[11px] text-stone-500 font-medium truncate">
                            {featuredChef.specialty || featuredChef.title}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => scrollToChefSection(featuredChef.id)}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        Xem khóa học
                      </button>
                    </div>
                  </div>

                  {/* Switch Featured Chef Quick Carousel / Pills */}
                  {instructors.length > 1 && (
                    <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0">
                        Chọn Bếp Trưởng:
                      </span>
                      {instructors.map(chef => (
                        <button
                          key={chef.id}
                          onClick={() => setSelectedHeroChefId(chef.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            featuredChef.id === chef.id
                              ? 'bg-red-700 text-white shadow-xs scale-105'
                              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          <img
                            src={chef.avatar}
                            alt={chef.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span>{chef.name.split(' ').slice(-2).join(' ')}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-md mx-auto p-8 bg-white rounded-3xl border border-stone-200 text-center space-y-4">
                  <ChefHat className="w-12 h-12 text-red-700 mx-auto" />
                  <h3 className="font-bold text-stone-800 text-base">Đội ngũ giảng viên Học Món Ngon</h3>
                  <p className="text-xs text-stone-500">Các Bếp trưởng kinh nghiệm thực chiến sẵn sàng chia sẻ bí quyết nấu ăn chuẩn vị.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC INSTRUCTOR SECTIONS: Every Instructor and their Courses displayed sequentially from top to bottom */}
      {instructors.map((chef, idx) => {
        const chefCourses = courses.filter(c => c.instructorId === chef.id);
        const isEven = idx % 2 === 0;

        return (
          <section
            key={chef.id}
            id={`chef-section-${chef.id}`}
            className={`py-16 border-b border-stone-200 transition-colors ${
              isEven ? 'bg-[#faf9f6]' : 'bg-white'
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Chef Header Profile */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
                <div className="flex items-start gap-4">
                  <img
                    src={chef.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80'}
                    alt={chef.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-3 ring-red-100 shadow-sm shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase font-extrabold tracking-wider text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full inline-block">
                      {chef.badge || chef.specialty || 'CHUYÊN GIA ẨM THỰC'}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight uppercase">
                      {chef.name}
                    </h2>
                    <p className="text-xs text-stone-500 font-medium">
                      {chef.title}
                    </p>
                  </div>
                </div>

                {/* Chef Bio & Contacts */}
                <div className="lg:max-w-xl space-y-2">
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                    {chef.bio}
                  </p>
                  {(chef.phone || chef.zalo) && (
                    <div className="flex items-center gap-3 text-xs text-stone-500 font-semibold pt-1">
                      <span className="flex items-center gap-1 text-emerald-700">
                        <MessageCircle className="w-3.5 h-3.5" />
                        Zalo/Hotline hỗ trợ: <strong className="text-stone-900 font-mono">{chef.phone || chef.zalo}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Grid for this Chef */}
              {chefCourses.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {chefCourses.slice(0, 3).map((course, cIdx) => (
                      <div
                        key={course.id}
                        className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                      >
                        <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                          <img
                            src={course.thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            {(() => {
                              // If course explicitly configured to not show badge
                              if (course.badge === 'none' || course.badge === '') return null;

                              let badgeText = course.badge;
                              let badgeColor = course.badgeColor;

                              // Fallback if not configured
                              if (!badgeText) {
                                if (cIdx === 0) { badgeText = 'Bán chạy nhất'; badgeColor = 'red'; }
                                else if (cIdx === 1) { badgeText = 'Chuyên sâu mở quán'; badgeColor = 'dark'; }
                                else { badgeText = 'Công thức độc quyền'; badgeColor = 'amber'; }
                              }

                              const colorClass = 
                                badgeColor === 'dark' ? 'bg-stone-900 text-white' :
                                badgeColor === 'amber' ? 'bg-amber-600 text-white' :
                                badgeColor === 'emerald' ? 'bg-emerald-700 text-white' :
                                badgeColor === 'purple' ? 'bg-purple-700 text-white' :
                                badgeColor === 'blue' ? 'bg-blue-700 text-white' :
                                'bg-red-700 text-white';

                              return (
                                <span className={`px-2.5 py-1 rounded ${colorClass} text-[11px] font-bold shadow-xs`}>
                                  {badgeText}
                                </span>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 text-xs text-stone-500">
                              <span className="flex items-center gap-1 font-medium">
                                <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                                {course.chapters.reduce((acc, chap) => acc + chap.lessons.length, 0) || 12} bài học ({course.durationHours} giờ)
                              </span>
                              <span>•</span>
                              <span className="text-amber-700 font-semibold">{course.level}</span>
                            </div>

                            <h3 
                              onClick={() => onSelectCourse(course)}
                              className="font-bold text-lg text-stone-900 group-hover:text-red-700 cursor-pointer transition-colors line-clamp-2"
                              title={course.title}
                            >
                              {course.title.split(' - ')[0]}
                            </h3>

                            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                              {course.shortDescription}
                            </p>
                          </div>

                          <div className="pt-4 mt-4 border-t border-stone-100">
                            <div className="flex items-baseline justify-between mb-3">
                              <div>
                                <span className="text-[11px] text-stone-400 block font-medium">Học phí trọn đời</span>
                                <span className="text-lg font-black text-red-700">
                                  {formatPrice(course.discountPrice)}
                                </span>
                              </div>
                              <span className="text-xs text-stone-400 line-through">
                                {formatPrice(course.originalPrice)}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => onSelectTrial(course.id)}
                                className="py-2 px-3 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer text-center"
                              >
                                Học thử miễn phí
                              </button>
                              <button
                                onClick={() => onSelectCourse(course)}
                                className="py-2 px-3 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-xs transition-colors cursor-pointer text-center"
                              >
                                Xem chi tiết
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 text-center">
                    <button
                      onClick={() => onNavigate('catalog', { chefId: chef.id })}
                      className="inline-flex items-center gap-2 text-sm font-bold text-red-700 hover:text-red-800 cursor-pointer group"
                    >
                      <span>Xem tất cả {chefCourses.length} khóa học của {chef.name}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </>
              ) : (
                /* Empty state when instructor has no courses yet (e.g. freshly added instructor) */
                <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center mx-auto shadow-2xs">
                    <ChefHat className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-stone-900 text-base">
                      Khóa học của Bếp trưởng {chef.name} đang được chuẩn bị
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed max-w-md mx-auto">
                      {chef.name} đang hoàn thiện giáo trình chi tiết, quay video bài giảng thực tế và định lượng gram chuẩn vị. Hãy đăng ký nhận thông báo sớm nhất ngay khi khóa học được phát hành!
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => onSelectTrial()}
                      className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Đăng ký nhận thông báo học thử
                    </button>
                    <button
                      onClick={() => onNavigate('catalog')}
                      className="px-5 py-2.5 bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-xl border border-stone-300 transition-colors cursor-pointer"
                    >
                      Khám phá các khóa học khác
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* Red Call To Action Banner */}
      <section className="bg-red-700 py-16 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
          <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black tracking-wider uppercase">
            {homeConfig.trialSection.badge || 'HOÀN TOÀN MIỄN PHÍ'}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-snug">
            {homeConfig.trialSection.title || 'Trải nghiệm học nấu ăn cùng giảng viên hàng đầu ngay hôm nay'}
          </h2>
          <p className="text-red-100 text-sm max-w-xl mx-auto">
            {homeConfig.trialSection.subtitle || 'Đăng ký ngay để nhận ngay 3 bài học nấu ăn miễn phí từ các Đầu Bếp và tư vấn lộ trình học tập phù hợp nhất với mục tiêu của bạn.'}
          </p>

          <form onSubmit={handleQuickSubmit} className="bg-white text-stone-800 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto text-left space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={trialName}
                  onChange={(e) => setTrialName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Số điện thoại hoặc Email</label>
                <input
                  type="text"
                  required
                  placeholder="0912345678 / email@domain.com"
                  value={trialContact}
                  onChange={(e) => setTrialContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Bạn quan tâm đến lĩnh vực nào nhất?</label>
              <select
                value={trialField}
                onChange={(e) => setTrialField(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-red-600 focus:bg-white"
              >
                {(homeConfig.trialSection.fieldOptions && homeConfig.trialSection.fieldOptions.length > 0
                  ? homeConfig.trialSection.fieldOptions
                  : [
                      'Món Việt truyền thống & Mở quán (Phở, Bún bò, Cơm tấm)',
                      'Lươn Xứ Nghệ & Đặc sản mở quán',
                      'Bánh Âu, Croissant & Tiệm bánh',
                      'Dimsum, Nước lẩu & Món Á',
                      'Ăn vặt & Đồ uống hot trend'
                    ]
                ).map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-lg transition-all text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              {trialSuccessMsg ? 'Đang chuyển đến khóa học thử...' : (homeConfig.trialSection.buttonText || 'Nhận tài khoản học thử miễn phí ngay')}
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-stone-500 text-center">
              Bằng việc đăng ký, bạn đồng ý với các điều khoản dịch vụ và chính sách bảo mật của Học Món Ngon.
            </p>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs uppercase font-extrabold tracking-wider text-red-700 mb-1">
            {homeConfig.faq.tag || 'HỎI ĐÁP'}
          </p>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">
            {homeConfig.faq.title || 'Câu hỏi thường gặp'}
          </h2>
          <p className="text-sm text-stone-500 mt-2">
            {homeConfig.faq.subtitle || 'Giải đáp nhanh các thắc mắc về chương trình học và tài khoản'}
          </p>
        </div>

        <div className="space-y-3">
          {(homeConfig.faq.items || []).map((faq, idx) => (
            <div
              key={idx}
              className="border border-stone-200 bg-white rounded-xl overflow-hidden transition-all shadow-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left px-5 py-4 font-bold text-stone-800 flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors"
              >
                <span className="text-base">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180 text-red-700' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
