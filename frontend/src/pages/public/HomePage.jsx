import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { VoucherCard } from "../../components/voucher/VoucherCard";
import { VoucherCardSkeleton } from "../../components/voucher/VoucherCardSkeleton";
import { ErrorRetryPanel } from "../../components/common";
import { useVouchers, useCategories } from "../../features/vouchers/hooks";
import { buildVoucherQueryParams } from "../../features/vouchers/utils/buildVoucherQueryParams";
import { mapVoucherForCard } from "../../features/vouchers/utils/mapVoucherForCard";

function getSecondsUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight - now) / 1000);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function CountdownTimer() {
  const [seconds, setSeconds] = useState(getSecondsUntilMidnight);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          return getSecondsUntilMidnight();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hh = pad(Math.floor(seconds / 3600));
  const mm = pad(Math.floor((seconds % 3600) / 60));
  const ss = pad(seconds % 60);

  return (
    <div className="inline-flex items-center gap-1 bg-base-100/90 backdrop-blur rounded-xl px-4 py-2 shadow text-base-content">
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
      <span className="font-bold text-error text-lg tabular-nums">{hh}</span>
      <span className="font-bold text-base-content/60">:</span>
      <span className="font-bold text-error text-lg tabular-nums">{mm}</span>
      <span className="font-bold text-base-content/60">:</span>
      <span className="font-bold text-error text-lg tabular-nums">{ss}</span>
    </div>
  );
}

function HeroBanner() {
  return (
    <section
      className="relative rounded-2xl overflow-hidden min-h-52 flex items-end p-6 md:p-10 mb-6"
      aria-label="Banner khuyến mãi hôm nay"
    >
      <img
        src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80"
        alt="Ưu đãi hôm nay"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="relative z-10 text-white">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-1 drop-shadow">
          Ưu đãi hôm nay
        </h1>
        <p className="text-sm md:text-base text-white/80 mb-4">
          Săn ngàn deal hot, tiết kiệm tối đa cho mọi nhu cầu của bạn.
        </p>
        <CountdownTimer />
      </div>
    </section>
  );
}

function CategoryTabs({ activeCategory, onChange, categories, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-8 w-24 rounded-full shrink-0" />
        ))}
      </div>
    );
  }

  const tabs = [
    { key: "all", label: "Tất cả" },
    ...categories.map((cat) => ({ key: cat.slug, label: cat.name })),
  ];

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none mb-6"
      role="tablist"
      aria-label="Danh mục voucher"
    >
      {tabs.map((cat) => {
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

function VoucherGrid({ vouchers, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <VoucherCardSkeleton key={i} />
        ))}
      </div>
    );
  }

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

export function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const isCategoryFilterActive = activeCategory && activeCategory !== "all";
  const shouldWaitCategories = isCategoryFilterActive && categoriesLoading;

  const voucherParams = useMemo(
    () =>
      buildVoucherQueryParams({
        category: activeCategory,
        page: 1,
        limit: 8,
        categories,
      }),
    [activeCategory, categories]
  );

  const {
    vouchers: rawVouchers,
    isLoading: vouchersLoading,
    error: vouchersError,
  } = useVouchers(voucherParams, { enabled: !shouldWaitCategories });

  const vouchers = useMemo(
    () => rawVouchers.map((v) => mapVoucherForCard(v, categories)).filter(Boolean),
    [rawVouchers, categories]
  );

  const showVouchersLoading = vouchersLoading || shouldWaitCategories;

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-6">
      <HeroBanner />

      <CategoryTabs
        activeCategory={activeCategory}
        onChange={setActiveCategory}
        categories={categories || []}
        isLoading={categoriesLoading}
      />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-base-content">Deal Nổi Bật</h2>
        <Link
          to="/vouchers"
          className="text-sm text-primary font-semibold hover:underline"
        >
          Xem tất cả
        </Link>
      </div>

      {vouchersError || categoriesError ? (
        <ErrorRetryPanel 
          title="Không thể tải danh sách voucher" 
          description="Dữ liệu voucher tạm thời không truy cập được. Vui lòng thử lại." 
          onRetry={() => window.location.reload()} 
        />
      ) : (
        <VoucherGrid vouchers={vouchers} isLoading={showVouchersLoading} />
      )}
    </main>
  );
}
