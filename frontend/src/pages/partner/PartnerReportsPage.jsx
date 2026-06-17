import { useMemo, useState } from "react";
import { BarChart3, CalendarRange, ChevronDown, Clock3, CreditCard, LineChart as LineChartIcon, ShoppingBag, TrendingUp, Users } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

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

const PIE_COLORS = ["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

const formatCurrency = (value) => `${Number(value).toLocaleString("vi-VN")} ₫`;

const createSeededRandom = (seed) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

const getRangeLabel = (days) => RANGE_OPTIONS.find((option) => option.value === days)?.label ?? `${days} ngày`;

const generateAnalytics = (days) => {
  const now = new Date();
  const rand = createSeededRandom(days * 97);
  const chartData = [];
  let revenueTotal = 0;
  let ordersTotal = 0;
  let customersTotal = 0;

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const revenue = Math.round(1400000 + rand() * 2500000 + (days === 7 ? 180000 : 0));
    const orders = Math.round(18 + rand() * 42);
    const customers = Math.max(8, Math.round(orders * (0.65 + rand() * 0.3)));

    revenueTotal += revenue;
    ordersTotal += orders;
    customersTotal += customers;

    chartData.push({
      label: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      revenue,
      orders,
      customers
    });
  }

  const channelData = [
    { name: "Online", value: Math.round(ordersTotal * (0.45 + rand() * 0.08)) },
    { name: "Chi nhánh", value: Math.round(ordersTotal * (0.28 + rand() * 0.06)) },
    { name: "Đối tác", value: Math.round(ordersTotal * (0.16 + rand() * 0.05)) },
    { name: "Khác", value: Math.max(4, ordersTotal - Math.round(ordersTotal * 0.45) - Math.round(ordersTotal * 0.28) - Math.round(ordersTotal * 0.16)) }
  ];

  const conversion = ordersTotal > 0 ? ((customersTotal / ordersTotal) * 100).toFixed(1) : "0.0";

  return {
    chartData,
    channelData,
    summary: {
      revenue: revenueTotal,
      orders: ordersTotal,
      customers: customersTotal,
      conversion: Number(conversion)
    }
  };
};

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

export function PartnerReportsPage() {
  const [rangeDays, setRangeDays] = useState(30);

  const analytics = useMemo(() => generateAnalytics(rangeDays), [rangeDays]);
  const summaryCards = [
    { ...METRICS[0], value: formatCurrency(analytics.summary.revenue) },
    { ...METRICS[1], value: analytics.summary.orders.toLocaleString("vi-VN") },
    { ...METRICS[2], value: analytics.summary.customers.toLocaleString("vi-VN") },
    { ...METRICS[3], value: `${analytics.summary.conversion}%` }
  ];

  return (
    <div className="space-y-6">
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
              Dữ liệu dưới đây đang dùng mock data, nhưng đã được lọc theo 7 ngày, 30 ngày hoặc 3 tháng để
              mô phỏng flow thật của partner portal.
            </p>
          </div>

          <div className="join overflow-hidden rounded-2xl border border-base-300 bg-base-200">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`join-item btn btn-sm border-0 px-4 ${rangeDays === option.value ? "btn-primary text-white" : "btn-ghost"}`}
                onClick={() => setRangeDays(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.chartData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${Math.round(value / 1000000)}M`}
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
          </div>
        </div>

        <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Cơ cấu đơn hàng</h2>
            </div>
            <p className="mt-1 text-sm text-base-content/60">Tỷ trọng theo kênh bán hàng</p>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 12px 40px rgba(15,23,42,0.12)" }}
                />
                <Pie data={analytics.channelData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={4}>
                  {analytics.channelData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-3">
            {analytics.channelData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <span className="text-sm text-base-content/70">{item.name}</span>
                </div>
                <span className="text-sm font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Clock3 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Bảng thống kê hiệu quả</h2>
        </div>

        <div className="overflow-x-auto">
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
              {analytics.chartData.slice(-8).map((row) => (
                <tr key={row.label}>
                  <td className="font-medium">{row.label}</td>
                  <td>{formatCurrency(row.revenue)}</td>
                  <td>{row.orders.toLocaleString("vi-VN")}</td>
                  <td>{row.customers.toLocaleString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
