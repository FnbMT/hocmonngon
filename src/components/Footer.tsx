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

  const handleLinkClick = (url?: string) => {
    if (!url || url === '#') return;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (url.startsWith('catalog')) {
      if (url.includes(':category=')) {
        const cat = decodeURIComponent(url.split(':category=')[1]);
        onNavigate('catalog', { category: cat });
      } else if (url.includes(':filterChef=true')) {
        onNavigate('catalog', { filterChef: true });
      } else {
        onNavigate('catalog');
      }
      return;
    }
    onNavigate(url);
  };

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

          {/* Column 2: Khám Phá */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {footer.exploreColumn?.title || 'Khám Phá'}
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              {(footer.exploreColumn?.links || []).map((link, idx) => (
                <li key={idx}>
                  <button 
                    onClick={() => handleLinkClick(link.url)} 
                    className={`hover:text-red-400 transition-colors text-left cursor-pointer ${
                      link.isHighlight ? 'text-amber-400 font-semibold' : ''
                    }`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Về Chúng Tôi */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {footer.aboutColumn?.title || 'Về Chúng Tôi'}
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              {(footer.aboutColumn?.links || []).map((link, idx) => (
                <li key={idx}>
                  <button 
                    onClick={() => handleLinkClick(link.url)} 
                    className={`hover:text-white transition-colors text-left cursor-pointer ${
                      link.isHighlight ? 'text-amber-400 font-semibold' : ''
                    }`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {footer.contactTitle || 'Hỗ Trợ & Liên Hệ'}
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
          <div className="flex flex-wrap items-center gap-6">
            {(footer.bottomLinks || [
              { label: 'Điều khoản dịch vụ', url: '#' },
              { label: 'Chính sách bảo mật', url: '#' },
              { label: 'Hỗ trợ học viên', url: '#' }
            ]).map((link, idx) => (
              <button 
                key={idx} 
                onClick={() => handleLinkClick(link.url)} 
                className="hover:underline cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
