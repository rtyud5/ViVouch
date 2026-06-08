/**
 * VoucherCardSkeleton
 *
 * Displayed while vouchers are loading.
 * Uses animate-pulse (Tailwind) to give a shimmer effect.
 * No props needed — renders a fixed placeholder layout.
 */
export function VoucherCardSkeleton() {
  return (
    <div className="card bg-base-100 shadow-sm overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="h-44 bg-base-300 w-full" />

      <div className="card-body p-3 gap-2">
        {/* Rating row */}
        <div className="h-3 bg-base-300 rounded w-24" />

        {/* Title — two lines */}
        <div className="h-4 bg-base-300 rounded w-full" />
        <div className="h-4 bg-base-300 rounded w-3/4" />

        {/* Partner name */}
        <div className="h-3 bg-base-300 rounded w-1/2" />

        {/* Price row */}
        <div className="flex gap-2 mt-1">
          <div className="h-5 bg-base-300 rounded w-24" />
          <div className="h-4 bg-base-300 rounded w-16" />
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-base-300 rounded-full w-full mt-1" />
        <div className="h-3 bg-base-300 rounded w-20" />
      </div>
    </div>
  );
}
