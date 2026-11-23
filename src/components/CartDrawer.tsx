import React from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, CheckCircle2, ChefHat } from 'lucide-react';
import { Course } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Course[];
  onRemoveItem: (courseId: string) => void;
  onClearCart: () => void;
  onCheckoutCart: () => void;
  onSelectCourse: (course: Course) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
  onCheckoutCart,
  onSelectCourse
}) => {
  if (!isOpen) return null;

  const totalDiscountPrice = cartItems.reduce((sum, item) => sum + item.discountPrice, 0);
  const totalOriginalPrice = cartItems.reduce((sum, item) => sum + item.originalPrice, 0);
  const totalSavings = Math.max(0, totalOriginalPrice - totalDiscountPrice);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <aside
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-stone-200 animate-in slide-in-from-right duration-200"
        aria-label="Giỏ hàng khóa học"
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#faf9f6]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#0e4a38] text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base leading-tight">
                Giỏ Hàng Khóa Học
              </h2>
              <p className="text-xs text-stone-500">
                {cartItems.length} khóa học đã chọn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 rounded-lg transition-colors cursor-pointer"
            aria-label="Đóng giỏ hàng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-stone-800 text-base">
                  Giỏ hàng của bạn đang trống
                </p>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Hãy chọn nút <span className="font-bold text-[#0e4a38]">THÊM GIỎ</span> ở các khóa học mở quán để lưu vào danh sách thanh toán một lần.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-[#0e4a38] hover:bg-[#093628] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Khám phá khóa học
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-3 bg-white rounded-xl border border-stone-200 hover:border-stone-300 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectCourse(item);
                    onClose();
                  }}
                  className="w-20 h-20 rounded-lg overflow-hidden bg-stone-100 shrink-0 cursor-pointer border border-stone-200"
                >
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
                      <ChefHat className="w-6 h-6" />
                    </div>
                  )}
                </button>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCourse(item);
                        onClose();
                      }}
                      className="text-left font-bold text-xs text-stone-900 hover:text-[#0e4a38] line-clamp-2 uppercase leading-snug cursor-pointer"
                    >
                      {item.title.split(' - ')[0]}
                    </button>
                    <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                      {item.instructorName}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1.5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-sm text-[#dc2626] tabular-nums">
                        {formatCurrency(item.discountPrice)}
                      </span>
                      {item.originalPrice > item.discountPrice && (
                        <span className="text-[11px] text-stone-400 line-through tabular-nums">
                          {formatCurrency(item.originalPrice)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa khỏi giỏ hàng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Actions */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-[#faf9f6] space-y-4">
            <div className="space-y-1.5 text-xs">
              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Tiết kiệm ưu đãi:</span>
                  <span className="tabular-nums">-{formatCurrency(totalSavings)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold text-stone-900 text-sm">Tổng thanh toán:</span>
                <span className="text-xl font-black text-[#dc2626] tabular-nums">
                  {formatCurrency(totalDiscountPrice)}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 flex items-center gap-1 pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Kích hoạt trọn đời tất cả khóa học ngay sau khi thanh toán</span>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClearCart}
                className="px-3.5 py-3 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Xóa hết
              </button>
              <button
                type="button"
                onClick={onCheckoutCart}
                className="flex-1 py-3 px-4 bg-[#0e4a38] hover:bg-[#093628] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>THANH TOÁN ({cartItems.length} KHÓA)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
