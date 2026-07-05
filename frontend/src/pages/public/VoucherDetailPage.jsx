import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Star, ArrowLeft, Share2, Heart, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { useVoucherDetail } from "../../features/vouchers/hooks/useVoucherDetail";
import { QtySelector } from "../../components/voucher/QtySelector";
import { DetailTabs } from "../../components/voucher/DetailTabs";
import { StickyBuyBar } from "../../components/voucher/StickyBuyBar";
import { ReviewList } from "../../components/voucher/ReviewList";
import { WriteReviewForm } from "../../components/voucher/WriteReviewForm";
import { useAuthStore } from "../../stores/authStore";
import { useCart } from "../../features/cart/hooks/useCart";
import { useReviews, useCreateReview } from "../../features/vouchers/hooks/useReviews";
import { apiClient } from "../../services/apiClient";

export function VoucherDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { addToCart } = useCart();

  const query = useVoucherDetail(id);
  const reviewsQuery = useReviews(id);
  const { mutateAsync: createReview, isPending: isSubmittingReview } = useCreateReview();
  const voucherResponse = query.data?.data || query.data;

  const voucher = React.useMemo(() => {
    if (!voucherResponse) return null;
    return {
      ...voucherResponse,
      name: voucherResponse.title || voucherResponse.name,
      partnerName: voucherResponse.partner?.businessName || voucherResponse.partnerName,
      remainingQuantity:
        voucherResponse.remainingQty ?? Math.max(0, (voucherResponse.totalQty || 0) - (voucherResponse.soldQty || 0)),
      soldQuantity: voucherResponse.soldQty,
      totalQuantity: voucherResponse.totalQty,
      rating: voucherResponse.reviewSummary?.avgRating,
      reviewCount: voucherResponse.reviewSummary?.totalCount,
    };
  }, [voucherResponse]);

  const isLoading = query.isLoading;
  const error = query.error?.message || null;
  const refetch = query.refetch;

  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const voucherId = voucher?.id;
  useEffect(() => {
    if (voucher) {
      setQuantity(voucher.remainingQuantity > 0 ? 1 : 0);
    }
  }, [voucherId]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { returnUrl: location.pathname } });
      return;
    }
    if (!voucher || voucher.remainingQuantity === 0) return;

    const finalQty = Math.max(1, Math.min(parseInt(String(quantity), 10) || 1, voucher.remainingQuantity));
    setIsAddingToCart(true);
    try {
      await addToCart({ voucherId: voucher.id, qty: finalQty });
      showToast(`Đã thêm thành công ${finalQty} voucher vào giỏ hàng!`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Có lỗi xảy ra khi thêm vào giỏ hàng.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { returnUrl: location.pathname } });
      return;
    }
    if (!voucher || voucher.remainingQuantity === 0) return;

    const finalQty = Math.max(1, Math.min(parseInt(String(quantity), 10) || 1, voucher.remainingQuantity));
    setIsAddingToCart(true);
    try {
      await addToCart({ voucherId: voucher.id, qty: finalQty });
      showToast("Đang chuyển hướng tới giỏ hàng...");
      navigate("/customer/cart");
    } catch (err) {
      showToast(err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleShare = async () => {
    const currentUrl = globalThis.location?.href ?? "";
    const clipboard = globalThis.navigator?.clipboard;
    const share = globalThis.navigator?.share;

    if (share) {
      try {
        await share({
          title: voucher?.name || "Voucher ưu đãi",
          text: `Nhận ngay ưu đãi từ ${voucher?.partnerName}`,
          url: currentUrl,
        });
      } catch {
        // User may cancel the share sheet or the browser may block sharing.
      }
      return;
    }

    try {
      await clipboard?.writeText(currentUrl);
      showToast("Đã sao chép liên kết voucher vào bộ nhớ tạm!");
    } catch {
      // Silent fail: avoid console noise in demo mode.
    }
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    if (!isAuthenticated || !voucher) return;
    try {
      await createReview({ voucherId: voucher.id, data: { rating, comment } });
      showToast("Cảm ơn bạn đã đánh giá!");
    } catch (err) {
      showToast(err?.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá.");
    }
  };

  const getDiscountPercent = (orig, sale) => {
    if (!orig || orig <= sale) return 0;
    return Math.round(((orig - sale) / orig) * 100);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 pb-32 md:pb-8 flex-1 animate-pulse">
        <div className="h-6 w-32 bg-base-300 rounded mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="w-full aspect-video md:aspect-[4/3] bg-base-300 rounded-2xl"></div>
            <div className="w-full h-12 bg-base-300 rounded-xl"></div>
            <div className="w-full h-48 bg-base-300 rounded-2xl"></div>
            {/* Review section skeletons to prevent layout shift */}
            <div className="flex flex-col gap-2 mt-4">
              <div className="w-full h-40 bg-base-300 rounded-2xl mt-6"></div>
              <div className="w-full h-64 bg-base-300 rounded-2xl mt-6"></div>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="card bg-base-100 border border-base-200 p-6 rounded-2xl flex flex-col gap-6">
              <div className="h-4 w-24 bg-base-300 rounded"></div>
              <div className="space-y-2">
                <div className="h-8 w-full bg-base-300 rounded"></div>
                <div className="h-8 w-3/4 bg-base-300 rounded"></div>
              </div>
              <div className="h-5 w-32 bg-base-300 rounded"></div>
              <div className="h-10 w-48 bg-base-300 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-base-300 rounded"></div>
                <div className="h-3 w-full bg-base-300 rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-16 bg-base-300 rounded"></div>
                <div className="h-10 w-32 bg-base-300 rounded-lg"></div>
              </div>
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

  const soldPercent = Math.min(100, Math.round((voucher.soldQuantity / voucher.totalQuantity) * 100));
  const isOutOfStock = voucher.remainingQuantity === 0;

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-8 pb-32 md:pb-8 flex-1">
      {toastMessage && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success shadow-lg text-sm rounded-xl font-semibold flex items-center gap-2">
            <ShieldCheck size={18} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate("/vouchers")}
        className="btn btn-link btn-xs p-0 text-base-content/60 hover:text-primary mb-6 flex items-center gap-2 text-sm no-underline hover:no-underline font-semibold"
      >
        <ArrowLeft size={16} />
        <span>Quay lại danh sách</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="relative w-full aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden shadow-md bg-base-300 border border-base-200">
            {voucher.imageUrl ? (
              <img
                src={voucher.imageUrl}
                alt={voucher.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-base-300 to-base-200 text-base-content/40 gap-3">
                <div className="w-16 h-16 rounded-full bg-base-100 flex items-center justify-center shadow-sm">
                  <Star size={32} className="text-base-content/30" />
                </div>
                <span className="font-semibold text-sm">Hình ảnh đang được cập nhật</span>
              </div>
            )}

            <span className="absolute top-4 left-4 badge badge-primary font-bold shadow-md px-3 py-1.5 uppercase text-xs tracking-wider">
              {voucher.category === "am-thuc" && "🍜 Ẩm thực"}
              {voucher.category === "lam-dep" && "💆 Làm đẹp"}
              {voucher.category === "du-lich" && "✈️ Du lịch"}
              {voucher.category === "mua-sam" && "🛍️ Mua sắm"}
              {voucher.category === "giai-tri" && "🎮 Giải trí"}
              {!["am-thuc", "lam-dep", "du-lich", "mua-sam", "giai-tri"].includes(voucher.category) && "🎟️ Voucher"}
            </span>

            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`btn btn-circle btn-sm shadow-md bg-base-100 hover:bg-base-200 border-0 ${isFavorite ? "text-error" : "text-base-content/60"
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

          <DetailTabs
            description={voucher.description}
            conditions={voucher.conditions}
            branches={voucher.branches}
          />

          <div id="reviews-section" className="flex flex-col gap-2 mt-4 scroll-mt-24">
            <WriteReviewForm
              eligibility={isAuthenticated ? (voucher?.userEligibility || "NOT_ELIGIBLE") : "NOT_ELIGIBLE"}
              message={isAuthenticated ? "Bạn cần sử dụng voucher này để có thể đánh giá." : "Vui lòng đăng nhập để đánh giá."}
              onSubmit={handleReviewSubmit}
              isSubmitting={isSubmittingReview}
            />

            <ReviewList
              reviews={reviewsQuery.data?.data?.reviews || reviewsQuery.data?.reviews || (Array.isArray(reviewsQuery.data) ? reviewsQuery.data : [])}
              isLoading={reviewsQuery.isLoading}
              error={reviewsQuery.error}
            />
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="card bg-base-100 border border-base-200 p-6 rounded-2xl shadow-sm flex flex-col gap-6 md:sticky md:top-24">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-full">
                {voucher.partnerName}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-base-content mt-3 leading-snug">
                {voucher.name}
              </h1>
            </div>

            <div className="flex items-center gap-1.5 text-sm">
              <div className="flex text-warning">
                <Star size={16} fill="currentColor" />
              </div>
              <span className="font-bold text-base-content">{(Number(voucher.rating) || 0).toFixed(1)}</span>
              <span className="text-base-content/40">|</span>
              <span className="text-base-content/60 font-medium">({voucher.reviewCount} đánh giá)</span>
            </div>

            <div className="divider my-0"></div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">Giá ưu đãi</span>
              <div className="flex items-baseline flex-wrap gap-2 sm:gap-3">
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

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-base-content/60">
                  {isOutOfStock ? "Đã hết lượt ưu đãi" : `Đã bán ${voucher.soldQuantity} / ${voucher.totalQuantity}`}
                </span>
                <span className="text-primary font-bold">{soldPercent}%</span>
              </div>
              <progress
                className={`progress w-full h-2.5 rounded-full ${voucher.remainingQuantity < 10 ? "progress-error" : "progress-primary"
                  }`}
                value={voucher.soldQuantity}
                max={voucher.totalQuantity}
              ></progress>
            </div>

            {!isOutOfStock && (
              <QtySelector
                value={quantity}
                onChange={setQuantity}
                max={voucher.remainingQuantity}
                disabled={isOutOfStock}
              />
            )}

            <div className="hidden md:flex flex-col gap-3 pt-2">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAddingToCart}
                  className="btn btn-outline btn-primary flex-1 btn-md h-12 rounded-xl font-bold transition-all"
                >
                  {isAddingToCart ? <span className="loading loading-spinner loading-sm"></span> : "Thêm vào giỏ hàng"}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock || isAddingToCart}
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

      <StickyBuyBar
        voucher={voucher}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        disabled={isLoading || isAddingToCart}
      />
    </div>
  );
}
