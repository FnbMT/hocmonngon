import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Phone, Mail, MapPin, Youtube, Facebook, ShieldCheck } from 'lucide-react';
import { HomepageConfig } from '../types';
import { StorageService } from '../services/storage';

interface FooterProps {
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [homeConfig, setHomeConfig] = useState<HomepageConfig>(() => StorageService.getHomepageConfig());

  useEffect(() => {
    const handleUpdate = () => {
      setHomeConfig(StorageService.getHomepageConfig());
    };
    window.addEventListener('homepage_config_updated', handleUpdate);
    return () => window.removeEventListener('homepage_config_updated', handleUpdate);
  }, []);

  const { footer } = homeConfig;

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-serif-heading">
                {footer.brandName || 'Học Món Ngon'}
              </span>
            </div>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              {footer.brandBio}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a 
                href={footer.facebookUrl || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-full bg-stone-800 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href={footer.youtubeUrl || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-full bg-stone-800 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-800/80 text-xs text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{footer.securityBadge || 'Bảo mật SSL 256-bit'}</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Khám Phá
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-red-400 transition-colors">
                  Tất cả khóa học
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog', { category: 'Mở quán kinh doanh' })} className="hover:text-red-400 transition-colors">
                  Khóa học mở quán
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog', { category: 'Lươn Xứ Nghệ' })} className="hover:text-red-400 transition-colors">
                  Lươn Xứ Nghệ
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog', { category: 'Bánh Canh' })} className="hover:text-red-400 transition-colors">
                  Bánh Âu & Croissant
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('trial')} className="hover:text-red-400 transition-colors font-medium text-amber-400">
                  Đăng ký học thử 0đ
                </button>
              </li>
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Về Chúng Tôi
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li><a href="#" className="hover:text-white transition-colors">Đội ngũ giảng viên</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Câu chuyện thương hiệu</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cam kết hoàn tiền</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Hỗ Trợ & Liên Hệ
            </h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Hotline: {footer.hotline || '0988 409 798 / 1900 8888'}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{footer.email || 'hocmonngon@gmail.com'}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{footer.address || '19 Lý Thường Kiệt, TP. Vinh & Hà Nội'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>{footer.copyrightText || '© 2026 Học Món Ngon. Tất cả các quyền được bảo lưu.'}</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:underline">Điều khoản dịch vụ</a>
            <a href="#" className="hover:underline">Chính sách bảo mật</a>
            <a href="#" className="hover:underline">Hỗ trợ học viên</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
