import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Phone, 
  Copy, 
  Check, 
  Lock, 
  CreditCard, 
  Wallet, 
  QrCode, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Course, Student, PaymentBankConfig } from '../types';
import { PaymentService } from '../services/paymentService';

interface CheckoutPageProps {
  course: Course;
  currentUser: Student | null;
  onPaymentSuccess: (studentData: { name: string; phone: string; email: string }) => void;
  onNavigate: (view: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  course,
  currentUser,
  onPaymentSuccess,
  onNavigate
}) => {
  const [name, setName] = useState(currentUser?.name || 'Minh Hoàng');
  const [phone, setPhone] = useState(currentUser?.phone || '0901234567');
  const [email, setEmail] = useState(currentUser?.email || 'minhhoang@gmail.com');
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'card' | 'wallet'>('vietqr');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [autoCompleteSim, setAutoCompleteSim] = useState(false);
  const [sepaySuccessBanner, setSepaySuccessBanner] = useState<string | null>(null);

  const [bankConfig, setBankConfig] = useState<PaymentBankConfig>(() => PaymentService.getBankConfig());

  // Listen to payment configuration updates from admin
  useEffect(() => {
    const handleConfigChange = () => {
      setBankConfig(PaymentService.getBankConfig());
    };
    window.addEventListener('payment_config_updated', handleConfigChange);
    return () => window.removeEventListener('payment_config_updated', handleConfigChange);
  }, []);

  // Distinct course transfer memo (e.g. "HMN PHOBO 0901234567")
  const transferMemo = PaymentService.generateCourseTransferMemo(course, phone);
  const finalPrice = Math.max(0, course.discountPrice - couponDiscount);

  // Dynamic VietQR and SePay QR URLs
  const vietQrUrl = PaymentService.getVietQRImageUrl({
    bankBin: bankConfig.bankBin,
    accountNumber: bankConfig.accountNumber,
    accountName: bankConfig.accountHolderName,
    amount: finalPrice,
    memo: transferMemo,
    template: bankConfig.qrTemplate
  });

  // Listen for real-time SePay webhook success event
  useEffect(() => {
    const handleSepayReceived = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;
      if (!detail) return;

      const txCourseId = detail.transaction?.courseId || detail.course?.id;
      const txPhone = (detail.transaction?.studentPhone || detail.student?.phone || '').replace(/[^0-9]/g, '');
      const currentPhone = phone.replace(/[^0-9]/g, '');

      // Check if this transaction matches current course or phone
      if (txCourseId === course.id || (txPhone && currentPhone && txPhone === currentPhone)) {
        setSepaySuccessBanner(`🎉 SePay Webhook: Đã nhận được thanh toán ${new Intl.NumberFormat('vi-VN').format(detail.transaction.transferAmount)}đ từ ${detail.transaction.gateway}!`);
        setIsProcessing(true);
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          setIsProcessing(false);
          onPaymentSuccess({ name, phone, email });
        }, 1200);
      }
    };

    window.addEventListener('sepay_payment_received', handleSepayReceived);
    return () => window.removeEventListener('sepay_payment_received', handleSepayReceived);
  }, [course.id, phone, name, email, onPaymentSuccess]);

  // Auto simulated countdown when VietQR is selected
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (paymentMethod === 'vietqr' && !isProcessing) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 15; // loop preview
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [paymentMethod, isProcessing]);

  const handleCopy = (text: string, type: 'account' | 'memo') => {
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2000);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === 'CHEFVIP' || coupon.trim().toUpperCase() === 'HOCMONNGON') {
      setCouponDiscount(100000);
      setCouponApplied(true);
    } else if (coupon.trim()) {
      alert('Mã giảm giá không hợp lệ. Bạn có thể thử mã CHEFVIP để giảm 100.000đ!');
    }
  };

  const handleConfirmPayment = () => {
    if (!name || !phone || !email) {
      alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Email!');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      setIsProcessing(false);
      onPaymentSuccess({ name, phone, email });
    }, 1500);
  };

  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-between">
      {/* Top Header matching Image 3 */}
      <header className="bg-white border-b border-stone-200 py-3.5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2 cursor-pointer font-serif-heading font-black text-xl text-red-700"
          >
            <span className="text-xl">🍴</span>
            <span>Học Món Ngon</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Thanh toán bảo mật SSL 256-bit</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-stone-600">
            <Phone className="w-3.5 h-3.5 text-red-600" />
            <span>Hotline: <strong className="text-stone-900">1900 8888</strong></span>
          </div>
        </div>
      </header>

      {/* Main Checkout Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form & Payment Method matching Image 3 */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: User Info matching Image 3 */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-red-700 text-white font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h2 className="text-lg font-black text-stone-900">
                  Thông Tin Học Viên & Nhận Tài Khoản
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Họ và tên học viên
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Minh Hoàng"
                    className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white transition-all font-medium"
                  />
                  <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Nhận tài khoản & mật khẩu qua SMS / Zalo tức thì
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Địa chỉ Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="minhhoang@gmail.com"
                    className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white transition-all font-medium"
                  />
                  <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Nhận biên lai điện tử và tài liệu khóa học
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Payment Methods matching Image 3 */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-red-700 text-white font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h2 className="text-lg font-black text-stone-900">
                  Chọn Phương Thức Thanh Toán
                </h2>
              </div>

              {/* VietQR option matching Image 3 */}
              <div 
                onClick={() => setPaymentMethod('vietqr')}
                className={`rounded-2xl border-2 p-5 transition-all cursor-pointer ${
                  paymentMethod === 'vietqr' 
                    ? 'border-red-700 bg-red-50/20' 
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-red-700 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-red-700" />
                    </div>
                    <div>
                      <p className="font-extrabold text-stone-900 text-sm">Chuyển khoản VietQR tự động</p>
                      <p className="text-[11px] text-stone-500">Quét mã trên mọi ứng dụng ngân hàng, kích hoạt sau 10 giây</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-700 text-white text-[10px] font-bold">
                    Khuyên dùng
                  </span>
                </div>

                {/* VietQR & SePay Webhook Box Details */}
                <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 mt-3 space-y-4 shadow-xs">
                  {sepaySuccessBanner && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold text-xs flex items-center gap-2 animate-in fade-in">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{sepaySuccessBanner}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                    {/* QR Code */}
                    <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                      <img
                        src={vietQrUrl}
                        alt="VietQR Chuyển khoản tự động SePay"
                        className="w-40 h-40 object-contain rounded-lg shadow-xs bg-white p-1"
                      />
                      <p className="text-[11px] font-bold text-stone-700 mt-2">
                        Quét mã trên App Ngân hàng
                      </p>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold mt-1">
                        Cú pháp riêng: {PaymentService.getCourseTransferSyntax(course)}
                      </span>
                    </div>

                    {/* Bank Info Table */}
                    <div className="sm:col-span-7 space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-stone-100">
                        <span className="text-stone-500">Ngân hàng:</span>
                        <span className="font-bold text-stone-900">{bankConfig.bankName}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-100">
                        <span className="text-stone-500">Chủ tài khoản:</span>
                        <span className="font-extrabold text-stone-900">{bankConfig.accountHolderName}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-stone-100">
                        <span className="text-stone-500">Số tài khoản:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-stone-900 text-sm tracking-wide">{bankConfig.accountNumber}</span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleCopy(bankConfig.accountNumber, 'account'); }}
                            className="p-1 text-stone-400 hover:text-red-700 rounded transition-colors"
                            title="Sao chép số tài khoản"
                          >
                            {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-stone-100">
                        <span className="text-stone-500">Số tiền:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-red-700 text-sm">{formatPrice(finalPrice)}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(finalPrice.toString());
                              setCopiedAmount(true);
                              setTimeout(() => setCopiedAmount(false), 2000);
                            }}
                            className="p-1 text-stone-400 hover:text-red-700 rounded transition-colors"
                            title="Sao chép số tiền"
                          >
                            {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-stone-500">Nội dung CK:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">
                            {transferMemo}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleCopy(transferMemo, 'memo'); }}
                            className="p-1 text-stone-400 hover:text-red-700 rounded transition-colors"
                            title="Sao chép nội dung"
                          >
                            {copiedMemo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Auto detection status matching Image 3 */}
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-900">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-700 animate-spin shrink-0" />
                      <span>
                        Tự động duyệt qua Webhook SePay khi nhận đúng cú pháp & số tiền ({countdown}s)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Trigger simulated SePay webhook processing
                        PaymentService.simulateWebhook({
                          courseId: course.id,
                          phone: phone || '0901234567',
                          amount: finalPrice
                        });
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Mô phỏng Bắn Webhook SePay</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Credit card option */}
              <div 
                onClick={() => setPaymentMethod('card')}
                className={`rounded-2xl border p-4.5 transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'card' ? 'border-red-700 bg-red-50/20' : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-red-700' : 'border-stone-300'}`}>
                    {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-red-700" />}
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 text-sm">Thẻ tín dụng / Ghi nợ quốc tế</p>
                    <p className="text-[11px] text-stone-500">Visa, Mastercard, JCB</p>
                  </div>
                </div>
                <CreditCard className="w-5 h-5 text-stone-400" />
              </div>

              {/* E-wallet option */}
              <div 
                onClick={() => setPaymentMethod('wallet')}
                className={`rounded-2xl border p-4.5 transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'wallet' ? 'border-red-700 bg-red-50/20' : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'wallet' ? 'border-red-700' : 'border-stone-300'}`}>
                    {paymentMethod === 'wallet' && <div className="w-2 h-2 rounded-full bg-red-700" />}
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 text-sm">Ví điện tử</p>
                    <p className="text-[11px] text-stone-500">Momo, ZaloPay, VNPay</p>
                  </div>
                </div>
                <Wallet className="w-5 h-5 text-stone-400" />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary matching Image 3 */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-7 shadow-xl space-y-6">
              <h3 className="font-black text-stone-900 text-lg">
                Tóm Tắt Đơn Hàng
              </h3>

              {/* Course Item matching Image 3 */}
              <div className="flex gap-4 pb-5 border-b border-stone-100">
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                  alt={course.title}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-stone-200"
                />
                <div className="space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-800 uppercase tracking-wider">
                    BẾP TRƯỞNG 15 NĂM KINH NGHIỆM
                  </span>
                  <h4 className="font-black text-stone-900 text-sm line-clamp-2 leading-snug">
                    {course.title}
                  </h4>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Giá gốc:</span>
                  <span className="line-through">{formatPrice(course.originalPrice)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Giảm giá ưu đãi:</span>
                  <span>-{formatPrice(course.originalPrice - course.discountPrice)}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Mã giảm giá ({coupon}):</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá (VD: CHEFVIP)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-red-600 uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Áp dụng
                </button>
              </form>

              {/* Total Row */}
              <div className="pt-4 border-t border-stone-200">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-stone-900 text-sm">Tổng thanh toán:</span>
                  <span className="text-2xl font-black text-red-700">
                    {formatPrice(finalPrice)}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Đã bao gồm VAT & tài liệu trọn đời
                </p>
              </div>

              {/* Main Submit Button matching Image 3 */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmPayment}
                className="w-full py-4 bg-red-700 hover:bg-red-800 disabled:bg-stone-400 text-white font-black text-sm rounded-xl shadow-lg shadow-red-700/25 hover:shadow-red-700/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isProcessing ? 'Đang kích hoạt khóa học...' : `Xác Nhận & Kích Hoạt Khóa Học (${formatPrice(finalPrice)})`}
                </span>
              </button>

              {/* Guarantee Bullet Points matching Image 3 */}
              <ul className="space-y-2.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Kích hoạt bài học tức thì 24/7 không cần chờ duyệt.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cam kết hoàn tiền 100% trong 7 ngày nếu không hài lòng với công thức.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Được tham gia nhóm hỗ trợ VIP cùng giảng viên trọn đời.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Trust Banner matching Image 3 */}
        <div className="mt-16 text-center border-t border-stone-200 pt-10 pb-6 max-w-2xl mx-auto space-y-2">
          <p className="text-base font-extrabold text-stone-900">
            28,000+ học viên đã đăng ký an toàn
          </p>
          <p className="text-xs text-stone-500">
            Hệ thống mã hóa SSL 256-bit tối tân bảo vệ tuyệt đối thông tin thanh toán của bạn tại Học Món Ngon.
          </p>
        </div>
      </main>

      {/* Footer matching Image 3 */}
      <footer className="bg-stone-100 border-t border-stone-200 py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Học Món Ngon. All rights reserved. Secure 256-bit SSL Encrypted Checkout.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:underline">Chính sách bảo mật</a>
            <a href="#" className="hover:underline">Điều khoản dịch vụ</a>
            <a href="#" className="hover:underline">Hỗ trợ học viên</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
