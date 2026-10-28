import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Search, 
  Bell, 
  User, 
  ShieldCheck, 
  BookOpen, 
  Sparkles, 
  LogOut, 
  ChefHat, 
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { Student, HomepageConfig } from '../types';
import { StorageService } from '../services/storage';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
  currentUser: Student | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [homeConfig, setHomeConfig] = useState<HomepageConfig>(() => StorageService.getHomepageConfig());

  React.useEffect(() => {
    const handleUpdate = () => {
      setHomeConfig(StorageService.getHomepageConfig());
    };
    window.addEventListener('homepage_config_updated', handleUpdate);
    return () => window.removeEventListener('homepage_config_updated', handleUpdate);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('catalog', { search: searchQuery });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-red-700 flex items-center justify-center text-white shadow-md shadow-red-700/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-red-700 font-serif-heading">
                {homeConfig.header.brandName || 'Học Món Ngon'}
              </span>
              <p className="text-[10px] tracking-wider uppercase font-semibold text-stone-500">
                {homeConfig.header.brandSubtitle || 'Bếp Trưởng Đào Tạo'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-700">
            <button
              onClick={() => onNavigate('home')}
              className={`transition-colors hover:text-red-700 ${currentView === 'home' ? 'text-red-700 font-bold' : ''}`}
            >
              Trang chủ
            </button>
            <button
              onClick={() => onNavigate('catalog')}
              className={`transition-colors hover:text-red-700 ${currentView === 'catalog' ? 'text-red-700 font-bold' : ''}`}
            >
              Khóa học
            </button>
            <button
              onClick={() => onNavigate('catalog', { filterChef: true })}
              className="transition-colors hover:text-red-700"
            >
              Giảng viên
            </button>
            <button
              onClick={() => onNavigate(currentUser ? 'catalog' : 'trial')}
              className={`transition-colors hover:text-red-700 flex items-center gap-1.5 ${currentView === 'trial' ? 'text-red-700 font-bold' : ''}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {currentUser ? 'Học thử các khóa' : 'Đăng ký học thử'}
            </button>
            {currentUser && (
              <button
                onClick={() => onNavigate('dashboard')}
                className={`transition-colors hover:text-red-700 flex items-center gap-1.5 ${currentView === 'dashboard' ? 'text-red-700 font-bold' : ''}`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Khóa học của tôi
              </button>
            )}
          </nav>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Tìm kiếm khóa học, công thức..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-100/90 text-sm pl-9 pr-4 py-2 rounded-full border border-stone-200 focus:outline-none focus:border-red-600 focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
          </form>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                    alt={currentUser.name}
                    className={`w-9 h-9 rounded-full object-cover ring-2 ${
                      currentUser.role === 'admin'
                        ? 'ring-stone-900'
                        : currentUser.role === 'instructor'
                        ? 'ring-amber-500'
                        : 'ring-red-600/30'
                    }`}
                  />
                  <div className="hidden sm:block text-left text-xs leading-tight">
                    <p className="font-bold text-stone-800 line-clamp-1">{currentUser.name}</p>
                    <p className={`text-[10px] font-semibold ${
                      currentUser.role === 'admin' 
                        ? 'text-stone-900 font-bold' 
                        : currentUser.role === 'instructor'
                        ? 'text-amber-700 font-bold'
                        : 'text-red-700'
                    }`}>
                      {currentUser.role === 'admin' ? 'Quản Trị Viên' : currentUser.role === 'instructor' ? 'Giảng Viên' : 'Học viên'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>

                {/* Dropdown menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="font-bold text-sm text-stone-900">{currentUser.name}</p>
                      <p className="text-xs text-stone-500 truncate">{currentUser.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        currentUser.role === 'admin' 
                          ? 'bg-stone-900 text-white' 
                          : currentUser.role === 'instructor'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {currentUser.role === 'admin' ? 'Tài khoản Quản Trị Viên' : currentUser.role === 'instructor' ? 'Tài khoản Giảng Viên' : 'Đang kích hoạt khóa học'}
                      </span>
                    </div>

                    {currentUser.role === 'admin' ? (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-stone-900 font-bold hover:bg-stone-50 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-red-600" />
                        Trang Quản Trị Hệ Thống
                      </button>
                    ) : currentUser.role === 'instructor' ? (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-amber-950 font-bold hover:bg-amber-50 flex items-center gap-2"
                      >
                        <ChefHat className="w-4 h-4 text-amber-600" />
                        Cổng Quản Lý Giảng Viên
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
                      >
                        <BookOpen className="w-4 h-4 text-red-600" />
                        Tiến độ khóa học của tôi
                      </button>
                    )}

                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 text-sm font-semibold text-stone-700 hover:text-red-700 transition-colors"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => onNavigate('trial')}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all"
                >
                  Học thử ngay
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="relative mb-3">
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-100 text-sm pl-9 pr-4 py-2 rounded-lg border border-stone-200"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </form>

          <button
            onClick={() => { setMobileMenuOpen(false); onNavigate('home'); }}
            className="block w-full text-left py-2 font-medium text-stone-700"
          >
            Trang chủ
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onNavigate('catalog'); }}
            className="block w-full text-left py-2 font-medium text-stone-700"
          >
            Tất cả khóa học
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onNavigate(currentUser ? 'catalog' : 'trial'); }}
            className="block w-full text-left py-2 font-medium text-red-700 font-bold"
          >
            {currentUser ? 'Khám phá bài học thử' : 'Đăng ký học thử miễn phí'}
          </button>
          {currentUser && (
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('dashboard'); }}
              className="block w-full text-left py-2 font-medium text-stone-700"
            >
              Khóa học của tôi & Tiến độ
            </button>
          )}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('admin'); }}
              className="block w-full text-left py-2 font-bold text-red-700 border-t pt-3"
            >
              Trang Quản Trị Học Viên (Admin)
            </button>
          )}
        </div>
      )}
    </header>
  );
};
