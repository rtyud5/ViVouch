import { BadgePercent, CircleDollarSign, HandCoins, WalletCards } from "lucide-react";

const formatCurrency = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const formatRate = (value) => `${Number(value || 0).toLocaleString("vi-VN", {
  maximumFractionDigits: 2,
})}%`;

const COMMISSION_CARDS = [
  {
    key: "revenue",
    label: "Tổng doanh thu",
    description: "Giá trị đơn hoàn tất trong khoảng thời gian đã chọn.",
    icon: CircleDollarSign,
    tone: "from-violet-500 to-fuchsia-500",
    format: formatCurrency,
  },
  {
    key: "commissionRate",
    label: "Tỷ lệ phí nền tảng",
    description: "Tỷ lệ hiện hành do hệ thống trả về.",
    icon: BadgePercent,
    tone: "from-amber-500 to-orange-500",
    format: formatRate,
  },
  {
    key: "platformFee",
    label: "Phí nền tảng ước tính",
    description: "Số phí được tính từ doanh thu và tỷ lệ hiện hành.",
    icon: HandCoins,
    tone: "from-sky-500 to-cyan-500",
    format: formatCurrency,
  },
  {
    key: "estimatedPartnerRevenue",
    label: "Doanh thu Partner ước tính",
    description: "Số liệu mô phỏng, chưa phải khoản payout thực tế.",
    icon: WalletCards,
    tone: "from-emerald-500 to-teal-500",
    format: formatCurrency,
  },
];

export function CommissionSummaryCards({ summary, isLoading }) {
  if (isLoading) {
    return Array.from({ length: COMMISSION_CARDS.length }).map((_, index) => (
      <div key={index} className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm" aria-label="Đang tải tóm tắt hoa hồng">
        <div className="flex items-start justify-between gap-3">
          <div className="w-full space-y-3">
            <div className="h-4 w-32 rounded bg-base-200 animate-pulse" />
            <div className="h-8 w-36 rounded bg-base-200 animate-pulse" />
          </div>
          <div className="h-11 w-11 shrink-0 rounded-2xl bg-base-200 animate-pulse" />
        </div>
      </div>
    ));
  }

  return COMMISSION_CARDS.map(({ key, label, description, icon: Icon, tone, format }) => (
    <div key={key} className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-base-content/60">{label}</p>
          <p className="mt-2 text-2xl font-bold text-base-content">{format(summary?.[key])}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-md`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-base-content/60">{description}</p>
    </div>
  ));
}
