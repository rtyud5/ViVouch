import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ArrowLeft, Share2, Heart, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { useVoucherDetail } from "../../hooks/useVoucherDetail";
import { QtySelector } from "../../components/voucher/QtySelector";
import { DetailTabs } from "../../components/voucher/DetailTabs";
import { StickyBuyBar } from "../../components/voucher/StickyBuyBar";

export function VoucherDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Gọi hook lấy chi tiết voucher
  const { voucher: originalVoucher, loading: hookLoading, error, refetch } = useVoucherDetail(id);

  // States hỗ trợ test/debug trạng thái giao diện trực quan
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugOutOfStock, setDebugOutOfStock] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // State quản lý số lượng mua
  const [quantity, setQuantity] = useState(1);
  // Toast thông báo hành động
  const [toastMessage, setToastMessage] = useState("");

  // Dữ liệu voucher sau khi áp dụng các thiết lập debug
  const [voucher, setVoucher] = useState(null);

  useEffect(() => {
    if (originalVoucher) {
      if (debugOutOfStock) {
        setVoucher({
          ...originalVoucher,
          soldQuantity: originalVoucher.totalQuantity,
          remainingQuantity: 0
        });
        setQuantity(0);
      } else {
        setVoucher(originalVoucher);
        setQuantity(originalVoucher.remainingQuantity > 0 ? 1 : 0);
      }
    } else {
      setVoucher(null);
    }
  }, [originalVoucher, debugOutOfStock]);

  const isLoading = hookLoading || debugLoading;

  // Hiển thị thông báo tạm thời
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  // Handlers mua hàng
  const handleAddToCart = () => {
    if (!voucher || voucher.remainingQuantity === 0) return;
    const finalQty = parseInt(String(quantity), 10) || 1;
    showToast(`Đã thêm thành công ${finalQty} voucher vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    if (!voucher || voucher.remainingQuantity === 0) return;
    const finalQty = parseInt(String(quantity), 10) || 1;
    showToast(`Đang chuyển hướng tới trang thanh toán cho ${finalQty} voucher...`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: voucher?.name || "Voucher ưu đãi",
        text: `Nhận ngay ưu đãi từ ${voucher?.partnerName}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Đã sao chép liên kết voucher vào bộ nhớ tạm!");
    }
  };

  // Tính tỷ lệ giảm giá (%)
  const getDiscountPercent = (orig, sale) => {
    if (!orig || orig <= sale) return 0;
    return Math.round(((orig - sale) / orig) * 100);
  };

  // --- 1. RENDER LOADING SKELETON ---
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 pb-32 md:pb-8 flex-1 animate-pulse">
        {/* Nút quay lại Skeleton */}
        <div className="h-6 w-32 bg-base-300 rounded mb-6"></div>

        {/* Layout 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột trái (7 cột trên lg) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Ảnh voucher skeleton */}
            <div className="w-full aspect-video md:aspect-[4/3] bg-base-300 rounded-2xl"></div>
            {/* Tabs skeleton */}
            <div className="w-full h-12 bg-base-300 rounded-xl"></div>
            <div className="w-full h-48 bg-base-300 rounded-2xl"></div>
          </div>

          {/* Cột phải (5 cột trên lg) */}
          <div className="lg:col-span-5">
            <div className="card bg-base-100 border border-base-200 p-6 rounded-2xl flex flex-col gap-6">
              {/* Partner name */}
              <div className="h-4 w-24 bg-base-300 rounded"></div>
              {/* Voucher name */}
              <div className="space-y-2">
                <div className="h-8 w-full bg-base-300 rounded"></div>
                <div className="h-8 w-3/4 bg-base-300 rounded"></div>
              </div>
              {/* Rating */}
              <div className="h-5 w-32 bg-base-300 rounded"></div>
              {/* Price */}
              <div className="h-10 w-48 bg-base-300 rounded"></div>
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="h-4 w-full bg-base-300 rounded"></div>
                <div className="h-3 w-full bg-base-300 rounded-full"></div>
              </div>
              {/* Qty Selector */}
              <div className="space-y-2">
                <div className="h-4 w-16 bg-base-300 rounded"></div>
                <div className="h-10 w-32 bg-base-300 rounded-lg"></div>
              </div>
              {/* Nút mua */}
              <div className="flex gap-4 pt-4">
                <div className="h-12 flex-1 bg-base-300 rounded-xl"></div>
                <div className="h-12 flex-1 bg-base-300 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. RENDER ERROR STATE ---
  if (error || !voucher) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-base-100 rounded-2xl shadow-sm border border-base-200 text-center flex flex-col items-center gap-4">
        <AlertCircle className="text-error" size={48} />
        <h2 className="text-xl font-bold text-base-content">Lỗi tải dữ liệu</h2>
        <p className="text-base-content/60 text-sm">{error || "Voucher không tồn tại hoặc đã bị xóa."}</p>
        <div className="flex gap-3 mt-2">
          <button onClick={() => navigate("/vouchers")} className="btn btn-outline btn-sm">
            Quay lại danh sách
          </button>
          <button onClick={refetch} className="btn btn-primary btn-sm flex items-center gap-1">
            <RefreshCw size={14} />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Tỷ lệ phần trăm số lượng đã bán
  const soldPercent = Math.min(100, Math.round((voucher.soldQuantity / voucher.totalQuantity) * 100));
  const isOutOfStock = voucher.remainingQuantity === 0;

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-8 pb-32 md:pb-8 flex-1">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success shadow-lg text-sm rounded-xl font-semibold flex items-center gap-2">
            <ShieldCheck size={18} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* DEBUG TOOLBAR - Dành cho người kiểm thử trực quan */}
      <div className="mb-6 p-4 rounded-xl bg-info/10 border border-info/20 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="badge badge-info font-bold">Debug Panel</span>
          <span className="text-base-content/70 font-medium">Giả lập các trạng thái để test UI:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setDebugLoading(true);
              setTimeout(() => setDebugLoading(false), 2000);
            }}
            className="btn btn-xs btn-outline btn-info font-bold"
          >
            Tải lại Skeleton (2s)
          </button>
          <button
            onClick={() => setDebugOutOfStock(!debugOutOfStock)}
            className={`btn btn-xs font-bold ${debugOutOfStock ? "btn-error" : "btn-outline btn-error"}`}
          >
            {debugOutOfStock ? "Hủy giả lập Hết hàng" : "Giả lập Hết hàng (Qty = 0)"}
          </button>
        </div>
      </div>

      {/* Nút quay lại trang trước */}
      <button
        onClick={() => navigate("/vouchers")}
        className="btn btn-link btn-xs p-0 text-base-content/60 hover:text-primary mb-6 flex items-center gap-2 text-sm no-underline hover:no-underline font-semibold"
      >
        <ArrowLeft size={16} />
        <span>Quay lại danh sách</span>
      </button>

      {/* Grid Layout chính */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CỘT TRÁI (Ảnh + Tabs) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Vùng ảnh voucher */}
          <div className="relative w-full aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden shadow-md bg-base-300 border border-base-200">
            {voucher.imageUrl ? (
              <img
                src={voucher.imageUrl}
                alt={voucher.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            ) : (
              // Trạng thái ảnh placeholder khi imageUrl null
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-base-300 to-base-200 text-base-content/40 gap-3">
                <div className="w-16 h-16 rounded-full bg-base-100 flex items-center justify-center shadow-sm">
                  <Star size={32} className="text-base-content/30" />
                </div>
                <span className="font-semibold text-sm">Hình ảnh đang được cập nhật</span>
              </div>
            )}

            {/* Badge danh mục */}
            <span className="absolute top-4 left-4 badge badge-primary font-bold shadow-md px-3 py-1.5 uppercase text-xs tracking-wider">
              {voucher.category === "am-thuc" && "🍜 Ẩm thực"}
              {voucher.category === "lam-dep" && "💆 Làm đẹp"}
              {voucher.category === "du-lich" && "✈️ Du lịch"}
              {voucher.category === "mua-sam" && "🛍️ Mua sắm"}
              {voucher.category === "giai-tri" && "🎮 Giải trí"}
              {!["am-thuc", "lam-dep", "du-lich", "mua-sam", "giai-tri"].includes(voucher.category) && "🎟️ Voucher"}
            </span>

            {/* Khung tương tác góc ảnh */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`btn btn-circle btn-sm shadow-md bg-base-100 hover:bg-base-200 border-0 ${
                  isFavorite ? "text-error" : "text-base-content/60"
                }`}
                title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
              >
                <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
              </button>
              <button
                onClick={handleShare}
                className="btn btn-circle btn-sm shadow-md bg-base-100 hover:bg-base-200 border-0 text-base-content/60"
                title="Chia sẻ"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Component Tabs hiển thị Mô tả, Điều kiện, Chi nhánh */}
          <DetailTabs
            description={voucher.description}
            conditions={voucher.conditions}
            branches={voucher.branches}
          />
        </div>

        {/* CỘT PHẢI (Thông tin giá, số lượng, mua hàng) */}
        <div className="lg:col-span-5">
          <div className="card bg-base-100 border border-base-200 p-6 rounded-2xl shadow-sm flex flex-col gap-6 md:sticky md:top-24">
            
            {/* Partner info */}
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-full">
                {voucher.partnerName}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-base-content mt-3 leading-snug">
                {voucher.name}
              </h1>
            </div>

            {/* Đánh giá */}
            <div className="flex items-center gap-1.5 text-sm">
              <div className="flex text-warning">
                <Star size={16} fill="currentColor" />
              </div>
              <span className="font-bold text-base-content">{voucher.rating}</span>
              <span className="text-base-content/40">|</span>
              <span className="text-base-content/60 font-medium">({voucher.reviewCount} đánh giá)</span>
            </div>

            <div className="divider my-0"></div>

            {/* Phần hiển thị giá tiền */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">Giá ưu đãi</span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-primary tracking-tight">
                  {voucher.salePrice === 0 ? "Miễn phí" : `${voucher.salePrice.toLocaleString("vi-VN")}đ`}
                </span>
                
                {voucher.originalPrice > voucher.salePrice && (
                  <>
                    <span className="text-sm sm:text-base text-base-content/40 line-through font-medium">
                      {voucher.originalPrice.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="badge badge-error badge-sm font-extrabold rounded-md py-2.5">
                      -{getDiscountPercent(voucher.originalPrice, voucher.salePrice)}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Thanh tiến trình bán hàng */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-base-content/60">
                  {isOutOfStock ? "Đã hết lượt ưu đãi" : `Đã bán ${voucher.soldQuantity} / ${voucher.totalQuantity}`}
                </span>
                <span className="text-primary font-bold">{soldPercent}%</span>
              </div>
              <progress
                className={`progress w-full h-2.5 rounded-full ${
                  isOutOfStock ? "progress-error" : "progress-primary"
                }`}
                value={voucher.soldQuantity}
                max={voucher.totalQuantity}
              ></progress>
            </div>

            {/* Bộ chọn số lượng (chỉ hiển thị khi còn hàng) */}
            {!isOutOfStock && (
              <QtySelector
                value={quantity}
                onChange={setQuantity}
                max={voucher.remainingQuantity}
                disabled={isOutOfStock}
              />
            )}

            {/* Các nút bấm hành động mua hàng (Desktop) */}
            <div className="hidden md:flex flex-col gap-3 pt-2">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="btn btn-outline btn-primary flex-1 btn-md h-12 rounded-xl font-bold transition-all"
                >
                  Thêm vào giỏ hàng
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="btn btn-primary flex-[1.5] btn-md h-12 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                  {isOutOfStock ? "Hết hàng" : "Mua ngay"}
                </button>
              </div>
              <p className="text-xs text-base-content/50 text-center flex items-center justify-center gap-1 mt-1">
                <ShieldCheck size={14} className="text-success" />
                <span>Cam kết voucher chính hãng & an toàn tuyệt đối.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Component StickyBuyBar cố định đáy màn hình (Mobile) */}
      <StickyBuyBar
        voucher={voucher}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        disabled={isLoading}
      />
    </div>
  );
}
