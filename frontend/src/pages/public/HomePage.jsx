import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { VoucherCard } from "../../components/voucher/VoucherCard";
import { VoucherCardSkeleton } from "../../components/voucher/VoucherCardSkeleton";
import { mockVouchers, CATEGORIES } from "../../data/mockVouchers";

// ─────────────────────────────────────────────
// Countdown Timer — dummy 12-hour countdown
// ─────────────────────────────────────────────

/**
 * Returns how many seconds remain until end-of-day (midnight).
 * This acts as a "flash sale countdown" timer.
 */
function getSecondsUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight - now) / 1000);
}

/**
 * Pads a number with a leading zero if < 10 (e.g. 9 → "09").
 */
function pad(n) {
  return String(n).padStart(2, "0");
}

/**
 * CountdownTimer — shows HH:MM:SS remaining until midnight.
 * Ticks every second via setInterval.
 */
function CountdownTimer() {
  const [seconds, setSeconds] = useState(getSecondsUntilMidnight);

  useEffect(() => {
    // Decrement every 1000ms
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          // Reset when it hits zero (next day)
          return getSecondsUntilMidnight();
        }
        return prev - 1;
      });
    }, 1000);

    // Clean up on unmount so we don't leak the interval
    return () => clearInterval(timer);
  }, []);

  const hh = pad(Math.floor(seconds / 3600));
  const mm = pad(Math.floor((seconds % 3600) / 60));
  const ss = pad(seconds % 60);

  return (
    <div className="inline-flex items-center gap-1 bg-base-100/90 backdrop-blur rounded-xl px-4 py-2 shadow text-base-content">
      {/* Clock icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-4 h-4 text-error shrink-0"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
        />
      </svg>

      {/* HH */}
      <span className="font-bold text-error text-lg tabular-nums">{hh}</span>
      <span className="font-bold text-base-content/60">:</span>

      {/* MM */}
      <span className="font-bold text-error text-lg tabular-nums">{mm}</span>
      <span className="font-bold text-base-content/60">:</span>

      {/* SS */}
      <span className="font-bold text-error text-lg tabular-nums">{ss}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Hero Banner
// ─────────────────────────────────────────────

function HeroBanner() {
  return (
    <section
      className="relative rounded-2xl overflow-hidden min-h-52 flex items-end p-6 md:p-10 mb-6"
      aria-label="Banner khuyến mãi hôm nay"
    >
      {/* Background image */}
      <img
        src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80"
        alt="Ưu đãi hôm nay"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />

      {/* Dark gradient overlay so text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      {/* Content on top of image */}
      <div className="relative z-10 text-white">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-1 drop-shadow">
          Ưu đãi hôm nay
        </h1>
        <p className="text-sm md:text-base text-white/80 mb-4">
          Săn ngàn deal hot, tiết kiệm tối đa cho mọi nhu cầu của bạn.
        </p>

        {/* Countdown timer */}
        <CountdownTimer />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Category Tabs
// ─────────────────────────────────────────────

/**
 * CategoryTabs — pill-style tabs to filter the voucher grid.
 *
 * @param {string}   activeCategory  - currently selected category key
 * @param {Function} onChange        - called with new category key on click
 */
function CategoryTabs({ activeCategory, onChange }) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none mb-6"
      role="tablist"
      aria-label="Danh mục voucher"
    >
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.key;
        return (
          <button
            key={cat.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat.key)}
            className={`btn btn-sm rounded-full whitespace-nowrap transition-all
              ${isActive
                ? "btn-primary shadow-md"
                : "btn-ghost border border-base-300 hover:border-primary hover:text-primary"
              }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Voucher Grid
// ─────────────────────────────────────────────

/**
 * VoucherGrid — responsive 2-col (mobile) / 4-col (desktop) grid.
 *
 * @param {Array}   vouchers  - array of voucher objects to render
 * @param {boolean} isLoading - when true, renders 8 skeleton cards
 */
function VoucherGrid({ vouchers, isLoading }) {
  // While loading, render 8 skeleton placeholder cards
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <VoucherCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // No results after filtering
  if (vouchers.length === 0) {
    return (
      <div className="text-center py-16 text-base-content/50">
        <p className="text-4xl mb-3">🎟️</p>
        <p className="font-semibold">Không có voucher nào trong danh mục này</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {vouchers.map((voucher) => (
        <VoucherCard key={voucher.id} voucher={voucher} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// HomePage — main export
// ─────────────────────────────────────────────

/**
 * HomePage
 *
 * Sections:
 *  1. HeroBanner  — countdown + background image
 *  2. CategoryTabs — filter pills
 *  3. "Deal Nổi Bật" heading + "Xem tất cả" link
 *  4. VoucherGrid  — 2-col mobile / 4-col desktop
 *
 * Uses mock data and simulates a 1.5s loading delay so the
 * skeleton state is visible during development.
 */
export function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate a network request delay so the skeleton is visible
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Filter vouchers by active category
  const filteredVouchers =
    activeCategory === "all"
      ? mockVouchers
      : mockVouchers.filter((v) => v.category === activeCategory);

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-6">
      {/* 1. Hero banner with countdown */}
      <HeroBanner />

      {/* 2. Category filter tabs */}
      <CategoryTabs activeCategory={activeCategory} onChange={setActiveCategory} />

      {/* 3. Section heading */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-base-content">Deal Nổi Bật</h2>
        <Link
          to="/vouchers"
          className="text-sm text-primary font-semibold hover:underline"
        >
          Xem tất cả
        </Link>
      </div>

      {/* 4. Voucher grid */}
      <VoucherGrid vouchers={filteredVouchers} isLoading={isLoading} />
    </main>
  );
}
