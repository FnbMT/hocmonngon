import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Star,
  Users,
  CheckCircle2
} from 'lucide-react';
import { Student } from '../types';
import { StorageService } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: Student) => void;
  students: Student[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  students
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const cleanId = identifier.trim().toLowerCase();

    // Check if logging in with Admin credentials (only in login mode)
    if (mode === 'login' && (cleanId === 'admin@hocmonngon.vn' || cleanId === 'admin')) {
      if (password && password !== '123456' && password !== 'admin') {
        setAuthError('Mật khẩu Quản trị viên chưa chính xác (mặc định: 123456)');
        return;
      }
      const adminUser: Student = {
        id: 'admin-master',
        name: 'Quản Trị Viên Hệ Thống',
        email: 'admin@hocmonngon.vn',
        phone: '0988409798',
        role: 'admin',
        registeredAt: '2025-01-01'
      };
      StorageService.setCurrentUser(adminUser);
      onLoginSuccess(adminUser);
      onClose();
      return;
    }

    // Check if logging in with Instructor credentials (username, email, or phone)
    if (mode === 'login') {
      const instructorCandidate = StorageService.findInstructorByCredentials(cleanId);
      if (instructorCandidate) {
        if (instructorCandidate.password && password && instructorCandidate.password !== password) {
          setAuthError(`Mật khẩu cho Giảng viên "${instructorCandidate.name}" chưa chính xác!`);
          return;
        }
        const instructorUser: Student = {
          id: `instructor-user-${instructorCandidate.id}`,
          name: instructorCandidate.name,
          email: instructorCandidate.email || `${instructorCandidate.username || instructorCandidate.id}@hocmonngon.vn`,
          phone: instructorCandidate.phone || '',
          avatar: instructorCandidate.avatar,
          role: 'instructor',
          instructorId: instructorCandidate.id,
          registeredAt: '2025-01-01'
        };
        StorageService.setCurrentUser(instructorUser);
        onLoginSuccess(instructorUser);
        onClose();
        return;
      }

      const found = students.find(
        s => s.email.toLowerCase() === cleanId || s.phone === cleanId
      );
      if (found) {
        StorageService.setCurrentUser(found);
        onLoginSuccess(found);
      } else {
        // Log in / create session as student
        const newStudent: Student = {
          id: 'student-' + Date.now(),
          name: identifier.split('@')[0] || 'Học viên',
          email: identifier.includes('@') ? identifier.trim() : `${identifier.trim()}@hocmonngon.vn`,
          phone: identifier.includes('@') ? '0912345678' : identifier.trim(),
          role: 'student',
          registeredAt: new Date().toISOString().split('T')[0]
        };
        StorageService.addStudent(newStudent);
        StorageService.setCurrentUser(newStudent);
        onLoginSuccess(newStudent);
      }
      onClose();
    } else {
      // Đăng ký tài khoản mới: BẮT BUỘC LUÔN LÀ HỌC VIÊN
      const newStudent: Student = {
        id: 'student-' + Date.now(),
        name: name.trim() || 'Học viên mới',
        email: identifier.includes('@') ? identifier.trim() : `${identifier.trim()}@gmail.com`,
        phone: identifier.includes('@') ? '0988776655' : identifier.trim(),
        role: 'student',
        registeredAt: new Date().toISOString().split('T')[0]
      };
      StorageService.addStudent(newStudent);
      StorageService.setCurrentUser(newStudent);
      onLoginSuccess(newStudent);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full border border-stone-200 grid grid-cols-1 md:grid-cols-12 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Brand Visual Banner matching Image 7 */}
        <div className="hidden md:flex md:col-span-5 relative bg-stone-900 text-white flex-col justify-between p-8 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80"
            alt="Đầu bếp Học Món Ngon"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />

          {/* Top badges matching Image 7 */}
          <div className="relative z-10 space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-red-700 text-white text-[10px] font-black uppercase tracking-wider">
              NỀN TẢNG HỌC NẤU ĂN #1
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
              <span>★ 4.9 / 5.0</span>
              <span className="text-stone-300">(12K+ đánh giá)</span>
            </div>
          </div>

          {/* Bottom quote matching Image 7 */}
          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl font-black leading-snug tracking-tight">
              Học Nấu Ăn Không Chỉ Là Công Thức, Đó Là Đam Mê & Nghệ Thuật
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Truy cập không giới hạn vào các khóa học thực chiến từ những bếp trưởng hàng đầu Việt Nam.
            </p>

            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="flex -space-x-2">
                <img className="w-7 h-7 rounded-full border-2 border-stone-900 object-cover" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80" alt="Học viên" />
                <img className="w-7 h-7 rounded-full border-2 border-stone-900 object-cover" src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&q=80" alt="Học viên" />
                <img className="w-7 h-7 rounded-full border-2 border-stone-900 object-cover" src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80" alt="Học viên" />
              </div>
              <div className="text-[10px] text-stone-200 font-semibold leading-tight">
                <p>Hơn 28,000+ học viên đang học mỗi ngày</p>
                <p className="text-amber-300">Hỗ trợ giải đáp công thức trực tiếp 1-1</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Normal Login / Register matching Image 7 */}
        <div className="col-span-12 md:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Standard Mode switch tabs matching Image 7 */}
            <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-bold text-stone-600 max-w-xs">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 rounded-lg transition-all ${mode === 'login' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'}`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2 rounded-lg transition-all ${mode === 'register' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'}`}
              >
                Đăng ký tài khoản mới
              </button>
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900">
                {mode === 'login' ? 'Đăng Nhập Vào Học Ngay' : 'Đăng Ký Tài Khoản Học Viên'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Nhập thông tin tài khoản hoặc sử dụng đăng nhập nhanh
              </p>
            </div>

            {/* Social Logins matching Image 7 */}
            <div className="grid grid-cols-4 gap-2">
              <button 
                type="button"
                onClick={() => {
                  onLoginSuccess(students[0]);
                  onClose();
                }}
                className="py-2.5 px-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-[11px] font-bold text-stone-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="text-red-600 font-bold">G</span> Google
              </button>
              <button 
                type="button"
                onClick={() => {
                  onLoginSuccess(students[0]);
                  onClose();
                }}
                className="py-2.5 px-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-[11px] font-bold text-stone-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="text-blue-600 font-bold">f</span> Facebook
              </button>
              <button 
                type="button"
                onClick={() => {
                  onLoginSuccess(students[0]);
                  onClose();
                }}
                className="py-2.5 px-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-[11px] font-bold text-stone-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                Apple
              </button>
              <button 
                type="button"
                onClick={() => {
                  onLoginSuccess(students[0]);
                  onClose();
                }}
                className="py-2.5 px-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-[11px] font-bold text-blue-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                Zalo
              </button>
            </div>

            <div className="relative text-center my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] text-stone-400 font-medium">
                Hoặc tiếp tục với tài khoản
              </span>
            </div>

            {/* Auth Error Banner */}
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-bold flex items-center justify-between">
                <span>{authError}</span>
                <button 
                  type="button" 
                  onClick={() => setAuthError(null)} 
                  className="p-1 hover:bg-red-100 rounded text-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Input Form matching Image 7 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Số điện thoại hoặc Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="vd: 0912345678 hoặc email@domain.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-stone-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-red-700 focus:ring-red-600"
                  />
                  <span>Ghi nhớ đăng nhập trên thiết bị này</span>
                </label>
                <a href="#" className="font-semibold text-stone-700 hover:text-red-700">
                  Quên mật khẩu?
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-red-700 hover:bg-red-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{mode === 'login' ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản Học Viên'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {mode === 'login' && (
                <div className="pt-2 text-center space-y-1.5 border-t border-stone-100 mt-2">
                  <p className="text-[11px] text-stone-500 font-semibold">Tài khoản demo kiểm thử nhanh:</p>
                  <div className="flex flex-wrap justify-center gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        setIdentifier('cheftuan');
                        setPassword('123456');
                      }}
                      className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold transition-colors cursor-pointer"
                    >
                      Giảng viên: Chef Tuấn (cheftuan / 123456)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIdentifier('chefdong');
                        setPassword('123456');
                      }}
                      className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold transition-colors cursor-pointer"
                    >
                      Giảng viên: Bếp trưởng Đông (chefdong / 123456)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIdentifier('admin');
                        setPassword('123456');
                      }}
                      className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 font-bold transition-colors cursor-pointer"
                    >
                      Quản trị viên (admin / 123456)
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
