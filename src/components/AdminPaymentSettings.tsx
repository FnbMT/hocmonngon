import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Landmark, 
  Check, 
  Copy, 
  RefreshCw, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink, 
  QrCode, 
  Search, 
  Trash2, 
  Eye, 
  EyeOff, 
  Send, 
  Clock, 
  BookOpen, 
  DollarSign 
} from 'lucide-react';
import { Course, PaymentBankConfig, SePayConfig, SePayTransaction } from '../types';
import { PaymentService, POPULAR_VIETNAM_BANKS } from '../services/paymentService';
import { StorageService } from '../services/storage';

interface AdminPaymentSettingsProps {
  courses: Course[];
  onCourseUpdated?: () => void;
  showToast: (msg: string) => void;
}

export const AdminPaymentSettings: React.FC<AdminPaymentSettingsProps> = ({
  courses,
  onCourseUpdated,
  showToast
}) => {
  // Bank config state
  const [bankConfig, setBankConfig] = useState<PaymentBankConfig>(() => PaymentService.getBankConfig());
  const [selectedBankShortName, setSelectedBankShortName] = useState(bankConfig.bankShortName);
  const [bankSavedNotification, setBankSavedNotification] = useState(false);

  // SePay config state
  const [sepayConfig, setSepayConfig] = useState<SePayConfig>(() => PaymentService.getSePayConfig());
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhookToken, setShowWebhookToken] = useState(false);
  const [sepaySavedNotification, setSepaySavedNotification] = useState(false);

  // Transactions list
  const [transactions, setTransactions] = useState<SePayTransaction[]>(() => PaymentService.getTransactions());

  // Copy states
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);
  const [copiedAccNum, setCopiedAccNum] = useState(false);
  const [copiedSampleSyntax, setCopiedSampleSyntax] = useState<string | null>(null);

  // Course syntax search & inline edit
  const [courseSearch, setCourseSearch] = useState('');
  const [editingSyntaxMap, setEditingSyntaxMap] = useState<Record<string, string>>({});

  // Webhook Simulator state
  const [simCourseId, setSimCourseId] = useState(courses[0]?.id || '');
  const [simPhone, setSimPhone] = useState('0988776655');
  const [simAmount, setSimAmount] = useState<number>(courses[0]?.discountPrice || 990000);
  const [simResult, setSimResult] = useState<{ success: boolean; message: string; tx?: SePayTransaction } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Sync state if external changes happen
  useEffect(() => {
    const handleUpdate = () => {
      setTransactions(PaymentService.getTransactions());
    };
    window.addEventListener('sepay_transactions_updated', handleUpdate);
    return () => window.removeEventListener('sepay_transactions_updated', handleUpdate);
  }, []);

  // Update simulator amount when course changes
  const handleSelectSimCourse = (courseId: string) => {
    setSimCourseId(courseId);
    const found = courses.find(c => c.id === courseId);
    if (found) {
      setSimAmount(found.discountPrice);
    }
  };

  // Handle bank select
  const handleSelectBank = (shortName: string) => {
    setSelectedBankShortName(shortName);
    const found = POPULAR_VIETNAM_BANKS.find(b => b.shortName === shortName);
    if (found) {
      setBankConfig(prev => ({
        ...prev,
        bankName: found.name,
        bankShortName: found.shortName,
        bankBin: found.bin
      }));
    }
  };

  // Save Bank Config
  const handleSaveBankConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankConfig.accountNumber.trim() || !bankConfig.accountHolderName.trim()) {
      showToast('Vui lòng nhập đầy đủ Số tài khoản và Tên chủ tài khoản!');
      return;
    }
    const cleanConfig: PaymentBankConfig = {
      ...bankConfig,
      accountNumber: bankConfig.accountNumber.trim().replace(/\s+/g, ''),
      accountHolderName: bankConfig.accountHolderName.trim().toUpperCase()
    };
    PaymentService.saveBankConfig(cleanConfig);
    setBankConfig(cleanConfig);
    setBankSavedNotification(true);
    showToast('Đã lưu thông tin tài khoản ngân hàng thành công!');
    setTimeout(() => setBankSavedNotification(false), 3000);
  };

  // Save SePay Config
  const handleSaveSepayConfig = (e: React.FormEvent) => {
    e.preventDefault();
    PaymentService.saveSePayConfig(sepayConfig);
    setSepaySavedNotification(true);
    showToast('Đã cập nhật cấu hình Webhook SePay!');
    setTimeout(() => setSepaySavedNotification(false), 3000);
  };

  // Update Course Syntax
  const handleSaveCourseSyntax = (courseId: string) => {
    const newSyntax = editingSyntaxMap[courseId];
    if (!newSyntax || !newSyntax.trim()) {
      showToast('Cú pháp không được để trống!');
      return;
    }
    const clean = newSyntax.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    StorageService.updateCourseTransferSyntax(courseId, clean);
    showToast(`Đã lưu cú pháp "${clean}" cho khóa học!`);
    if (onCourseUpdated) onCourseUpdated();
  };

  // Quick simulate webhook
  const handleRunSimulation = () => {
    if (!simCourseId) {
      showToast('Vui lòng chọn khóa học để mô phỏng!');
      return;
    }
    setIsSimulating(true);
    setSimResult(null);

    setTimeout(() => {
      try {
        const result = PaymentService.simulateWebhook({
          courseId: simCourseId,
          phone: simPhone,
          amount: simAmount
        });
        setSimResult({
          success: result.success,
          message: result.message,
          tx: result.transaction
        });
        setTransactions(PaymentService.getTransactions());
        if (result.success) {
          showToast(`Thành công! Khóa học đã được mở khóa cho SĐT ${simPhone}`);
        } else {
          showToast(`Lỗi đối soát: ${result.message}`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Có lỗi khi chạy mô phỏng webhook';
        setSimResult({
          success: false,
          message: msg
        });
      } finally {
        setIsSimulating(false);
      }
    }, 600);
  };

  const filteredCourses = courses.filter(c => {
    const q = courseSearch.toLowerCase();
    const syntax = (editingSyntaxMap[c.id] ?? PaymentService.getCourseTransferSyntax(c)).toLowerCase();
    return c.title.toLowerCase().includes(q) || syntax.includes(q) || c.instructorName.toLowerCase().includes(q);
  });

  const livePreviewQRUrl = PaymentService.getVietQRImageUrl({
    bankBin: bankConfig.bankBin,
    accountNumber: bankConfig.accountNumber,
    accountName: bankConfig.accountHolderName,
    amount: courses[0]?.discountPrice || 1290000,
    memo: `${sepayConfig.globalPrefix || 'HMN'} ${PaymentService.getCourseTransferSyntax(courses[0] || { id: 'sample', title: '', slug: '' } as Course)} 0901234567`,
    template: bankConfig.qrTemplate
  });

  // Calculate stats
  const totalReceived = transactions
    .filter(t => t.status === 'success')
    .reduce((sum, t) => sum + (t.transferAmount || 0), 0);
  const successCount = transactions.filter(t => t.status === 'success').length;
  const unmatchedCount = transactions.filter(t => t.status === 'unmatched' || t.status === 'invalid_amount').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-red-900 via-stone-900 to-amber-950 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-400 ring-1 ring-white/20">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black">Cài Đặt Thanh Toán & Webhook SePay Tự Động</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    SePay VietQR Active
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-0.5">
                  Quản lý thẻ/tài khoản ngân hàng, cấu hình Webhook SePay nhận tiền tự động và thiết lập cú pháp chuyển khoản riêng biệt cho từng khóa học
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://sepay.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20"
              >
                <span>Mở SePay.vn</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-stone-300 font-bold">Tổng tiền SePay nhận</p>
              <p className="text-lg font-black text-amber-300 mt-0.5">
                {new Intl.NumberFormat('vi-VN').format(totalReceived)}đ
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-stone-300 font-bold">Giao dịch tự động khớp</p>
              <p className="text-lg font-black text-emerald-400 mt-0.5">
                {successCount} đơn hàng
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-stone-300 font-bold">Khóa học có cú pháp riêng</p>
              <p className="text-lg font-black text-white mt-0.5">
                {courses.length} / {courses.length} khóa
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-stone-300 font-bold">Cần kiểm tra (chưa khớp)</p>
              <p className={`text-lg font-black mt-0.5 ${unmatchedCount > 0 ? 'text-amber-400' : 'text-stone-300'}`}>
                {unmatchedCount} giao dịch
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Bank Account Info & SePay Config */}
        <div className="lg:col-span-7 space-y-8">
          {/* CARD 1: Cấu hình thông tin thẻ / ngân hàng */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-stone-900">1. Thông Tin Thẻ & Tài Khoản Ngân Hàng Nhận Tiền</h4>
                  <p className="text-xs text-stone-500">Thông tin này sẽ tự động hiển thị trên mã VietQR của toàn bộ các khóa học khi học viên thanh toán</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveBankConfig} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Bank */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Chọn Ngân hàng nhận thanh toán <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedBankShortName}
                    onChange={(e) => handleSelectBank(e.target.value)}
                    className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  >
                    {POPULAR_VIETNAM_BANKS.map((b) => (
                      <option key={b.bin} value={b.shortName}>
                        [{b.shortName}] {b.name} (BIN: {b.bin})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Số tài khoản ngân hàng <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bankConfig.accountNumber}
                    onChange={(e) => setBankConfig(prev => ({ ...prev, accountNumber: e.target.value }))}
                    placeholder="vd: 09123456789"
                    className="w-full p-2.5 text-xs font-mono font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>

                {/* Account Holder Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tên chủ tài khoản (in hoa không dấu) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bankConfig.accountHolderName}
                    onChange={(e) => setBankConfig(prev => ({ ...prev, accountHolderName: e.target.value.toUpperCase() }))}
                    placeholder="vd: CONG TY HOC MON NGON hoặc NGUYEN VAN A"
                    className="w-full p-2.5 text-xs font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Chi nhánh ngân hàng (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={bankConfig.branch || ''}
                    onChange={(e) => setBankConfig(prev => ({ ...prev, branch: e.target.value }))}
                    placeholder="vd: Hà Nội, Chi nhánh Ba Đình..."
                    className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>

                {/* QR Template */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Kiểu mẫu mã VietQR
                  </label>
                  <select
                    value={bankConfig.qrTemplate}
                    onChange={(e) => setBankConfig(prev => ({ ...prev, qrTemplate: e.target.value as PaymentBankConfig['qrTemplate'] }))}
                    className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:border-red-600 focus:bg-white"
                  >
                    <option value="compact2">Compact 2 (Chuẩn đẹp kèm logo ngân hàng & số tài khoản)</option>
                    <option value="compact">Compact (Đầy đủ thông tin)</option>
                    <option value="qr_only">QR Only (Chỉ hình mã vuông)</option>
                  </select>
                </div>
              </div>

              {/* Action save bank */}
              <div className="flex items-center justify-between pt-2">
                {bankSavedNotification ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Đã lưu cài đặt ngân hàng thành công!
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-500">
                    * Mã QR và số tài khoản sẽ lập tức áp dụng cho mọi khách hàng quét mã.
                  </span>
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu Cài Đặt Ngân Hàng</span>
                </button>
              </div>
            </form>
          </div>

          {/* CARD 2: Cấu hình SePay Webhook */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-stone-900">2. Cấu Hình Webhook SePay (Tự Động Kích Hoạt)</h4>
                  <p className="text-xs text-stone-500">Kết nối SePay để hệ thống tự động nghe biến động số dư và mở khóa học ngay sau khi tiền về tài khoản</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sepayConfig.isEnabled}
                    onChange={(e) => setSepayConfig(prev => ({ ...prev, isEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>
            </div>

            <form onSubmit={handleSaveSepayConfig} className="space-y-4">
              {/* Webhook Endpoint to Copy */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Địa chỉ Webhook Endpoint (Sao chép dán vào Dashboard SePay):
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Sẵn sàng nhận dữ liệu
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={sepayConfig.webhookUrl || `${window.location.origin}/api/sepay-webhook`}
                    className="w-full p-2.5 text-xs font-mono bg-white border border-stone-200 rounded-xl text-stone-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(sepayConfig.webhookUrl || `${window.location.origin}/api/sepay-webhook`);
                      setCopiedWebhookUrl(true);
                      showToast('Đã sao chép link Webhook!');
                      setTimeout(() => setCopiedWebhookUrl(false), 2000);
                    }}
                    className="px-3 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedWebhookUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedWebhookUrl ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-stone-500">
                  Vào <strong>SePay.vn &gt; Tích hợp Webhook &gt; Thêm Webhook mới</strong>, dán link trên và chọn tài khoản ngân hàng của bạn.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Global Prefix */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tiền tố chuyển khoản chung (Global Prefix)
                  </label>
                  <input
                    type="text"
                    required
                    value={sepayConfig.globalPrefix}
                    onChange={(e) => setSepayConfig(prev => ({ ...prev, globalPrefix: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                    placeholder="HMN"
                    className="w-full p-2.5 text-xs font-mono font-bold uppercase bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">VD: Với tiền tố HMN, cú pháp sẽ là: HMN PHOBO 0901234567</p>
                </div>

                {/* Auto Enroll Toggle */}
                <div className="flex flex-col justify-center p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sepayConfig.autoEnrollEnabled}
                      onChange={(e) => setSepayConfig(prev => ({ ...prev, autoEnrollEnabled: e.target.checked }))}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs font-bold text-stone-900">
                      Tự động mở khóa học khi nhận Webhook
                    </span>
                  </label>
                  <p className="text-[10px] text-stone-500 mt-1 ml-6">
                    Kích hoạt quyền học trọn đời ngay khi khớp mã cú pháp và số tiền
                  </p>
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    SePay API Key (Token)
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={sepayConfig.apiKey}
                      onChange={(e) => setSepayConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Lấy trong SePay.vn > Cài đặt API"
                      className="w-full p-2.5 pr-10 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Webhook Token */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Mã xác thực Webhook Token (Secret)
                  </label>
                  <div className="relative">
                    <input
                      type={showWebhookToken ? 'text' : 'password'}
                      value={sepayConfig.webhookToken}
                      onChange={(e) => setSepayConfig(prev => ({ ...prev, webhookToken: e.target.value }))}
                      placeholder="vd: sepay_wh_token_888"
                      className="w-full p-2.5 pr-10 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWebhookToken(!showWebhookToken)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                    >
                      {showWebhookToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Save SePay */}
              <div className="flex items-center justify-between pt-2">
                {sepaySavedNotification ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Đã lưu cấu hình SePay!
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-500">
                    Hỗ trợ xác thực giao dịch thời gian thực qua chuẩn SePay Webhook API
                  </span>
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu Cấu Hình SePay</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Live QR Preview & Webhook Simulator */}
        <div className="lg:col-span-5 space-y-8">
          {/* Live VietQR Preview */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-red-700" />
                <h4 className="font-black text-stone-900 text-sm">Xem Trước Mã VietQR Thực Tế</h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                {bankConfig.bankShortName}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center">
              <img
                src={livePreviewQRUrl}
                alt="VietQR Live Preview"
                className="w-48 h-48 object-contain rounded-xl shadow-sm bg-white p-2"
              />
              <p className="text-xs font-extrabold text-stone-900 mt-3">
                {bankConfig.accountHolderName}
              </p>
              <p className="text-xs font-mono font-bold text-stone-600">
                STK: {bankConfig.accountNumber} ({bankConfig.bankShortName})
              </p>
              <div className="mt-3 p-2.5 bg-white rounded-xl border border-stone-200 text-[11px] text-stone-600 w-full text-left space-y-1">
                <p><strong>Cú pháp mẫu:</strong> <span className="font-mono text-red-700 font-bold">{sepayConfig.globalPrefix || 'HMN'} {PaymentService.getCourseTransferSyntax(courses[0] || { id: 'sample', title: '', slug: '' } as Course)} 0901234567</span></p>
                <p><strong>Số tiền:</strong> {new Intl.NumberFormat('vi-VN').format(courses[0]?.discountPrice || 1290000)}đ</p>
              </div>
            </div>
          </div>

          {/* Webhook Simulator & Tester */}
          <div className="bg-white rounded-3xl border border-amber-200 p-6 shadow-sm space-y-4 bg-amber-50/20">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-stone-900 text-sm">Mô Phỏng Bắn Webhook SePay</h4>
                  <p className="text-[10px] text-stone-500">Thử nghiệm quy trình nhận tiền & kích hoạt tự động</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Chọn khóa học thanh toán thử:
                </label>
                <select
                  value={simCourseId}
                  onChange={(e) => handleSelectSimCourse(e.target.value)}
                  className="w-full p-2 bg-white border border-stone-200 rounded-xl font-medium text-stone-900"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      [{PaymentService.getCourseTransferSyntax(c)}] {c.title.split(' - ')[0]} ({new Intl.NumberFormat('vi-VN').format(c.discountPrice)}đ)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">SĐT Học viên:</label>
                  <input
                    type="text"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    placeholder="0988776655"
                    className="w-full p-2 bg-white border border-stone-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Số tiền (VNĐ):</label>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-stone-200 rounded-xl font-mono font-bold text-red-700"
                  />
                </div>
              </div>

              {/* Generated Syntax preview */}
              {(() => {
                const selectedC = courses.find(c => c.id === simCourseId);
                const syntax = selectedC ? PaymentService.getCourseTransferSyntax(selectedC) : 'PHOBO';
                const memo = `${sepayConfig.globalPrefix || 'HMN'} ${syntax} ${simPhone}`;
                return (
                  <div className="p-2.5 bg-white rounded-xl border border-stone-200 text-[11px]">
                    <span className="text-stone-500">Nội dung SePay sẽ gửi: </span>
                    <strong className="font-mono text-red-700">{memo}</strong>
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-black text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSimulating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isSimulating ? 'Đang xử lý Webhook...' : 'Bắn Webhook Thử Nghiệm Ngay'}</span>
              </button>

              {/* Simulation Result */}
              {simResult && (
                <div className={`p-3 rounded-xl border text-xs space-y-1 animate-in fade-in ${
                  simResult.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}>
                  <p className="font-black flex items-center gap-1.5">
                    {simResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                    <span>{simResult.success ? 'Đối soát thành công 100%' : 'Đối soát không thành công'}</span>
                  </p>
                  <p className="text-[11px] leading-relaxed">{simResult.message}</p>
                  {simResult.tx && (
                    <p className="text-[10px] font-mono text-stone-600 pt-1 border-t border-emerald-200/50">
                      Mã GD: {simResult.tx.id} • Khóa: {simResult.tx.courseTitle?.split(' - ')[0]}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: Quản Lý Cú Pháp Riêng Biệt Cho Từng Khóa Học */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-stone-900">3. Cài Đặt Cú Pháp Thanh Toán Riêng Biệt Cho Từng Khóa Học</h4>
              <p className="text-xs text-stone-500">Mỗi khóa học có mã cú pháp độc quyền riêng để hệ thống SePay nhận biết chính xác khóa học cần kích hoạt</p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo tên khóa hoặc cú pháp..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white font-medium"
            />
          </div>
        </div>

        {/* Table of Course Syntax */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-[11px] font-black uppercase tracking-wider text-stone-500 bg-stone-50/70">
                <th className="py-3 px-4 rounded-l-xl">Khóa Học & Bếp Trưởng</th>
                <th className="py-3 px-3">Học Phí</th>
                <th className="py-3 px-4">Mã Cú Pháp Riêng (Syntax Code)</th>
                <th className="py-3 px-4">Nội Dung Học Viên Chuyển Khoản Mẫu</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredCourses.map((c) => {
                const currentSyntax = editingSyntaxMap[c.id] !== undefined 
                  ? editingSyntaxMap[c.id] 
                  : PaymentService.getCourseTransferSyntax(c);
                const fullMemoPreview = `${sepayConfig.globalPrefix || 'HMN'} ${currentSyntax} [SĐT]`;

                return (
                  <tr key={c.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Course Title & Chef */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.thumbnail}
                          alt={c.title}
                          className="w-12 h-9 rounded-lg object-cover ring-1 ring-stone-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-stone-900 line-clamp-1">{c.title}</p>
                          <p className="text-[11px] text-stone-500">Giảng viên: <strong className="text-stone-700">{c.instructorName}</strong></p>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-3">
                      <span className="font-black text-red-700 whitespace-nowrap">
                        {new Intl.NumberFormat('vi-VN').format(c.discountPrice)}đ
                      </span>
                    </td>

                    {/* Syntax Code Input */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 max-w-xs">
                        <input
                          type="text"
                          value={currentSyntax}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                            setEditingSyntaxMap(prev => ({ ...prev, [c.id]: val }));
                          }}
                          placeholder="PHOBO"
                          className="w-32 px-3 py-1.5 font-mono font-black text-red-800 bg-red-50/60 border border-red-200 rounded-lg text-xs focus:outline-none focus:border-red-600 focus:bg-white"
                        />
                        {editingSyntaxMap[c.id] !== undefined && editingSyntaxMap[c.id] !== c.transferSyntax && (
                          <button
                            type="button"
                            onClick={() => handleSaveCourseSyntax(c.id)}
                            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                          >
                            Lưu mã
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Full Syntax Preview */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2.5 py-1 bg-stone-100 text-stone-800 rounded-md border border-stone-200">
                          {fullMemoPreview}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const textToCopy = `${sepayConfig.globalPrefix || 'HMN'} ${currentSyntax} 0901234567`;
                            navigator.clipboard.writeText(textToCopy);
                            setCopiedSampleSyntax(c.id);
                            showToast(`Đã sao chép cú pháp: ${textToCopy}`);
                            setTimeout(() => setCopiedSampleSyntax(null), 2000);
                          }}
                          className="p-1 text-stone-400 hover:text-stone-700 rounded"
                          title="Sao chép cú pháp mẫu"
                        >
                          {copiedSampleSyntax === c.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSimCourseId(c.id);
                          setSimAmount(c.discountPrice);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                          showToast(`Đã chọn "${c.title.split(' - ')[0]}" vào bộ mô phỏng Webhook!`);
                        }}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Send className="w-3 h-3 text-amber-600" />
                        <span>Mô phỏng GD</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CARD 4: Lịch Sử Giao Dịch Webhook SePay */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-stone-900">4. Lịch Sử Giao Dịch Webhook SePay Nhận Tiền ({transactions.length})</h4>
              <p className="text-xs text-stone-500">Toàn bộ biến động số dư chuyển khoản từ các ứng dụng ngân hàng gửi về hệ thống qua Webhook</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTransactions(PaymentService.getTransactions());
                showToast('Đã làm mới danh sách giao dịch!');
              }}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>
            {transactions.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xóa lịch sử giao dịch mô phỏng này?')) {
                    PaymentService.clearTransactions();
                    setTransactions([]);
                    showToast('Đã dọn dẹp lịch sử giao dịch!');
                  }
                }}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa lịch sử</span>
              </button>
            )}
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-stone-200 rounded-2xl bg-stone-50 space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-400 mx-auto flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-stone-600">Chưa có giao dịch webhook nào được ghi nhận</p>
            <p className="text-[11px] text-stone-500 max-w-md mx-auto">
              Bạn có thể dùng công cụ &quot;Mô phỏng Bắn Webhook SePay&quot; ở trên để tạo giao dịch thanh toán thử nghiệm.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-[11px] font-black uppercase tracking-wider text-stone-500 bg-stone-50/70">
                  <th className="py-3 px-4 rounded-l-xl">Thời Gian / Mã GD</th>
                  <th className="py-3 px-3">Cổng Ngân Hàng</th>
                  <th className="py-3 px-3">Số Tiền</th>
                  <th className="py-3 px-4">Nội Dung Chuyển Khoản</th>
                  <th className="py-3 px-4">Khóa Học Khớp</th>
                  <th className="py-3 px-3">SĐT Học Viên</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs font-medium">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-bold text-stone-900">{tx.transactionDate}</p>
                      <p className="text-[10px] font-mono text-stone-500">{tx.referenceCode || tx.id}</p>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-bold text-[11px]">
                        {tx.gateway}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-black text-emerald-700 text-xs">
                        +{new Intl.NumberFormat('vi-VN').format(tx.transferAmount)}đ
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-mono text-xs text-stone-800 bg-stone-50 p-1.5 rounded border border-stone-200 line-clamp-2">
                        {tx.content}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      {tx.courseTitle ? (
                        <p className="font-bold text-stone-900 line-clamp-1">
                          {tx.courseTitle.split(' - ')[0]}
                        </p>
                      ) : (
                        <span className="text-stone-400 italic">Không nhận diện được</span>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-mono text-stone-700">
                      {tx.studentPhone || '---'}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {tx.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã kích hoạt
                        </span>
                      ) : tx.status === 'unmatched' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Sai cú pháp
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-bold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Thiếu tiền
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CARD 5: Hướng Dẫn Tích Hợp SePay 3 Bước */}
      <div className="p-6 bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-3xl shadow-md space-y-4">
        <h4 className="text-base font-black text-amber-300 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Hướng Dẫn Kích Hoạt Tự Động Với SePay Trong 3 Bước
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center">1</span>
            <p className="font-bold text-white">Đăng ký & Liên kết Ngân hàng</p>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Truy cập SePay.vn, đăng ký tài khoản và kết nối tài khoản ngân hàng của bạn (MB, Vietcombank, Techcombank, ACB...).
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center">2</span>
            <p className="font-bold text-white">Dán Webhook Endpoint</p>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Vào mục Cấu hình Webhook trên SePay, dán đường dẫn Webhook Endpoint ở mục 2 phía trên và bật nhận sự kiện biến động số dư.
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center">3</span>
            <p className="font-bold text-white">Hệ Thống Tự Động 100%</p>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Mỗi khi học viên chuyển khoản đúng cú pháp của khóa học, SePay gửi Webhook đến website để mở khóa học và kích hoạt tài khoản tức thì.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
