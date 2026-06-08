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
  if (!originalPrice || originalPrice <= 0) return 0;
  if (salePrice <= 0) return 100; // Free voucher
  const percent = ((originalPrice - salePrice) / originalPrice) * 100;
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
      <span className="font-semibold text-base-content">{rating.toFixed(1)}</span>
      <span>({count})</span>
    </div>
  );
}

/**
 * VoucherCard — reusable card component for the voucher marketplace.
 *
 * Props:
 *  voucher {object} — voucher product data with these fields:
 *    id            {string}
 *    name          {string}
 *    partnerName   {string}
 *    imageUrl      {string|null}
 *    originalPrice {number}  VND
 *    salePrice     {number}  VND
 *    rating        {number}  0–5
 *    reviewCount   {number}
 *    totalQuantity {number}
 *    soldQuantity  {number}
 */
export function VoucherCard({ voucher }) {
  const navigate = useNavigate();

  const {
    id,
    name,
    partnerName,
    imageUrl,
    originalPrice,
    salePrice,
    rating,
    reviewCount,
    totalQuantity,
    soldQuantity,
  } = voucher;

  const discountPercent = calcDiscountPercent(originalPrice, salePrice);

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
    // If image fails to load, swap to placeholder — prevents broken img icon
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  }

  return (
    <div
      className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer group"
      onClick={handleClick}
      // Keyboard accessibility
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
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
          {salePrice > 0 ? (
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
          ) : (
            /* Free voucher */
            <span className="text-success font-bold text-sm">Miễn phí</span>
          )}
        </div>

        {/* ── Progress bar ── */}
        <div className="mt-2">
          <progress
            className={`progress w-full h-1.5 ${
              isLowStock ? "progress-error" : "progress-primary"
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
