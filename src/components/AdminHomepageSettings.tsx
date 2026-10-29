import React, { useState } from 'react';
import { 
  Layout, 
  Sparkles, 
  Check, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Pencil, 
  HelpCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Eye, 
  CheckCircle2, 
  Sliders, 
  ArrowRight, 
  ShieldCheck, 
  MessageSquare, 
  Star,
  ExternalLink,
  Compass,
  Info,
  Link2,
  X
} from 'lucide-react';
import { HomepageConfig, FaqItem, FooterLinkItem } from '../types';
import { StorageService, DEFAULT_HOMEPAGE_CONFIG } from '../services/storage';

interface AdminHomepageSettingsProps {
  onNavigateHome?: () => void;
  showToast: (msg: string) => void;
}

export const AdminHomepageSettings: React.FC<AdminHomepageSettingsProps> = ({
  onNavigateHome,
  showToast
}) => {
  const [config, setConfig] = useState<HomepageConfig>(() => StorageService.getHomepageConfig());
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'trial' | 'faq' | 'footer'>('hero');
  const [isSaved, setIsSaved] = useState(false);

  // FAQ management state
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [showAddFaqModal, setShowAddFaqModal] = useState(false);

  // Field option management
  const [newFieldOption, setNewFieldOption] = useState('');

  // Footer Links Management State
  const [newExploreLabel, setNewExploreLabel] = useState('');
  const [newExploreUrl, setNewExploreUrl] = useState('');
  const [newExploreHighlight, setNewExploreHighlight] = useState(false);

  const [newAboutLabel, setNewAboutLabel] = useState('');
  const [newAboutUrl, setNewAboutUrl] = useState('');

  const [newBottomLabel, setNewBottomLabel] = useState('');
  const [newBottomUrl, setNewBottomUrl] = useState('');

  // Footer Explore Handlers
  const handleAddExploreLink = () => {
    if (!newExploreLabel.trim()) {
      showToast('Vui lòng nhập tên liên kết Khám Phá!');
      return;
    }
    const currentLinks = config.footer.exploreColumn?.links || [];
    const updatedLinks = [
      ...currentLinks,
      {
        label: newExploreLabel.trim(),
        url: newExploreUrl.trim() || 'catalog',
        isHighlight: newExploreHighlight
      }
    ];
    const updatedConfig = {
      ...config,
      footer: {
        ...config.footer,
        exploreColumn: {
          ...config.footer.exploreColumn,
          links: updatedLinks
        }
      }
    };
    setConfig(updatedConfig);
    StorageService.saveHomepageConfig(updatedConfig);
    setNewExploreLabel('');
    setNewExploreUrl('');
    setNewExploreHighlight(false);
    showToast('Đã thêm liên kết vào cột Khám Phá!');
  };

  const handleDeleteExploreLink = (idx: number) => {
    const currentLinks = config.footer.exploreColumn?.links || [];
    const updatedLinks = currentLinks.filter((_, i) => i !== idx);
    const updatedConfig = {
      ...config,
      footer: {
        ...config.footer,
        exploreColumn: {
          ...config.footer.exploreColumn,
          links: updatedLinks
        }
      }
    };
    setConfig(updatedConfig);
    StorageService.saveHomepageConfig(updatedConfig);
    showToast('Đã xóa liên kết Khám Phá!');
  };

  const handleUpdateExploreLink = (idx: number, field: 'label' | 'url' | 'isHighlight', value: any) => {
    const currentLinks = [...(config.footer.exploreColumn?.links || [])];
    if (currentLinks[idx]) {
      currentLinks[idx] = { ...currentLinks[idx], [field]: value };
      const updatedConfig = {
        ...config,
        footer: {
          ...config.footer,
          exploreColumn: {
            ...config.footer.exploreColumn,
            links: currentLinks
          }
        }
      };
      setConfig(updatedConfig);
      StorageService.saveHomepageConfig(updatedConfig);
    }
  };

  // Footer About Handlers
  const handleAddAboutLink = () => {
    if (!newAboutLabel.trim()) {
      showToast('Vui lòng nhập tên liên kết Về Chúng Tôi!');
      return;
    }
    const currentLinks = config.footer.aboutColumn?.links || [];
    const updatedLinks = [
      ...currentLinks,
      {
        label: newAboutLabel.trim(),
        url: newAboutUrl.trim() || '#'
      }
    ];
    const updatedConfig = {
      ...config,
      footer: {
        ...config.footer,
        aboutColumn: {
          ...config.footer.aboutColumn,
          links: updatedLinks
        }
      }
    };
    setConfig(updatedConfig);
    StorageService.saveHomepageConfig(updatedConfig);
    setNewAboutLabel('');
    setNewAboutUrl('');
    showToast('Đã thêm liên kết vào cột Về Chúng Tôi!');
  };

  const handleDeleteAboutLink = (idx: number) => {
    const currentLinks = config.footer.aboutColumn?.links || [];
    const updatedLinks = currentLinks.filter((_, i) => i !== idx);
    const updatedConfig = {
      ...config,
      footer: {
        ...config.footer,
        aboutColumn: {
          ...config.footer.aboutColumn,
          links: updatedLinks
        }
      }
    };
    setConfig(updatedConfig);
    StorageService.saveHomepageConfig(updatedConfig);
    showToast('Đã xóa liên kết Về Chúng Tôi!');
  };

  const handleUpdateAboutLink = (idx: number, field: 'label' | 'url', value: string) => {
    const currentLinks = [...(config.footer.aboutColumn?.links || [])];
    if (currentLinks[idx]) {
      currentLinks[idx] = { ...currentLinks[idx], [field]: value };
      const updatedConfig = {
        ...config,
        footer: {
          ...config.footer,
          aboutColumn: {
            ...config.footer.aboutColumn,
            links: currentLinks
          }
        }
      };
      setConfig(updatedConfig);
      StorageService.saveHomepageConfig(updatedConfig);
    }
  };

  // Footer Bottom Links Handlers
  const handleAddBottomLink = () => {
    if (!newBottomLabel.trim()) {
      showToast('Vui lòng nhập tên liên kết đáy trang!');
      return;
    }
    const currentLinks = config.footer.bottomLinks || [];
    const updatedLinks = [
      ...currentLinks,
      {
        label: newBottomLabel.trim(),
        url: newBottomUrl.trim() || '#'
      }
    ];
    const updatedConfig = {
      ...config,
      footer: {
        ...config.footer,
        bottomLinks: updatedLinks
      }
    };
    setConfig(updatedConfig);
    StorageService.saveHomepageConfig(updatedConfig);
    setNewBottomLabel('');
    setNewBottomUrl('');
    showToast('Đã thêm liên kết đáy trang!');
  };

  const handleDeleteBottomLink = (idx: number) => {
    const currentLinks = config.footer.bottomLinks || [];
    const updatedLinks = currentLinks.filter((_, i) => i !== idx);
    const updatedConfig = {
      ...config,
      footer: {
        ...config.footer,
        bottomLinks: updatedLinks
      }
    };
    setConfig(updatedConfig);
    StorageService.saveHomepageConfig(updatedConfig);
    showToast('Đã xóa liên kết đáy trang!');
  };

  // Section-specific saving & feedback state
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [floatingToast, setFloatingToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  const triggerSaveSection = (sectionKey: string, customMessage?: string) => {
    setSavingSection(sectionKey);
    StorageService.saveHomepageConfig(config);

    setTimeout(() => {
      setSavingSection(null);
      setSavedSection(sectionKey);
      const msg = customMessage || 'Đã lưu thành công & Đồng bộ Firestore!';
      setFloatingToast({ message: msg, type: 'success' });
      showToast(msg);

      setTimeout(() => {
        setSavedSection((curr) => (curr === sectionKey ? null : curr));
      }, 4000);

      setTimeout(() => {
        setFloatingToast(null);
      }, 3500);
    }, 300);
  };

  // Handle Save
  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerSaveSection('all', 'Đã lưu toàn bộ cài đặt Trang Chủ & Chân Trang thành công!');
  };

  // Handle Reset Defaults
  const handleResetDefaults = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục toàn bộ giao diện Trang Chủ về nội dung mặc định ban đầu?')) {
      const reset = StorageService.resetHomepageConfig();
      setConfig(reset);
      showToast('Đã khôi phục cài đặt Trang Chủ về mặc định!');
    }
  };

  // Add FAQ Item
  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) {
      showToast('Vui lòng nhập cả câu hỏi và câu trả lời!');
      return;
    }
    const updatedItems = [...config.faq.items, { question: newQuestion.trim(), answer: newAnswer.trim() }];
    const updatedConfig = {
      ...config,
      faq: {
        ...config.faq,
        items: updatedItems
      }
    };
    setConfig(updatedConfig);
    StorageService.saveHomepageConfig(updatedConfig);
    setNewQuestion('');
    setNewAnswer('');
    setShowAddFaqModal(false);
    showToast('Đã thêm câu hỏi thường gặp mới!');
  };

  // Delete FAQ Item
  const handleDeleteFaq = (index: number) => {
    if (confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
      const updatedItems = config.faq.items.filter((_, i) => i !== index);
      const updatedConfig = {
        ...config,
        faq: {
          ...config.faq,
          items: updatedItems
        }
      };
      setConfig(updatedConfig);
      StorageService.saveHomepageConfig(updatedConfig);
      showToast('Đã xóa câu hỏi thường gặp!');
    }
  };

  // Save edited FAQ Item
  const handleSaveEditedFaq = (index: number, question: string, answer: string) => {
    const updatedItems = config.faq.items.map((item, i) => i === index ? { question, answer } : item);
    const updatedConfig = {
      ...config,
      faq: {
        ...config.faq,
        items: updatedItems
      }
    };
    setConfig(updatedConfig);
    StorageService.saveHomepageConfig(updatedConfig);
    setEditingFaqIndex(null);
    showToast('Đã cập nhật câu hỏi!');
  };

  // Add field option for trial
  const handleAddFieldOption = () => {
    if (!newFieldOption.trim()) return;
    const updatedOptions = [...config.trialSection.fieldOptions, newFieldOption.trim()];
    const updatedConfig = {
      ...config,
      trialSection: {
        ...config.trialSection,
        fieldOptions: updatedOptions
      }
    };
    setConfig(updatedConfig);
    StorageService.saveHomepageConfig(updatedConfig);
    setNewFieldOption('');
    showToast('Đã thêm lựa chọn lĩnh vực học!');
  };

  // Remove field option
  const handleRemoveFieldOption = (index: number) => {
    const updatedOptions = config.trialSection.fieldOptions.filter((_, i) => i !== index);
    const updatedConfig = {
      ...config,
      trialSection: {
        ...config.trialSection,
        fieldOptions: updatedOptions
      }
    };
    setConfig(updatedConfig);
    StorageService.saveHomepageConfig(updatedConfig);
    showToast('Đã xóa lĩnh vực học!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 relative">
      {/* Floating Toast Notification - Always visible on screen */}
      {floatingToast && (
        <div className="fixed top-6 right-6 z-50 max-w-md bg-stone-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-emerald-500 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-black text-emerald-400 uppercase text-[10px] tracking-wider">Hệ thống đã cập nhật</p>
            <p className="text-stone-200 text-xs font-semibold mt-0.5">{floatingToast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setFloatingToast(null)}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-stone-900 via-red-950 to-stone-900 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600/30 flex items-center justify-center text-red-400 ring-1 ring-red-500/30 shrink-0">
            <Layout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black">Cài Đặt Trang Chủ & Giao Diện Website</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30">
                Đồng bộ tức thì
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Tùy chỉnh toàn bộ nội dung Header, Banner Hero, Các chỉ số thống kê, Khối đăng ký học miễn phí, Câu hỏi thường gặp (FAQ) và Chân trang (Footer) ngoài Trang Chủ.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Xem Trang Chủ</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-stone-700 cursor-pointer"
            title="Khôi phục lại nội dung ban đầu"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Mặc Định</span>
          </button>

          <button
            type="button"
            onClick={() => triggerSaveSection('top', 'Đã lưu toàn bộ cài đặt Trang Chủ & đồng bộ Firestore!')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
              savedSection === 'top'
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-emerald-900/40'
                : savingSection === 'top'
                ? 'bg-stone-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/40'
            }`}
          >
            {savingSection === 'top' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : savedSection === 'top' ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>✓ Đã Lưu!</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Lưu Thay Đổi</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-stone-200 gap-2 overflow-x-auto text-xs font-bold bg-white p-2 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveSubTab('hero')}
          className={`py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'hero'
              ? 'bg-red-700 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>1. Header & Banner Hero</span>
        </button>

        <button
          onClick={() => setActiveSubTab('trial')}
          className={`py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'trial'
              ? 'bg-red-700 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>2. Mục Đăng Ký Học Miễn Phí</span>
        </button>

        <button
          onClick={() => setActiveSubTab('faq')}
          className={`py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'faq'
              ? 'bg-red-700 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>3. Câu Hỏi Thường Gặp ({config.faq.items.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('footer')}
          className={`py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'footer'
              ? 'bg-red-700 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>4. Footer & Thông Tin Liên Hệ</span>
        </button>
      </div>

      {/* SUBTAB 1: HEADER & HERO BANNER */}
      {activeSubTab === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Settings */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h4 className="text-base font-black text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-700" />
                <span>Cấu Hình Header & Banner Hero</span>
              </h4>
              <span className="text-xs text-stone-500">Hiển thị ngay đầu Trang Chủ</span>
            </div>

            <form onSubmit={handleSaveAll} className="space-y-4 text-xs">
              {/* Brand Header */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tên thương hiệu (Logo Text)</label>
                  <input
                    type="text"
                    value={config.header.brandName}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      header: { ...prev.header, brandName: e.target.value }
                    }))}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Khẩu hiệu phụ (Sub-brand)</label>
                  <input
                    type="text"
                    value={config.header.brandSubtitle}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      header: { ...prev.header, brandSubtitle: e.target.value }
                    }))}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Hotline hiển thị Header</label>
                  <input
                    type="text"
                    value={config.header.hotline}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      header: { ...prev.header, hotline: e.target.value }
                    }))}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl font-bold text-red-700"
                  />
                </div>
              </div>

              {/* Hero Main Content */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Huy hiệu trên đầu tiêu đề (Top Badge)</label>
                  <input
                    type="text"
                    value={config.hero.topBadge}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      hero: { ...prev.hero, topBadge: e.target.value }
                    }))}
                    placeholder="HỌC VIỆN ẨM THỰC HÀNG ĐẦU VIỆT NAM"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold uppercase text-red-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tiêu đề chính Hero (Hero Title)</label>
                  <textarea
                    rows={2}
                    value={config.hero.title}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      hero: { ...prev.hero, title: e.target.value }
                    }))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-black text-stone-900 text-sm leading-snug"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Mô tả phụ Hero (Hero Subtitle)</label>
                  <textarea
                    rows={3}
                    value={config.hero.subtitle}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      hero: { ...prev.hero, subtitle: e.target.value }
                    }))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-600 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Nút kêu gọi 1 (Khám phá)</label>
                    <input
                      type="text"
                      value={config.hero.ctaExploreText}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        hero: { ...prev.hero, ctaExploreText: e.target.value }
                      }))}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Nút kêu gọi 2 (Học thử)</label>
                    <input
                      type="text"
                      value={config.hero.ctaTrialText}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        hero: { ...prev.hero, ctaTrialText: e.target.value }
                      }))}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Stats */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <h5 className="font-black text-stone-900 text-xs">3 Chỉ Số Thống Kê Nổi Bật (Stats)</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                    <label className="block font-bold text-stone-700 text-[11px]">Thống kê 1 (Học viên)</label>
                    <input
                      type="text"
                      value={config.hero.stats.studentsCount}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          stats: { ...prev.hero.stats, studentsCount: e.target.value }
                        }
                      }))}
                      placeholder="15,000+"
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg font-black text-stone-900"
                    />
                    <input
                      type="text"
                      value={config.hero.stats.studentsLabel}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          stats: { ...prev.hero.stats, studentsLabel: e.target.value }
                        }
                      }))}
                      placeholder="Học viên tin tưởng"
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-[11px]"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                    <label className="block font-bold text-stone-700 text-[11px]">Thống kê 2 (Đánh giá)</label>
                    <input
                      type="text"
                      value={config.hero.stats.ratingValue}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          stats: { ...prev.hero.stats, ratingValue: e.target.value }
                        }
                      }))}
                      placeholder="4.9"
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg font-black text-stone-900"
                    />
                    <input
                      type="text"
                      value={config.hero.stats.ratingLabel}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          stats: { ...prev.hero.stats, ratingLabel: e.target.value }
                        }
                      }))}
                      placeholder="Đánh giá trung bình"
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-[11px]"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                    <label className="block font-bold text-stone-700 text-[11px]">Thống kê 3 (Giảng viên)</label>
                    <input
                      type="text"
                      value={config.hero.stats.chefsCount}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          stats: { ...prev.hero.stats, chefsCount: e.target.value }
                        }
                      }))}
                      placeholder="5+"
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg font-black text-stone-900"
                    />
                    <input
                      type="text"
                      value={config.hero.stats.chefsLabel}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          stats: { ...prev.hero.stats, chefsLabel: e.target.value }
                        }
                      }))}
                      placeholder="Đầu bếp lành nghề"
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3">
                <button
                  type="button"
                  onClick={() => triggerSaveSection('hero', 'Đã lưu cài đặt Header & Banner Hero thành công!')}
                  className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${
                    savedSection === 'hero'
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-emerald-200'
                      : savingSection === 'hero'
                      ? 'bg-stone-700 text-white'
                      : 'bg-red-700 hover:bg-red-800 text-white shadow-red-200'
                  }`}
                >
                  {savingSection === 'hero' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang lưu lên Firestore...</span>
                    </>
                  ) : savedSection === 'hero' ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>✓ Đã Lưu Cài Đặt Hero!</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Lưu Cài Đặt Hero</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Live Hero Preview (Matching image_aa2b270e.png) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-red-700" />
                Xem Trước Banner Hero Thực Tế
              </span>
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                Live Preview
              </span>
            </div>

            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-bold uppercase">
                <Sparkles className="w-3 h-3 text-red-700" />
                {config.hero.topBadge}
              </div>

              <h3 className="text-xl font-black text-stone-900 leading-snug">
                {config.hero.title}
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                {config.hero.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-3.5 py-1.5 bg-red-700 text-white font-bold text-xs rounded-lg flex items-center gap-1">
                  {config.hero.ctaExploreText} <ArrowRight className="w-3 h-3" />
                </span>
                <span className="px-3.5 py-1.5 bg-white text-red-700 font-bold text-xs rounded-lg border border-red-700">
                  {config.hero.ctaTrialText}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-stone-200 text-center">
                <div>
                  <p className="text-base font-black text-stone-900">{config.hero.stats.studentsCount}</p>
                  <p className="text-[10px] text-stone-500">{config.hero.stats.studentsLabel}</p>
                </div>
                <div>
                  <p className="text-base font-black text-stone-900 flex items-center justify-center gap-0.5">
                    {config.hero.stats.ratingValue} <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  </p>
                  <p className="text-[10px] text-stone-500">{config.hero.stats.ratingLabel}</p>
                </div>
                <div>
                  <p className="text-base font-black text-stone-900">{config.hero.stats.chefsCount}</p>
                  <p className="text-[10px] text-stone-500">{config.hero.stats.chefsLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: TRIAL REGISTRATION SECTION */}
      {activeSubTab === 'trial' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-6 max-w-4xl">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h4 className="text-base font-black text-stone-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-red-700" />
                <span>Cấu Hình Khối Đăng Ký Học Miễn Phí (Banner Đỏ Trang Chủ)</span>
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">Khối thu hút học viên trải nghiệm thử 0đ trước khi mua khóa học chính thức</p>
            </div>
          </div>

          <form onSubmit={handleSaveAll} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Huy hiệu nhỏ</label>
                <input
                  type="text"
                  value={config.trialSection.badge}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    trialSection: { ...prev.trialSection, badge: e.target.value }
                  }))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold uppercase text-red-700"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Text nút gửi form</label>
                <input
                  type="text"
                  value={config.trialSection.buttonText}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    trialSection: { ...prev.trialSection, buttonText: e.target.value }
                  }))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Tiêu đề khối học thử</label>
              <textarea
                rows={2}
                value={config.trialSection.title}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  trialSection: { ...prev.trialSection, title: e.target.value }
                }))}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-black text-sm text-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Đoạn mô tả quyền lợi</label>
              <textarea
                rows={3}
                value={config.trialSection.subtitle}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  trialSection: { ...prev.trialSection, subtitle: e.target.value }
                }))}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-600 leading-relaxed"
              />
            </div>

            {/* Field Options Management */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <label className="block font-black text-stone-800 text-xs">
                Danh sách lĩnh vực học viên có thể chọn trong dropdown:
              </label>

              <div className="space-y-2">
                {config.trialSection.fieldOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200 text-xs">
                    <span className="font-medium text-stone-800">{opt}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFieldOption(idx)}
                      className="text-stone-400 hover:text-red-700 p-1"
                      title="Xóa lựa chọn này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Thêm lựa chọn lĩnh vực mới (vd: Đồ nướng, Lẩu buffet...)"
                  value={newFieldOption}
                  onChange={(e) => setNewFieldOption(e.target.value)}
                  className="flex-1 p-2 bg-white border border-stone-200 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddFieldOption}
                  className="px-3.5 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3">
              <button
                type="button"
                onClick={() => triggerSaveSection('trial', 'Đã lưu cài đặt Mục Đăng Ký Học Miễn Phí thành công!')}
                className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${
                  savedSection === 'trial'
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-emerald-200'
                    : savingSection === 'trial'
                    ? 'bg-stone-700 text-white'
                    : 'bg-red-700 hover:bg-red-800 text-white shadow-red-200'
                }`}
              >
                {savingSection === 'trial' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang lưu lên Firestore...</span>
                  </>
                ) : savedSection === 'trial' ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>✓ Đã Lưu Mục Đăng Ký!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Lưu Mục Đăng Ký Học Miễn Phí</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB 3: FAQ SECTION (CÂU HỎI THƯỜNG GẶP) */}
      {activeSubTab === 'faq' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <h4 className="text-base font-black text-stone-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-red-700" />
                <span>Cấu Hình Câu Hỏi Thường Gặp (FAQ)</span>
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">Thêm, sửa, xóa các câu hỏi giải đáp thắc mắc cho học viên ngoài Trang Chủ</p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddFaqModal(true)}
              className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Câu Hỏi Mới</span>
            </button>
          </div>

          {/* Heading Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Thẻ tag trên tiêu đề</label>
              <input
                type="text"
                value={config.faq.tag}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  faq: { ...prev.faq, tag: e.target.value }
                }))}
                className="w-full p-2 bg-white border border-stone-200 rounded-xl font-bold uppercase text-red-700"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Tiêu đề mục FAQ</label>
              <input
                type="text"
                value={config.faq.title}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  faq: { ...prev.faq, title: e.target.value }
                }))}
                className="w-full p-2 bg-white border border-stone-200 rounded-xl font-black text-stone-900"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Mô tả phụ</label>
              <input
                type="text"
                value={config.faq.subtitle}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  faq: { ...prev.faq, subtitle: e.target.value }
                }))}
                className="w-full p-2 bg-white border border-stone-200 rounded-xl"
              />
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-3">
            {config.faq.items.map((item, idx) => (
              <div key={idx} className="p-4 bg-white rounded-2xl border border-stone-200 hover:border-stone-300 transition-all space-y-3">
                {editingFaqIndex === idx ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Câu hỏi:</label>
                      <input
                        type="text"
                        defaultValue={item.question}
                        id={`faq-q-${idx}`}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Câu trả lời:</label>
                      <textarea
                        rows={3}
                        defaultValue={item.answer}
                        id={`faq-a-${idx}`}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 leading-relaxed"
                      />
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingFaqIndex(null)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const qEl = document.getElementById(`faq-q-${idx}`) as HTMLInputElement;
                          const aEl = document.getElementById(`faq-a-${idx}`) as HTMLTextAreaElement;
                          if (qEl && aEl) {
                            handleSaveEditedFaq(idx, qEl.value, aEl.value);
                          }
                        }}
                        className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Lưu</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <p className="font-bold text-stone-900 text-sm flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-100 text-red-800 text-[11px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{item.question}</span>
                      </p>
                      <p className="text-xs text-stone-600 leading-relaxed pl-7">
                        {item.answer}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingFaqIndex(idx)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Chỉnh sửa câu hỏi này"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFaq(idx)}
                        className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa câu hỏi này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end pt-3">
            <button
              type="button"
              onClick={() => triggerSaveSection('faq', 'Đã lưu toàn bộ cài đặt câu hỏi thường gặp FAQ thành công!')}
              className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${
                savedSection === 'faq'
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-emerald-200'
                  : savingSection === 'faq'
                  ? 'bg-stone-700 text-white'
                  : 'bg-red-700 hover:bg-red-800 text-white shadow-red-200'
              }`}
            >
              {savingSection === 'faq' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang lưu lên Firestore...</span>
                </>
              ) : savedSection === 'faq' ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>✓ Đã Lưu Cài Đặt FAQ!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Lưu Cài Đặt FAQ</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 4: FOOTER (CHÂN TRANG) */}
      {activeSubTab === 'footer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Footer Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* SECTION 1: Brand Info & Contact */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h4 className="text-base font-black text-stone-900 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-red-700" />
                    <span>1. Thông Tin Thương Hiệu & Chân Trang</span>
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">Mô tả tóm tắt, hotline, email, địa chỉ và mạng xã hội</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Mô tả giới thiệu thương hiệu (Brand Bio)</label>
                  <textarea
                    rows={3}
                    value={config.footer.brandBio}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      footer: { ...prev.footer, brandBio: e.target.value }
                    }))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-red-600" />
                      <span>Hotline hỗ trợ</span>
                    </label>
                    <input
                      type="text"
                      value={config.footer.hotline}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        footer: { ...prev.footer, hotline: e.target.value }
                      }))}
                      placeholder="0988 409 798 / 1900 8888"
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-red-600" />
                      <span>Email liên hệ</span>
                    </label>
                    <input
                      type="text"
                      value={config.footer.email}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        footer: { ...prev.footer, email: e.target.value }
                      }))}
                      placeholder="hocmonngon@gmail.com"
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    <span>Địa chỉ văn phòng / cơ sở đào tạo</span>
                  </label>
                  <input
                    type="text"
                    value={config.footer.address}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      footer: { ...prev.footer, address: e.target.value }
                    }))}
                    placeholder="19 Lý Thường Kiệt, TP. Vinh & Hà Nội"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Facebook URL</label>
                    <input
                      type="text"
                      value={config.footer.facebookUrl}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        footer: { ...prev.footer, facebookUrl: e.target.value }
                      }))}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">YouTube URL</label>
                    <input
                      type="text"
                      value={config.footer.youtubeUrl}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        footer: { ...prev.footer, youtubeUrl: e.target.value }
                      }))}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Zalo Link</label>
                    <input
                      type="text"
                      value={config.footer.zaloUrl}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        footer: { ...prev.footer, zaloUrl: e.target.value }
                      }))}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Dòng bản quyền (Copyright)</label>
                    <input
                      type="text"
                      value={config.footer.copyrightText}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        footer: { ...prev.footer, copyrightText: e.target.value }
                      }))}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Huy hiệu bảo mật</label>
                    <input
                      type="text"
                      value={config.footer.securityBadge}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        footer: { ...prev.footer, securityBadge: e.target.value }
                      }))}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-emerald-700"
                    />
                  </div>
                </div>

                {/* Save Section 1 Button & Feedback */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200">
                  <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Lưu nhanh hotline, email, địa chỉ & thương hiệu</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerSaveSection('section1', 'Đã lưu thông tin thương hiệu, hotline & email thành công!')}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 ${
                      savedSection === 'section1'
                        ? 'bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-400'
                        : savingSection === 'section1'
                        ? 'bg-stone-700 text-white'
                        : 'bg-red-700 hover:bg-red-800 text-white shadow-red-200'
                    }`}
                  >
                    {savingSection === 'section1' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang lưu lên Firestore...</span>
                      </>
                    ) : savedSection === 'section1' ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>✓ Đã Lưu & Đồng Bộ Thành Công!</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Lưu Thông Tin Thương Hiệu & Liên Hệ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 2: Cột KHÁM PHÁ (Explore Column) */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h4 className="text-base font-black text-stone-900 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-600" />
                    <span>2. Tùy Chỉnh Cột: "Khám Phá"</span>
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">Chỉnh sửa tiêu đề cột và danh sách các khóa học / liên kết trong cột Khám Phá</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200">
                  {config.footer.exploreColumn?.links?.length || 0} liên kết
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tiêu đề cột</label>
                  <input
                    type="text"
                    value={config.footer.exploreColumn?.title || 'Khám Phá'}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      footer: {
                        ...prev.footer,
                        exploreColumn: {
                          ...(prev.footer.exploreColumn || { links: [] }),
                          title: e.target.value
                        }
                      }
                    }))}
                    placeholder="Khám Phá"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
                  />
                </div>

                {/* Existing Explore Links List */}
                <div className="space-y-2.5">
                  <label className="block font-bold text-stone-700">Danh sách liên kết hiện tại:</label>
                  <div className="space-y-2">
                    {(config.footer.exploreColumn?.links || []).map((link, idx) => (
                      <div key={idx} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
                        <div className="flex-1 w-full sm:w-auto">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => handleUpdateExploreLink(idx, 'label', e.target.value)}
                            placeholder="Tên liên kết"
                            className="w-full p-2 bg-white border border-stone-200 rounded-xl font-bold text-stone-800 text-xs"
                          />
                        </div>
                        <div className="flex-1 w-full sm:w-auto">
                          <input
                            type="text"
                            value={link.url || ''}
                            onChange={(e) => handleUpdateExploreLink(idx, 'url', e.target.value)}
                            placeholder="Đường dẫn hoặc trang (VD: catalog, trial)"
                            className="w-full p-2 bg-white border border-stone-200 rounded-xl text-stone-600 text-xs font-mono"
                          />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateExploreLink(idx, 'isHighlight', !link.isHighlight)}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              link.isHighlight
                                ? 'bg-amber-400 text-stone-950 shadow-xs'
                                : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                            }`}
                            title="Làm nổi bật chữ màu vàng ở chân trang"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{link.isHighlight ? 'Nổi bật' : 'Chữ thường'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteExploreLink(idx)}
                            className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa liên kết này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add New Explore Link Box */}
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
                  <div className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-amber-700" />
                    <span>Thêm liên kết mới vào cột Khám Phá:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={newExploreLabel}
                      onChange={(e) => setNewExploreLabel(e.target.value)}
                      placeholder="Tên hiển thị (VD: Bánh Âu & Croissant)"
                      className="p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium"
                    />
                    <input
                      type="text"
                      value={newExploreUrl}
                      onChange={(e) => setNewExploreUrl(e.target.value)}
                      placeholder="Đường dẫn (VD: catalog, trial hoặc link web)"
                      className="p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-mono"
                    />
                  </div>

                  {/* Quick Suggestions */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-500 font-bold">Gợi ý nhanh đường dẫn hệ thống:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'Tất cả khóa học', url: 'catalog' },
                        { label: 'Khóa học mở quán', url: 'catalog:category=Mở quán kinh doanh' },
                        { label: 'Lươn Xứ Nghệ', url: 'catalog:category=Lươn Xứ Nghệ' },
                        { label: 'Bánh Âu & Croissant', url: 'catalog:category=Bánh Canh' },
                        { label: 'Đăng ký học thử 0đ', url: 'trial', highlight: true }
                      ].map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => {
                            setNewExploreLabel(sug.label);
                            setNewExploreUrl(sug.url);
                            if (sug.highlight) setNewExploreHighlight(true);
                          }}
                          className="px-2 py-1 bg-white hover:bg-amber-100 border border-stone-200 text-stone-700 text-[10px] rounded-lg transition-colors cursor-pointer"
                        >
                          + {sug.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-stone-700 text-xs font-medium">
                      <input
                        type="checkbox"
                        checked={newExploreHighlight}
                        onChange={(e) => setNewExploreHighlight(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                      />
                      <span>Đánh dấu nổi bật màu vàng cam</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleAddExploreLink}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Liên Kết</span>
                    </button>
                  </div>
                </div>

                {/* Save Section 2 Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200">
                  <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Tự động cập nhật các liên kết cột Khám Phá</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerSaveSection('section2', 'Đã lưu cài đặt cột Khám Phá thành công!')}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 ${
                      savedSection === 'section2'
                        ? 'bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-400'
                        : savingSection === 'section2'
                        ? 'bg-stone-700 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200'
                    }`}
                  >
                    {savingSection === 'section2' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang lưu lên Firestore...</span>
                      </>
                    ) : savedSection === 'section2' ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>✓ Đã Lưu Cột Khám Phá!</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Lưu Cài Đặt Cột Khám Phá</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 3: Cột VỀ CHÚNG TÔI (About Us Column) */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h4 className="text-base font-black text-stone-900 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    <span>3. Tùy Chỉnh Cột: "Về Chúng Tôi"</span>
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">Chỉnh sửa tiêu đề cột và danh sách trang giới thiệu, chính sách, cam kết</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
                  {config.footer.aboutColumn?.links?.length || 0} liên kết
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tiêu đề cột</label>
                  <input
                    type="text"
                    value={config.footer.aboutColumn?.title || 'Về Chúng Tôi'}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      footer: {
                        ...prev.footer,
                        aboutColumn: {
                          ...(prev.footer.aboutColumn || { links: [] }),
                          title: e.target.value
                        }
                      }
                    }))}
                    placeholder="Về Chúng Tôi"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
                  />
                </div>

                {/* Existing About Links List */}
                <div className="space-y-2.5">
                  <label className="block font-bold text-stone-700">Danh sách liên kết hiện tại:</label>
                  <div className="space-y-2">
                    {(config.footer.aboutColumn?.links || []).map((link, idx) => (
                      <div key={idx} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
                        <div className="flex-1 w-full sm:w-auto">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => handleUpdateAboutLink(idx, 'label', e.target.value)}
                            placeholder="Tên liên kết"
                            className="w-full p-2 bg-white border border-stone-200 rounded-xl font-bold text-stone-800 text-xs"
                          />
                        </div>
                        <div className="flex-1 w-full sm:w-auto">
                          <input
                            type="text"
                            value={link.url || ''}
                            onChange={(e) => handleUpdateAboutLink(idx, 'url', e.target.value)}
                            placeholder="Đường dẫn (VD: # hoặc link web)"
                            className="w-full p-2 bg-white border border-stone-200 rounded-xl text-stone-600 text-xs font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteAboutLink(idx)}
                          className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Xóa liên kết này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add New About Link Box */}
                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">
                  <div className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue-700" />
                    <span>Thêm liên kết mới vào cột Về Chúng Tôi:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={newAboutLabel}
                      onChange={(e) => setNewAboutLabel(e.target.value)}
                      placeholder="Tên hiển thị (VD: Câu chuyện thương hiệu)"
                      className="p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium"
                    />
                    <input
                      type="text"
                      value={newAboutUrl}
                      onChange={(e) => setNewAboutUrl(e.target.value)}
                      placeholder="Đường dẫn (VD: # hoặc link web)"
                      className="p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-mono"
                    />
                  </div>

                  {/* Quick Suggestions */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-500 font-bold">Gợi ý nhanh:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'Đội ngũ giảng viên', url: 'catalog:filterChef=true' },
                        { label: 'Câu chuyện thương hiệu', url: '#' },
                        { label: 'Chính sách bảo mật', url: '#' },
                        { label: 'Điều khoản dịch vụ', url: '#' },
                        { label: 'Cam kết hoàn tiền', url: '#' }
                      ].map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => {
                            setNewAboutLabel(sug.label);
                            setNewAboutUrl(sug.url);
                          }}
                          className="px-2 py-1 bg-white hover:bg-blue-100 border border-stone-200 text-stone-700 text-[10px] rounded-lg transition-colors cursor-pointer"
                        >
                          + {sug.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddAboutLink}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Liên Kết</span>
                    </button>
                  </div>
                </div>

                {/* Save Section 3 Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200">
                  <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span>Tự động cập nhật các liên kết cột Về Chúng Tôi</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerSaveSection('section3', 'Đã lưu cài đặt cột Về Chúng Tôi thành công!')}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 ${
                      savedSection === 'section3'
                        ? 'bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-400'
                        : savingSection === 'section3'
                        ? 'bg-stone-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                    }`}
                  >
                    {savingSection === 'section3' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang lưu lên Firestore...</span>
                      </>
                    ) : savedSection === 'section3' ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>✓ Đã Lưu Cột Về Chúng Tôi!</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Lưu Cài Đặt Cột Về Chúng Tôi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 4: Tiêu đề Cột Hỗ Trợ & Liên Kết Đáy Chân Trang */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h4 className="text-base font-black text-stone-900 flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-stone-700" />
                    <span>4. Cột Hỗ Trợ & Liên Kết Đáy Chân Trang</span>
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">Tiêu đề cột liên hệ và các liên kết chính sách ở dòng chân trang</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tiêu đề Cột 4 (Liên hệ)</label>
                  <input
                    type="text"
                    value={config.footer.contactTitle || 'Hỗ Trợ & Liên Hệ'}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      footer: { ...prev.footer, contactTitle: e.target.value }
                    }))}
                    placeholder="Hỗ Trợ & Liên Hệ"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
                  />
                </div>

                {/* Bottom links */}
                <div className="space-y-2">
                  <label className="block font-bold text-stone-700">Các liên kết đáy chân trang (kế bên Copyright):</label>
                  <div className="space-y-2">
                    {(config.footer.bottomLinks || []).map((bLink, bIdx) => (
                      <div key={bIdx} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-bold text-stone-800">{bLink.label}</span>
                          <span className="text-stone-400 font-mono text-[10px]">({bLink.url || '#'})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteBottomLink(bIdx)}
                          className="text-stone-400 hover:text-red-700 p-1 rounded transition-colors cursor-pointer"
                          title="Xóa liên kết"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newBottomLabel}
                      onChange={(e) => setNewBottomLabel(e.target.value)}
                      placeholder="Tên liên kết đáy (VD: Hỗ trợ học viên)"
                      className="p-2 bg-stone-50 border border-stone-200 rounded-xl flex-1 text-xs"
                    />
                    <input
                      type="text"
                      value={newBottomUrl}
                      onChange={(e) => setNewBottomUrl(e.target.value)}
                      placeholder="URL (VD: #)"
                      className="p-2 bg-stone-50 border border-stone-200 rounded-xl w-28 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddBottomLink}
                      className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl cursor-pointer shrink-0"
                    >
                      + Thêm
                    </button>
                  </div>
                </div>

                {/* Save Section 4 Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200">
                  <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-stone-500 animate-pulse"></span>
                    <span>Lưu tiêu đề hỗ trợ & liên kết đáy bản quyền</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerSaveSection('section4', 'Đã lưu cài đặt Cột Hỗ Trợ & Liên Kết Đáy!')}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 ${
                      savedSection === 'section4'
                        ? 'bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-400'
                        : savingSection === 'section4'
                        ? 'bg-stone-700 text-white'
                        : 'bg-stone-800 hover:bg-black text-white shadow-stone-200'
                    }`}
                  >
                    {savingSection === 'section4' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang lưu lên Firestore...</span>
                      </>
                    ) : savedSection === 'section4' ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>✓ Đã Lưu Liên Kết Đáy!</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Lưu Cài Đặt Cột Hỗ Trợ & Đáy Trang</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Save All Footer Button Card */}
            <div className="p-5 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-3xl border border-stone-700 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-white text-xs space-y-1">
                <p className="font-black text-sm flex items-center gap-2 text-white">
                  <Globe className="w-4 h-4 text-red-500" />
                  <span>Lưu Toàn Bộ Cài Đặt Chân Trang (Footer)</span>
                </p>
                <p className="text-stone-300 text-[11px]">
                  Cập nhật tất cả 4 khối chân trang và đồng bộ tức thì lên đám mây Firestore & Vercel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => triggerSaveSection('all', 'Đã lưu toàn bộ cài đặt chân trang Footer & đồng bộ Firestore!')}
                className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 shrink-0 ${
                  savedSection === 'all'
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-emerald-900/50'
                    : savingSection === 'all'
                    ? 'bg-stone-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/50'
                }`}
              >
                {savingSection === 'all' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang lưu & đồng bộ Firestore...</span>
                  </>
                ) : savedSection === 'all' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>✓ Đã Lưu & Đồng Bộ Thành Công!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>LƯU TẤT CẢ CÀI ĐẶT FOOTER</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer Live Preview (Matching Real 4-Column Layout) */}
          <div className="lg:col-span-5 bg-stone-900 text-stone-300 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6 sticky top-6 border border-stone-800">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-xs">
              <span className="font-black text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-red-500" />
                <span>Xem Trước Footer Thực Tế (4 Cột)</span>
              </span>
              <span className="text-[10px] bg-red-600/30 text-red-300 font-bold px-2 py-0.5 rounded border border-red-500/30">
                Live Preview
              </span>
            </div>

            {/* 4 Columns Preview */}
            <div className="space-y-6 text-xs">
              {/* Column 1: Brand Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-sm">
                    🍴
                  </div>
                  <span className="text-lg font-black text-white font-serif-heading">
                    {config.footer.brandName || 'Học Món Ngon'}
                  </span>
                </div>

                <p className="text-[11px] text-stone-400 leading-relaxed">
                  {config.footer.brandBio}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <div className="w-7 h-7 rounded-full bg-stone-800 text-white flex items-center justify-center text-[10px]">
                    f
                  </div>
                  <div className="w-7 h-7 rounded-full bg-stone-800 text-white flex items-center justify-center text-[10px]">
                    ▶
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800 text-[10px] text-emerald-400 font-bold">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>{config.footer.securityBadge || 'Bảo mật SSL 256-bit'}</span>
                  </div>
                </div>
              </div>

              {/* 2 Middle Columns in Grid for Preview */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-800/80">
                {/* Column 2: Khám Phá */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-black text-white uppercase tracking-wider">
                    {config.footer.exploreColumn?.title || 'KHÁM PHÁ'}
                  </h5>
                  <ul className="space-y-1.5 text-[11px] text-stone-400">
                    {(config.footer.exploreColumn?.links || []).map((link, idx) => (
                      <li key={idx} className={link.isHighlight ? 'text-amber-400 font-bold' : 'hover:text-stone-200'}>
                        {link.label}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 3: Về Chúng Tôi */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-black text-white uppercase tracking-wider">
                    {config.footer.aboutColumn?.title || 'VỀ CHÚNG TÔI'}
                  </h5>
                  <ul className="space-y-1.5 text-[11px] text-stone-400">
                    {(config.footer.aboutColumn?.links || []).map((link, idx) => (
                      <li key={idx} className="hover:text-stone-200">
                        {link.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Column 4: Contact Preview */}
              <div className="space-y-2 pt-4 border-t border-stone-800/80">
                <h5 className="text-[11px] font-black text-white uppercase tracking-wider">
                  {config.footer.contactTitle || 'HỖ TRỢ & LIÊN HỆ'}
                </h5>
                <div className="space-y-1.5 text-[11px] text-stone-300">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>Hotline: {config.footer.hotline}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{config.footer.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{config.footer.address}</span>
                  </p>
                </div>
              </div>

              {/* Bottom Copyright & Policy Preview */}
              <div className="pt-4 border-t border-stone-800 flex flex-col gap-2 text-[10px] text-stone-500">
                <span>{config.footer.copyrightText}</span>
                <div className="flex flex-wrap items-center gap-3 text-stone-400">
                  {(config.footer.bottomLinks || []).map((bLink, bIdx) => (
                    <span key={bIdx} className="hover:underline">
                      {bLink.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW FAQ ITEM */}
      {showAddFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-red-700" />
                <span>Thêm Câu Hỏi Thường Gặp Mới</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddFaqModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFaq} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Câu hỏi của học viên <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Học viên có được cấp chứng nhận sau khi hoàn thành khóa không?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Câu trả lời chi tiết <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Nhập câu trả lời rõ ràng, tận tình..."
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFaqModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Thêm Câu Hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
