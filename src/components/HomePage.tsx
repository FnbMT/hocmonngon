import React, { useState } from 'react';
import { 
  Star, 
  ArrowRight, 
  ChevronDown, 
  ChevronRight,
  Sparkles,
  ChefHat,
  MessageCircle,
  UtensilsCrossed
} from 'lucide-react';
import { Course, Instructor, HomepageConfig } from '../types';
import { StorageService } from '../services/storage';

interface HomePageProps {
  courses: Course[];
  instructors: Instructor[];
  cartCourseIds?: string[];
  onSelectCourse: (course: Course) => void;
  onSelectTrial: (courseId?: string) => void;
  onBuyNow: (course: Course) => void;
  onAddToCart: (course: Course) => void;
  onOpenCart?: () => void;
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
  onQuickTrialSubmit: (data: { name: string; contact: string; field: string }) => void;
}

const CourseCardThumbnail: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-full h-full bg-linear-to-br from-stone-100 via-amber-50 to-stone-200 flex flex-col items-center justify-center p-4 text-center">
        <UtensilsCrossed className="w-8 h-8 text-[#0e4a38]/50 mb-1.5" />
        <span className="text-[11px] font-bold text-stone-600 line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
  );
};

export const HomePage: React.FC<HomePageProps> = ({
  courses,
  instructors,
  cartCourseIds = [],
  onSelectCourse,
  onSelectTrial,
  onBuyNow,
  onAddToCart,
  onOpenCart,
  onNavigate,
  onQuickTrialSubmit
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [trialName, setTrialName] = useState('');
  const [trialContact, setTrialContact] = useState('');
  const [trialField, setTrialField] = useState('Món Việt truyền thống & Mở quán');
  const [trialSuccessMsg, setTrialSuccessMsg] = useState(false);
  const [homeConfig, setHomeConfig] = useState<HomepageConfig>(() => StorageService.getHomepageConfig());
  const [visibleLimits, setVisibleLimits] = useState<Record<string, number>>({});

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

  const formatPriceVnd = (p: number) => new Intl.NumberFormat('en-US').format(p);

  const handleExpandChefCourses = (limitKey: string, totalCourses: number) => {
    const current = visibleLimits[limitKey] || 24;
    if (totalCourses > current) {
      setVisibleLimits(prev => ({ ...prev, [limitKey]: current + 24 }));
    } else {
      onNavigate('catalog');
    }
  };

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
                  <p className="text-2xl sm:text-3xl font-black text-stone-900 tabular-nums">
                    {homeConfig.hero.stats.studentsCount || '15,000+'}
                  </p>
                  <p className="text-xs text-stone-500 font-medium mt-0.5">
                    {homeConfig.hero.stats.studentsLabel || 'Học viên tin tưởng'}
                  </p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center gap-1 tabular-nums">
                    {homeConfig.hero.stats.ratingValue || '4.9'} <Star className="w-5 h-5 text-amber-500 fill-amber-500 inline" />
                  </p>
                  <p className="text-xs text-stone-500 font-medium mt-0.5">
                    {homeConfig.hero.stats.ratingLabel || 'Đánh giá trung bình'}
                  </p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-stone-900 tabular-nums">
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
                      src={featuredChef.avatar}
                      alt={featuredChef.name}
                      referrerPolicy="no-referrer"
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
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                      >
                        Xem khóa học
                      </button>
                    </div>
                  </div>

                  {/* Switch Featured Chef Quick Carousel */}
                  {instructors.length > 1 && (
                    <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0">
                        Chọn Bếp Trưởng:
                      </span>
                      {instructors.map(chef => (
                        <button
                          key={chef.id}
                          onClick={() => setSelectedHeroChefId(chef.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                            featuredChef.id === chef.id
                              ? 'bg-red-700 text-white shadow-xs scale-105'
                              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          <img
                            src={chef.avatar}
                            alt={chef.name}
                            referrerPolicy="no-referrer"
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

      {/* DYNAMIC INSTRUCTOR SECTIONS */}
      {instructors.map((chef, idx) => {
        const chefCourses = courses.filter(c => c.instructorId === chef.id);
        const groups = (chef.courseGroups && chef.courseGroups.length > 0)
          ? chef.courseGroups
          : ['KHÓA HỌC ONLINE MỞ QUÁN'];
        const groupedCourses = groups.map((groupName, gIdx) => {
          const normalized = groupName.trim().toLowerCase();
          const matched = chefCourses.filter(c => {
            const cGroup = (c.courseGroup || '').trim().toLowerCase();
            if (!cGroup) return gIdx === 0;
            if (cGroup === normalized) return true;
            if (gIdx === 0 && !groups.some(g => g.trim().toLowerCase() === cGroup)) return true;
            return false;
          });
          return { groupName, courses: matched };
        });
        const activeGroups = groupedCourses.filter((g, gIdx) => g.courses.length > 0 || (chefCourses.length > 0 && gIdx === 0));
        const isEven = idx % 2 === 0;

        return (
          <section
            key={chef.id}
            id={`chef-section-${chef.id}`}
            className={`py-14 border-b border-stone-200 transition-colors ${
              isEven ? 'bg-[#faf7ef]' : 'bg-[#f6f3ea]'
            }`}
          >
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
              {/* Chef Header Profile */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 pb-6 border-b border-stone-200/80 gap-6">
                <div className="flex items-start gap-4">
                  <img
                    src={chef.avatar}
                    alt={chef.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-[#0e4a38]/20 shadow-xs shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#0e4a38]">
                      <span>{chef.badge || chef.specialty || 'CHUYÊN GIA ẨM THỰC'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-stone-500 tabular-nums">{chefCourses.length} khóa học</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight uppercase">
                      {chef.name}
                    </h2>
                    <p className="text-xs text-stone-600 font-medium">
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
                    <div className="flex items-center gap-3 text-xs text-stone-600 font-semibold pt-0.5">
                      <span className="flex items-center gap-1 text-[#0e4a38]">
                        <MessageCircle className="w-3.5 h-3.5" />
                        Zalo/Hotline hỗ trợ: <strong className="text-stone-900 font-mono tabular-nums">{chef.phone || chef.zalo}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Groups (Per Instructor) */}
              {chefCourses.length > 0 ? (
                <div className="space-y-14">
                  {activeGroups.map(({ groupName, courses: groupCourses }) => {
                    const limitKey = `${chef.id}::${groupName}`;
                    const currentLimit = visibleLimits[limitKey] || 24;
                    const visibleCourses = groupCourses.slice(0, currentLimit);
                    const remainingCount = Math.max(0, groupCourses.length - currentLimit);

                    return (
                      <div key={limitKey}>
                        {/* Centered Group Heading matching screenshot */}
                        <div className="text-center mb-8">
                          <h3 className="text-xl sm:text-2xl font-bold text-[#0e4a38] uppercase tracking-wide inline-block">
                            {groupName}
                          </h3>
                          <div className="w-64 sm:w-80 h-[2px] bg-[#0e4a38] mx-auto mt-2.5 mb-2" />
                          <p className="text-xs sm:text-[13px] text-stone-600">
                            (Nhấn vào hình ảnh để xem nội dung giới thiệu khoá học)
                          </p>
                        </div>

                        {/* Course Grid (6 Columns Desktop, Max 24 Courses Initial) */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
                          {visibleCourses.map((course) => {
                            const inCart = cartCourseIds.includes(course.id);
                            const cleanTitle = course.title.split(' - ')[0];

                            return (
                              <article
                                key={course.id}
                                className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col group"
                              >
                                {/* Square Clickable Image */}
                                <button
                                  type="button"
                                  onClick={() => onSelectCourse(course)}
                                  className="relative aspect-square w-full overflow-hidden bg-stone-100 cursor-pointer block text-left"
                                  title={`Xem chi tiết: ${course.title}`}
                                >
                                  <CourseCardThumbnail
                                    src={course.thumbnail}
                                    alt={cleanTitle}
                                  />
                                </button>

                                {/* Card Info & Actions */}
                                <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between gap-2 bg-white">
                                  <div className="space-y-1.5">
                                    <h4
                                      onClick={() => onSelectCourse(course)}
                                      className="text-[12.5px] sm:text-[13px] font-semibold text-stone-800 group-hover:text-[#0e4a38] leading-snug line-clamp-2 min-h-[2.3rem] uppercase cursor-pointer transition-colors"
                                      title={course.title}
                                    >
                                      {cleanTitle}
                                    </h4>

                                    <div className="flex items-baseline gap-1.5 flex-wrap">
                                      <span className="text-[13.5px] font-bold text-[#dc2626] tabular-nums">
                                        {formatPriceVnd(course.discountPrice)} <span className="underline decoration-1 underline-offset-2">₫</span>
                                      </span>
                                    </div>
                                  </div>

                                  {/* MUA NGAY & THÊM GIỎ */}
                                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => onBuyNow(course)}
                                      className="py-1.5 px-1 bg-[#0e4a38] hover:bg-[#093628] text-white font-bold text-[10.5px] sm:text-[11px] rounded-[5px] uppercase tracking-tight whitespace-nowrap cursor-pointer transition-colors text-center"
                                    >
                                      MUA NGAY
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (inCart && onOpenCart) {
                                          onOpenCart();
                                        } else {
                                          onAddToCart(course);
                                        }
                                      }}
                                      className={`py-1.5 px-1 text-white font-bold text-[10.5px] sm:text-[11px] rounded-[5px] uppercase tracking-tight whitespace-nowrap cursor-pointer transition-colors text-center ${
                                        inCart
                                          ? 'bg-emerald-700 hover:bg-emerald-800'
                                          : 'bg-[#0e4a38] hover:bg-[#093628]'
                                      }`}
                                      title={inCart ? 'Đã có trong giỏ hàng - Nhấn để mở giỏ' : 'Thêm khóa học vào giỏ hàng'}
                                    >
                                      {inCart ? 'ĐÃ THÊM ✓' : 'THÊM GIỎ'}
                                    </button>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>

                        {/* Centered Yellow "XEM THÊM >" Button */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleExpandChefCourses(limitKey, groupCourses.length)}
                            className="px-8 py-2.5 bg-[#f6c445] hover:bg-[#eab308] text-stone-950 font-bold text-xs sm:text-[13px] rounded-full shadow-xs hover:shadow transition-all inline-flex items-center gap-1.5 cursor-pointer uppercase whitespace-nowrap"
                          >
                            <span>
                              {remainingCount > 0
                                ? `XEM THÊM (${remainingCount} KHÓA)`
                                : 'XEM THÊM'}
                            </span>
                            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                          </button>

                          {currentLimit > 24 && (
                            <button
                              type="button"
                              onClick={() => setVisibleLimits(prev => ({ ...prev, [limitKey]: 24 }))}
                              className="text-xs font-bold text-stone-600 hover:text-stone-900 underline cursor-pointer px-3 py-1"
                            >
                              Thu gọn về 24 khóa
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0e4a38] uppercase tracking-wide inline-block">
                      {groups[0]}
                    </h3>
                    <div className="w-64 sm:w-80 h-[2px] bg-[#0e4a38] mx-auto mt-2.5 mb-2" />
                    <p className="text-xs sm:text-[13px] text-stone-600">
                      (Nhấn vào hình ảnh để xem nội dung giới thiệu khoá học)
                    </p>
                  </div>
                  {/* Empty state when instructor has no courses yet */}
                <div className="bg-white border border-stone-200 rounded-2xl p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-4 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-[#0e4a38]/10 text-[#0e4a38] flex items-center justify-center mx-auto">
                    <ChefHat className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-stone-900 text-base">
                      Khóa học của Bếp trưởng {chef.name} đang được chuẩn bị
                    </h4>
                    <p className="text-xs text-stone-500 leading-relaxed max-w-md mx-auto">
                      {chef.name} đang hoàn thiện giáo trình chi tiết, quay video bài giảng thực tế và định lượng gram chuẩn vị. Hãy đăng ký nhận thông báo sớm nhất ngay khi khóa học được phát hành!
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => onSelectTrial()}
                      className="px-5 py-2.5 bg-[#0e4a38] hover:bg-[#093628] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
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
                </>
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
