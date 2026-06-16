import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency";

// Fallback image shown when imageUrl is null or fails to load
const PLACEHOLDER_IMAGE = "https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Image";

/**
 * Calculates the discount percentage between originalPrice and salePrice.
 *
 * @param {number} originalPrice
 * @param {number} salePrice
 * @returns {number} Discount percent (0–100), rounded down
 */
function calcDiscountPercent(originalPrice, salePrice) {
  const orig = Number(originalPrice);
  const sale = Number(salePrice);
  if (Number.isNaN(orig) || orig <= 0) return 0;
  if (Number.isNaN(sale) || sale < 0 || sale >= orig) return 0;
  if (sale === 0) return 100; // Free voucher
  const percent = ((orig - sale) / orig) * 100;
  return Math.floor(percent);
}

/**
 * Renders the star rating row.
 *
 * @param {number} rating  - e.g. 4.8
 * @param {number} count   - review count e.g. 120
 */
function RatingRow({ rating, count }) {
  return (
    <div className="flex items-center gap-1 text-xs text-base-content/70">
      {/* Single filled star */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-3.5 h-3.5 text-warning"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="font-semibold text-base-content">{(Number(rating) || 0).toFixed(1)}</span>
      <span>({count})</span>
    </div>
  );
}

/** Map category key → nhãn hiển thị trên card tìm kiếm */
const CATEGORY_LABELS = {
  "am-thuc": "Ẩm thực",
  "lam-dep": "Làm đẹp",
  "du-lich": "Du lịch",
  "mua-sam": "Mua sắm",
  "giai-tri": "Giải trí",
};

/**
 * VoucherCard — reusable card component for the voucher marketplace.
 *
 * Props:
 *  voucher {object}
 *  variant {string} — "home" (mặc định) | "search" (trang kết quả tìm kiếm)
 */
export function VoucherCard({ voucher, variant = "home", disableClick = false }) {
  const navigate = useNavigate();

  const {
    id,
    name,
    partnerName,
    category,
    location,
    imageUrl,
    originalPrice,
    salePrice,
    rating,
    reviewCount,
    totalQuantity,
    soldQuantity,
  } = voucher;

  const discountPercent = calcDiscountPercent(originalPrice, salePrice);
  const categoryLabel =
    voucher.categoryLabel ?? CATEGORY_LABELS[category] ?? partnerName;

  // How many vouchers remain (never below 0)
  const remaining = Math.max(totalQuantity - soldQuantity, 0);

  // Progress: what fraction has been SOLD (fill = sold / total)
  const soldPercent =
    totalQuantity > 0 ? Math.round((soldQuantity / totalQuantity) * 100) : 0;

  // Low stock threshold: ≤ 10% remaining → show "warning" color
  const isLowStock = remaining <= Math.ceil(totalQuantity * 0.1);

  function handleClick() {
    navigate(`/vouchers/${id}`);
  }

  function handleImageError(e) {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  }

  function handleBuyClick(e) {
    e.stopPropagation();
    navigate(`/vouchers/${id}`);
  }

  // ── Variant search — theo vivouch_search_results mockup ──────────────
  if (variant === "search") {
    return (
      <article
        className={`bg-surface rounded-xl shadow-lg overflow-hidden flex flex-col group relative border border-surface-variant/50 transition-shadow duration-300 ${disableClick ? "cursor-default" : "hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] cursor-pointer"}`}
        onClick={disableClick ? undefined : handleClick}
        role={disableClick ? undefined : "button"}
        tabIndex={disableClick ? undefined : 0}
        onKeyDown={disableClick ? undefined : (e) => e.key === "Enter" && handleClick()}
        aria-label={`Xem voucher: ${name}`}
      >
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={imageUrl || PLACEHOLDER_IMAGE}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={handleImageError}
            loading="lazy"
          />
          {discountPercent > 0 && (
            <div className="absolute top-2 right-2 bg-secondary text-on-secondary px-2 py-1 rounded-md font-label-md text-label-md z-10 shadow-md">
              -{discountPercent}%
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="text-on-surface-variant text-[12px] font-semibold mb-1 uppercase tracking-wider">
            {categoryLabel}
          </div>
          <h3 className="font-headline-md text-[18px] leading-tight text-on-surface mb-2 line-clamp-2">
            {name}
          </h3>
          <div className="flex items-center gap-1 text-on-surface-variant text-[13px] mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 text-tertiary shrink-0"
              aria-hidden="true"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span>{location ?? "Nhiều chi nhánh"}</span>
          </div>

          <div className="mt-auto pt-3 border-t border-surface-variant flex justify-between items-end">
            <div>
              {originalPrice > salePrice && salePrice > 0 && (
                <div className="text-on-surface-variant text-[12px] line-through">
                  {formatCurrency(originalPrice)}
                </div>
              )}
              {salePrice > 0 ? (
                <div className="font-price-display text-price-display text-primary">
                  {formatCurrency(salePrice)}
                </div>
              ) : (
                <div className="font-price-display text-price-display text-primary">
                  Miễn phí
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={disableClick ? undefined : handleBuyClick}
              disabled={disableClick}
              className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-colors shadow-sm ${disableClick ? "bg-surface-variant text-on-surface-variant cursor-not-allowed" : "bg-primary text-on-primary hover:bg-primary-fixed-dim"}`}
            >
              Mua ngay
            </button>
          </div>
        </div>
      </article>
    );
  }

  // ── Variant home — trang chủ ───────────────────────────────────────────
  return (
    <div
      className={`card bg-base-100 shadow-sm transition-shadow duration-200 overflow-hidden ${disableClick ? "cursor-default" : "hover:shadow-md cursor-pointer group"}`}
      onClick={disableClick ? undefined : handleClick}
      // Keyboard accessibility
      role={disableClick ? undefined : "button"}
      tabIndex={disableClick ? undefined : 0}
      onKeyDown={disableClick ? undefined : (e) => e.key === "Enter" && handleClick()}
      aria-label={`Xem voucher: ${name}`}
    >
      {/* ── Image + discount badge ── */}
      <figure className="relative overflow-hidden h-44">
        <img
          src={imageUrl || PLACEHOLDER_IMAGE}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
          loading="lazy"
        />

        {/* Discount badge — only show if there is a discount */}
        {discountPercent > 0 && (
          <span className="absolute top-2 right-2 badge badge-error text-white font-bold text-xs px-2 py-1 rounded">
            -{discountPercent}%
          </span>
        )}
      </figure>

      {/* ── Card body ── */}
      <div className="card-body p-3 gap-1">
        {/* Rating */}
        <RatingRow rating={rating} count={reviewCount} />

        {/* Voucher name */}
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-base-content">
          {name}
        </h3>

        {/* Partner name */}
        <p className="text-xs text-base-content/60 truncate">{partnerName}</p>

        {/* ── Price row ── */}
        <div className="flex items-baseline gap-2 mt-1">
          {salePrice !== undefined && salePrice !== null && salePrice > 0 ? (
            <>
              {/* Sale price */}
              <span className="text-primary font-bold text-sm">
                {formatCurrency(salePrice)}
              </span>
              {/* Original price — strikethrough */}
              {originalPrice > salePrice && (
                <span className="text-base-content/40 text-xs line-through">
                  {formatCurrency(originalPrice)}
                </span>
              )}
            </>
          ) : salePrice === 0 ? (
            /* Free voucher */
            <span className="text-success font-bold text-sm">Miễn phí</span>
          ) : null}
        </div>

        {/* ── Progress bar ── */}
        <div className="mt-2">
          <progress
            className={`progress w-full h-1.5 ${isLowStock ? "progress-error" : "progress-primary"
              }`}
            value={soldPercent}
            max={100}
            aria-label={`Đã bán ${soldPercent}%`}
          />

          {/* Status text below bar */}
          <p className="text-xs mt-0.5">
            {remaining === 0 ? (
              <span className="text-error font-medium">Hết hàng</span>
            ) : isLowStock ? (
              <span className="text-warning font-medium">
                Còn lại {remaining} voucher
              </span>
            ) : (
              <span className="text-base-content/50">
                Đã bán {soldQuantity}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
