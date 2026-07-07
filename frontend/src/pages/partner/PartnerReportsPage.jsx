import { useState } from "react";
import { BarChart3, CalendarRange, ChevronDown, Clock3, CreditCard, LineChart as LineChartIcon, ShoppingBag, TrendingUp, Users } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { usePartnerReports } from "../../features/partner/hooks/usePartnerReports";

const RANGE_OPTIONS = [
  { value: 7, label: "7 ngày" },
  { value: 30, label: "30 ngày" },
  { value: 90, label: "3 tháng" }
];

const METRICS = [
  { key: "revenue", label: "Doanh thu", icon: CreditCard, tone: "from-violet-500 to-fuchsia-500" },
  { key: "orders", label: "Đơn hàng", icon: ShoppingBag, tone: "from-sky-500 to-cyan-500" },
  { key: "customers", label: "Khách mua", icon: Users, tone: "from-emerald-500 to-teal-500" },
  { key: "conversion", label: "Tỷ lệ chuyển đổi", icon: TrendingUp, tone: "from-amber-500 to-orange-500" }
];

const formatCurrency = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const getRangeLabel = (days) => RANGE_OPTIONS.find((option) => option.value === days)?.label ?? `${days} ngày`;

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-base-content/60">{label}</p>
          <p className="mt-2 text-2xl font-bold text-base-content">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-md`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3 w-full">
          <div className="h-4 w-24 bg-base-200 rounded animate-pulse"></div>
          <div className="h-8 w-32 bg-base-200 rounded animate-pulse"></div>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-base-200 animate-pulse flex-shrink-0"></div>
      </div>
    </div>
  );
}

export function PartnerReportsPage() {
  const [rangeDays, setRangeDays] = useState(30);

  const { data: reportData, isLoading, isFetching, isError, error, refetch } = usePartnerReports(rangeDays);

  const summary = reportData?.data?.summary || { revenue: 0, orders: 0, customers: 0, conversion: 0 };
  const chartData = reportData?.data?.revenueByDay || [];
  const topVouchers = reportData?.data?.topVouchers || [];

  const summaryCards = [
    { ...METRICS[0], value: formatCurrency(summary?.revenue || 0) },
    { ...METRICS[1], value: (summary?.orders || 0).toLocaleString("vi-VN") },
    { ...METRICS[2], value: (summary?.customers || 0).toLocaleString("vi-VN") },
    { ...METRICS[3], value: `${Number(summary?.conversion || 0).toFixed(1)}%` }
  ];

  return (
    <div className="space-y-6">
      {/* Error banner — hiển thị khi API thất bại, không che toàn bộ trang */}
      {isError && !isLoading && (
        <div className="alert alert-error shadow-sm rounded-2xl">
          <span className="font-medium">
            {error?.response?.data?.message || "Không tải được báo cáo. Vui lòng thử lại."}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-ghost ml-auto"
            onClick={() => refetch()}
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="rounded-[2rem] border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <BarChart3 className="h-4 w-4" />
              Partner Analytics
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-base-content">
              Báo cáo hiệu quả theo thời gian
            </h1>
            <p className="mt-2 text-sm leading-6 text-base-content/60">
              Dữ liệu được cập nhật theo thời gian thực.
            </p>
          </div>

          <div className="join overflow-hidden rounded-2xl border border-base-300 bg-base-200">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`join-item btn btn-sm border-0 px-4 ${rangeDays === option.value ? "btn-primary text-white" : "btn-ghost"}`}
                onClick={() => setRangeDays(option.value)}
                disabled={isLoading || isFetching}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(isLoading || isFetching)
          ? Array.from({ length: 4 }).map((_, idx) => <StatCardSkeleton key={idx} />)
          : summaryCards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Xu hướng doanh thu</h2>
              </div>
              <p className="mt-1 text-sm text-base-content/60">
                Mốc hiện tại: {getRangeLabel(rangeDays)} gần nhất
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-base-200 px-3 py-2 text-sm text-base-content/70">
              <CalendarRange className="h-4 w-4" />
              Cập nhật theo lựa chọn
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          <div className="h-[320px]">
            {(isLoading || isFetching) ? (
              <div className="w-full h-full bg-base-200 rounded-xl animate-pulse"></div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.18)" />
                  <XAxis 
                    dataKey={(row) => row.label || row.date} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12 }} 
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value >= 1000000 ? `${Math.round(value / 1000000)}M` : value}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                    contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 12px 40px rgba(15,23,42,0.12)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: "#7c3aed", stroke: "#fff", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-base-content/60 gap-2">
                <LineChartIcon className="h-10 w-10 opacity-20" />
                <p>Chưa có dữ liệu giao dịch</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Top Vouchers</h2>
            </div>
            <p className="mt-1 text-sm text-base-content/60">Voucher hiệu quả nhất</p>
          </div>

          <div className="h-[280px] overflow-y-auto pr-2">
            {(isLoading || isFetching) ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-12 w-full bg-base-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : topVouchers.length > 0 ? (
              <div className="space-y-4">
                {topVouchers.map((item, index) => (
                  <div key={item.id || index} className="flex flex-col gap-1 border-b border-base-200 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-semibold text-sm line-clamp-2">{item.name || item.title || item.code}</span>
                      <span className="text-sm font-bold text-primary whitespace-nowrap">{formatCurrency(item.revenue || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-base-content/60">
                      <span>{item.orders || item.count || 0} lượt dùng</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-base-content/60 gap-2">
                <ShoppingBag className="h-10 w-10 opacity-20" />
                <p>Chưa có voucher nào</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Clock3 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Bảng thống kê hiệu quả</h2>
        </div>

        <div className="overflow-x-auto">
          {(isLoading || isFetching) ? (
            <div className="space-y-2 mt-4">
               {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="h-10 w-full bg-base-200 rounded animate-pulse"></div>
                ))}
            </div>
          ) : chartData.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Doanh thu</th>
                  <th>Đơn hàng</th>
                  <th>Khách mua</th>
                </tr>
              </thead>
              <tbody>
                {chartData.slice(-8).map((row, index) => (
                  <tr key={row.label || row.date || index}>
                    <td className="font-medium">{row.label || row.date}</td>
                    <td>{formatCurrency(row.revenue)}</td>
                    <td>{(row.orders || 0).toLocaleString("vi-VN")}</td>
                    <td>{(row.customers || 0).toLocaleString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-6 text-base-content/60">
              Không có dữ liệu
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
