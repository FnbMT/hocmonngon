import React, { useState, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  Clock, 
  BarChart, 
  Star, 
  ChevronRight, 
  CheckCircle2, 
  SlidersHorizontal,
  Flame,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Course, Instructor } from '../types';
import { StorageService } from '../services/storage';

interface CourseCatalogProps {
  courses: Course[];
  instructors: Instructor[];
  selectedChefId?: string;
  initialCategory?: string;
  initialSearch?: string;
  onSelectCourse: (course: Course) => void;
  onSelectTrial: (courseId: string) => void;
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  courses,
  instructors,
  selectedChefId,
  initialCategory,
  initialSearch,
  onSelectCourse,
  onSelectTrial,
  onNavigate
}) => {
  const [activeChefId, setActiveChefId] = useState<string | null>(selectedChefId || null);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  // Find active chef details if selected
  const activeChef = useMemo(() => {
    if (!activeChefId) return null;
    return instructors.find(i => i.id === activeChefId) || null;
  }, [activeChefId, instructors]);

  // Filtered & sorted courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Filter by chef
      if (activeChefId && course.instructorId !== activeChefId) {
        return false;
      }
      // Filter by category
      if (activeCategory !== 'Tất cả' && course.category !== activeCategory) {
        return false;
      }
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = course.title.toLowerCase().includes(query);
        const matchChef = course.instructorName.toLowerCase().includes(query);
        const matchDesc = course.shortDescription.toLowerCase().includes(query);
        if (!matchTitle && !matchChef && !matchDesc) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.discountPrice - b.discountPrice;
      if (sortBy === 'price-high') return b.discountPrice - a.discountPrice;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.studentCount || 0) - (a.studentCount || 0); // popular
    });
  }, [courses, activeChefId, activeCategory, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / itemsPerPage));
  const currentCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  return (
    <div className="min-h-screen bg-[#faf9f6] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb matching Image 11 */}
        <nav className="flex items-center gap-2 text-xs text-stone-500">
          <button onClick={() => onNavigate('home')} className="hover:text-red-700">Trang chủ</button>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <button onClick={() => { setActiveChefId(null); setActiveCategory('Tất cả'); }} className="hover:text-red-700">Danh mục khóa học</button>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className="font-semibold text-stone-900">Tất cả khóa học</span>
        </nav>

        {/* Page Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Tất Cả Khóa Học Nấu Ăn Cùng Đội Ngũ Đầu Bếp
          </h1>
          <p className="text-sm text-stone-600">
            Khám phá hơn 30+ khóa học thực chiến từ cơ bản đến mở quán kinh doanh, phân loại chi tiết theo từng chuyên gia ẩm thực.
          </p>
        </div>

        {/* Instructor Filter Pills Carousel matching Image 11 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveChefId(null)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeChefId === null
                ? 'bg-red-700 text-white shadow-sm'
                : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
            }`}
          >
            Tất cả giảng viên <span className="opacity-75 ml-1">28</span>
          </button>

          {instructors.map(chef => (
            <button
              key={chef.id}
              onClick={() => setActiveChefId(chef.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeChefId === chef.id
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
              }`}
            >
              {chef.name} - {chef.specialty.split(',')[0]} <span className="opacity-75 ml-1">{chef.courseCount}</span>
            </button>
          ))}
        </div>

        {/* Selected Instructor Banner matching Image 11 */}
        {activeChef && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={activeChef.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80'}
                  alt={activeChef.name}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-red-100"
                />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">
                  Đang chọn lọc giảng viên
                </span>
                <h2 className="text-xl font-black text-stone-900">
                  {activeChef.name} - {activeChef.title}
                </h2>
                <p className="text-xs text-stone-500">
                  {activeChef.specialty}
                </p>
                <div className="flex items-center gap-4 text-xs text-stone-600 font-semibold pt-1">
                  <span>📖 {activeChef.courseCount} khóa học</span>
                  <span>👥 {activeChef.studentCount.toLocaleString()}+ học viên</span>
                  <span className="text-amber-600">★ {activeChef.rating} đánh giá</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveChefId(null)}
              className="text-xs font-bold text-red-700 hover:underline shrink-0"
            >
              Xem toàn bộ tiểu sử giảng viên →
            </button>
          </div>
        )}

        {/* Category Pills & Search & Sort Bar matching Image 11 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['Tất cả', ...StorageService.getCategories()].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-red-700 text-white shadow-sm'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <input
                type="text"
                placeholder="Tìm kiếm tên món, nguyên liệu, khóa học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-xs pl-8 pr-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-red-600 shadow-sm"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white text-xs font-semibold px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-red-600 shadow-sm text-stone-700"
            >
              <option value="popular">Phổ biến nhất</option>
              <option value="price-low">Giá: Thấp đến cao</option>
              <option value="price-high">Giá: Cao đến thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>
          </div>
        </div>

        {/* Courses Grid matching Image 11 */}
        {currentCourses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 space-y-3">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-bold text-stone-800 text-lg">Không tìm thấy khóa học nào phù hợp</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Hãy thử tìm với từ khóa khác hoặc xóa bộ lọc danh mục hiện tại.
            </p>
            <button
              onClick={() => { setActiveCategory('Tất cả'); setActiveChefId(null); setSearchQuery(''); }}
              className="px-4 py-2 bg-red-700 text-white text-xs font-bold rounded-lg shadow cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCourses.map(course => {
              const totalLessons = course.chapters.reduce((acc, c) => acc + c.lessons.length, 0) || 16;
              const hasTrial = course.chapters.some(c => c.lessons.some(l => l.isFreeTrial));

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Thumbnail & Badges */}
                  <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                    <img
                      src={course.thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {hasTrial && (
                        <span className="px-2.5 py-1 rounded bg-red-700 text-white text-[10px] font-bold shadow-md">
                          Có học thử
                        </span>
                      )}
                      {course.badge && course.badge !== 'none' ? (
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold text-white shadow-md ${
                          course.badgeColor === 'dark' ? 'bg-stone-900' :
                          course.badgeColor === 'amber' ? 'bg-amber-600' :
                          course.badgeColor === 'emerald' ? 'bg-emerald-700' :
                          course.badgeColor === 'purple' ? 'bg-purple-700' :
                          course.badgeColor === 'blue' ? 'bg-blue-700' :
                          'bg-red-700'
                        }`}>
                          {course.badge}
                        </span>
                      ) : (course.tag && course.tag !== 'Có học thử' && (
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold text-white shadow-md ${
                          course.tag === 'Bán chạy' ? 'bg-amber-600' : 'bg-stone-900'
                        }`}>
                          {course.tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3
                        onClick={() => onSelectCourse(course)}
                        className="font-black text-base text-stone-900 group-hover:text-red-700 transition-colors line-clamp-1 cursor-pointer"
                      >
                        {course.title.split(' - ')[0]}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-stone-600">
                        <img
                          src={course.instructorAvatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80'}
                          alt={course.instructorName}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-semibold text-stone-800">{course.instructorName}</span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-stone-500 pt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <BookOpen className="w-3 h-3 text-stone-400" />
                          {totalLessons} bài
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {course.durationHours} giờ
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-amber-700">
                          <BarChart className="w-3 h-3 text-amber-500" />
                          {course.level}
                        </span>
                      </div>
                    </div>

                    {/* Pricing & Action Buttons matching Image 11 */}
                    <div className="pt-4 mt-4 border-t border-stone-100">
                      <div className="flex items-baseline justify-between mb-3">
                        <span className="text-base font-black text-red-700">
                          {formatPrice(course.discountPrice)}
                        </span>
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
                          className="py-2 px-3 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-sm transition-colors cursor-pointer text-center"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination matching Image 11 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="w-9 h-9 rounded-lg border border-stone-200 bg-white text-stone-600 disabled:opacity-40 flex items-center justify-center text-xs font-bold"
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                  currentPage === page
                    ? 'bg-red-700 text-white shadow-sm'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="w-9 h-9 rounded-lg border border-stone-200 bg-white text-stone-600 disabled:opacity-40 flex items-center justify-center text-xs font-bold"
            >
              &gt;
            </button>
          </div>
        )}

        {/* Consultation Callout Banner matching Image 11 bottom */}
        <div className="rounded-2xl bg-red-700 text-white p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              Bạn muốn mở quán nhưng chưa biết chọn thực đơn nào?
            </h3>
            <p className="text-red-100 text-sm max-w-xl">
              Nhận tư vấn trực tiếp 1-1 từ đội ngũ đầu bếp giàu kinh nghiệm để tối ưu menu và chi phí đầu tư.
            </p>
          </div>

          <button
            onClick={() => onNavigate('trial')}
            className="px-6 py-3.5 bg-white text-stone-900 hover:bg-stone-50 font-black text-sm rounded-xl shadow-lg shrink-0 cursor-pointer transition-transform hover:scale-102"
          >
            Nhận tư vấn miễn phí từ chuyên gia
          </button>
        </div>
      </div>
    </div>
  );
};
