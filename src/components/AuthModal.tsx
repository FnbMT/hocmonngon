import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  ArrowRight
} from 'lucide-react';
import { Student } from '../types';
import { StorageService } from '../services/storage';
import { AuthService } from '../services/authService';
import { hashPassword, isHashedPassword, verifyPassword } from '../utils/passwordHash';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const cleanId = identifier.trim().toLowerCase();
      const cleanPhone = cleanId.replace(/[\s.-]/g, '');

      if (!cleanId || !password) {
        setAuthError('Vui lòng nhập đầy đủ thông tin đăng nhập và mật khẩu.');
        return;
      }

      if (mode === 'login') {
        // 1. Kiểm tra đăng nhập Giảng viên (username, email hoặc SĐT)
        const instructorCandidate = StorageService.findInstructorByCredentials(cleanId);
        if (instructorCandidate) {
          const isMatch = await verifyPassword(password, instructorCandidate.password);
          if (!isMatch) {
            setAuthError('Thông tin đăng nhập hoặc mật khẩu chưa chính xác.');
            return;
          }

          // Tự động nâng cấp mật khẩu giảng viên cũ sang định dạng băm SHA-256 + Salt
          if (instructorCandidate.password && !isHashedPassword(instructorCandidate.password)) {
            const upgradedHash = await hashPassword(password);
            StorageService.updateInstructor({
              ...instructorCandidate,
              password: upgradedHash,
            });
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

        // 2. Kiểm tra đăng nhập Học viên
        const foundStudent = students.find(s => {
          if (s.role === 'admin' || s.id === 'admin-master') return false;
          const sEmail = (s.email || '').trim().toLowerCase();
          const sPhone = (s.phone || '').trim().replace(/[\s.-]/g, '');
          return (sEmail && sEmail === cleanId) || (sPhone && sPhone === cleanPhone);
        });

        if (foundStudent) {
          if (foundStudent.passwordHash) {
            const isMatch = await verifyPassword(password, foundStudent.passwordHash);
            if (!isMatch) {
              setAuthError('Thông tin đăng nhập hoặc mật khẩu chưa chính xác.');
              return;
            }
          } else {
            // Học viên cũ đăng ký học thử trước đây chưa đặt mật khẩu -> thiết lập mật khẩu băm lần đầu
            if (password.length < 6) {
              setAuthError('Mật khẩu phải có tối thiểu 6 ký tự.');
              return;
            }
            const firstHash = await hashPassword(password);
            const upgradedStudent: Student = {
              ...foundStudent,
              role: 'student',
              passwordHash: firstHash,
            };
            StorageService.addStudent(upgradedStudent);
            StorageService.setCurrentUser(upgradedStudent);
            onLoginSuccess(upgradedStudent);
            onClose();
            return;
          }

          StorageService.setCurrentUser(foundStudent);
          onLoginSuccess(foundStudent);
          onClose();
          return;
        }

        // 3. Xác thực tài khoản Quản trị viên qua Vercel Serverless API (/api/admin-auth)
        // Không lưu mật khẩu Admin trên trình duyệt; đối chiếu bằng biến môi trường ADMIN_PASSWORD + cấp HttpOnly Cookie
        const adminRes = await AuthService.loginAdmin(cleanId, password);
        if (adminRes.success && adminRes.user) {
          StorageService.setCurrentUser(adminRes.user);
          onLoginSuccess(adminRes.user);
          onClose();
          return;
        }

        setAuthError(adminRes.message || 'Thông tin đăng nhập hoặc mật khẩu chưa chính xác.');
        return;
      } else {
        // Đăng ký tài khoản mới: BẮT BUỘC LUÔN LÀ HỌC VIÊN & BĂM MẬT KHẨU
        if (password.length < 6) {
          setAuthError('Mật khẩu phải có tối thiểu 6 ký tự để đảm bảo an toàn.');
          return;
        }

        if (cleanId === 'admin' || cleanId === 'admin@hocmonngon.vn') {
          setAuthError('Tên đăng nhập này không khả dụng. Vui lòng chọn Email hoặc Số điện thoại khác.');
          return;
        }

        const alreadyExists = students.some(s => {
          const sEmail = (s.email || '').trim().toLowerCase();
          const sPhone = (s.phone || '').trim().replace(/[\s.-]/g, '');
          return (sEmail && sEmail === cleanId) || (sPhone && sPhone === cleanPhone);
        });

        if (alreadyExists) {
          setAuthError('Email hoặc Số điện thoại này đã được đăng ký. Vui lòng chuyển sang tab Đăng nhập.');
          return;
        }

        const hashedPassword = await hashPassword(password);
        const newStudent: Student = {
          id: 'student-' + Date.now(),
          name: name.trim() || 'Học viên mới',
          email: identifier.includes('@') ? identifier.trim().toLowerCase() : `${cleanPhone}@hocmonngon.vn`,
          phone: identifier.includes('@') ? '' : identifier.trim(),
          role: 'student',
          passwordHash: hashedPassword,
          registeredAt: new Date().toISOString().split('T')[0]
        };
        StorageService.addStudent(newStudent);
        StorageService.setCurrentUser(newStudent);
        onLoginSuccess(newStudent);
        onClose();
      }
    } finally {
      setIsSubmitting(false);
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

        {/* Right Side: Clean Login / Register Form */}
        <div className="col-span-12 md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="space-y-6">
            {/* Standard Mode switch tabs */}
            <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-bold text-stone-600 max-w-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${mode === 'login' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'}`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${mode === 'register' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'}`}
              >
                Đăng ký tài khoản mới
              </button>
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900">
                {mode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản Thành Viên'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {mode === 'login'
                  ? 'Dành cho Học viên và Giảng viên truy cập vào hệ thống.'
                  : 'Tạo tài khoản thành viên mới để tham gia các khóa học.'}
              </p>
            </div>

            {/* Auth Error Banner */}
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-bold flex items-center justify-between">
                <span>{authError}</span>
                <button 
                  type="button" 
                  onClick={() => setAuthError(null)} 
                  className="p-1 hover:bg-red-100 rounded text-red-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Input Form */}
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
                  {mode === 'login' ? 'Tên đăng nhập, Số điện thoại hoặc Email' : 'Số điện thoại hoặc Email'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={mode === 'login' ? 'Nhập tên đăng nhập, SĐT hoặc Email' : 'vd: 0912345678 hoặc email@domain.com'}
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

              {mode === 'login' && (
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
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-red-700 hover:bg-red-800 disabled:bg-stone-400 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {isSubmitting
                    ? 'Đang xác thực...'
                    : mode === 'login'
                      ? 'Đăng Nhập Ngay'
                      : 'Tạo Tài Khoản Thành Viên'}
                </span>
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
