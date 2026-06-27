import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { KpiCard, AdminTable, AdminStatusBadge } from '../../features/admin/components';
import { useDashboardStats } from '../../features/admin/hooks/useDashboardStats';
import { usePartners } from '../../features/admin/hooks/usePartners';
import { useOrders } from '../../features/admin/hooks/useOrders';

/* ─────────────────── Design tokens (from UI reference) ──────────── */
// Material Design 3 palette — Navy/Amber admin theme
const T = {
  surface:              '#f8f9ff',
  surfaceLowest:        '#ffffff',
  surfaceBright:        '#f8f9ff',
  surfaceContainerLow:  '#eff4ff',
  surfaceContainer:     '#e5eeff',
  surfaceContainerHigh: '#dce9ff',
  onSurface:            '#0b1c30',
  onSurfaceVariant:     '#534434',
  outlineVariant:       '#d8c3ad',
  primary:              '#855300',
  primaryContainer:     '#f59e0b',
  onPrimaryContainer:   '#613b00',
  errorContainer:       '#ffdad6',
  error:                '#ba1a1a',
};

/** Bar fill colors from desktop UI reference (primary opacity ramp + primary-container highlight) */
const CHART_BAR_FILLS = [
  'rgba(133, 83, 0, 0.2)',
  'rgba(133, 83, 0, 0.3)',
  'rgba(133, 83, 0, 0.4)',
  'rgba(133, 83, 0, 0.5)',
  'rgba(133, 83, 0, 0.4)',
  'rgba(133, 83, 0, 0.6)',
  'rgba(133, 83, 0, 0.8)',
  '#855300',
  '#f59e0b',
  '#855300',
];

const getBarFill = (index) => CHART_BAR_FILLS[index % CHART_BAR_FILLS.length];

/* ─────────────────── Helpers ─────────────────── */

/** Format number as Vietnamese currency string */
const formatVND = (n) => Number(n).toLocaleString('vi-VN') + ' ₫';

/** Format as compact (e.g., 124.5M) */
const formatCompact = (n) => {
  const num = Number(n);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(0) + 'K';
  return num.toLocaleString('vi-VN');
};

/* ─────────────────── Chart mock data (revenue chart — no API yet) ── */

// TODO: replace mock data with API /api/admin/stats/revenue?days=30
/** Simple seeded PRNG (mulberry32) — deterministic, NOT for crypto use */
const seededRandom = (seed) => {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
};

const generateRevenueData = () => {
  const data = [];
  const now = new Date();
  const rand = seededRandom(42);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    data.push({
      date: `${dd}/${mm}`,
      revenue: Math.floor(rand() * 3_000_000) + 500_000,
    });
  }
  return data;
};
const revenueData = generateRevenueData();

/** Format relative time from a Date for display */
const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} giờ trước`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD} ngày trước`;
};

/* ─────────────────── Order table columns (desktop reference) ────── */

const orderColumns = [
  {
    key: 'id',
    label: 'Mã đơn',
    width: '110px',
    render: (row) => (
      <span style={{ fontFamily: 'Courier Prime, monospace', color: T.onSurfaceVariant, fontSize: 13 }}>
        {row.id?.slice(0, 8) ?? '—'}
      </span>
    ),
  },
  {
    key: 'customer',
    label: 'Khách hàng',
    render: (row) => (
      <span className="font-medium" style={{ color: T.onSurface }}>
        {row.user?.fullName || row.user?.email || '—'}
      </span>
    ),
  },
  {
    key: 'voucher',
    label: 'Dịch vụ / Voucher',
    render: (row) => (
      <span style={{ color: T.onSurfaceVariant }}>
        {row.items?.[0]?.voucher?.title || '—'}
        {row.items?.length > 1 && ` (+${row.items.length - 1})`}
      </span>
    ),
  },
  {
    key: 'totalAmount',
    label: 'Tổng tiền',
    render: (row) => (
      <span className="font-medium" style={{ color: T.onSurface }}>
        {Number(row.totalAmount).toLocaleString('vi-VN')}đ
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Trạng thái',
    render: (row) => <AdminStatusBadge status={row.status} />,
  },
  {
    key: 'createdAt',
    label: 'Thời gian',
    render: (row) => (
      <span style={{ color: T.onSurfaceVariant, fontSize: 13 }}>
        {formatTimeAgo(row.createdAt)}
      </span>
    ),
  },
  {
    key: 'actions',
    label: '',
    width: '50px',
    render: (row) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const navigate = useNavigate();
      return (
        <button
          type="button"
          className="transition-colors hover:opacity-100 opacity-60 text-[#534434] hover:text-[#855300]"
          aria-label="Xem chi tiết đơn hàng"
          title="Xem chi tiết đơn hàng"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/admin/orders');
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span>
        </button>
      );
    },
  },
];

/* ─────────────────── Skeleton for KPI cards ─────────────────── */

const KpiSkeleton = () => (
  <div
    className="rounded-lg p-4 animate-pulse"
    style={{ background: T.surfaceLowest, border: `1px solid ${T.outlineVariant}` }}
  >
    <div className="h-3 w-24 rounded mb-4" style={{ background: T.surfaceContainer }} />
    <div className="h-8 w-32 rounded" style={{ background: T.surfaceContainer }} />
  </div>
);

/* ─────────────────── Custom Recharts Tooltip ─────────────────── */

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-lg shadow-lg text-sm"
      style={{ background: T.onSurface, color: T.surfaceLowest }}
    >
      <p className="font-semibold">{label}</p>
      <p style={{ color: '#ffb95f' }}>{formatVND(payload[0].value)}</p>
    </div>
  );
};

/* ─────────────────── Partner Card (inline, not a table) ────────── */

const PartnerCard = ({ partner }) => {
  const navigate = useNavigate();
  return (
    <div
      className="rounded p-3 flex flex-col gap-3"
      style={{
        border: `1px solid ${T.outlineVariant}`,
        background: T.surfaceBright,
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4
            className="font-semibold"
            style={{ fontSize: 14, lineHeight: '20px', color: T.onSurface }}
          >
            {partner.businessName || partner.representativeName || '—'}
          </h4>
          <p
            className="mt-0.5"
            style={{ fontSize: 13, lineHeight: '18px', color: T.onSurfaceVariant }}
          >
            {partner.user?.email || '—'} • Đăng ký: {formatTimeAgo(partner.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex gap-2 w-full mt-1">
        <button
          type="button"
          className="flex-1 py-1.5 rounded text-center text-xs font-medium shadow-sm transition-colors"
          style={{
            background: T.primaryContainer,
            color: T.onPrimaryContainer,
          }}
          onClick={() => navigate('/admin/partners')}
        >
          Xử lý
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════ AdminDashboardPage ═══════════════════ */

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { stats, isLoading, isError, dataUpdatedAt } = useDashboardStats();

  // Fetch pending partners (real API data)
  const { data: partnersData, isLoading: partnersLoading } = usePartners({ status: 'PENDING', limit: 3 });
  const pendingPartners = partnersData?.data?.partners ?? [];

  // Fetch recent orders (real API data)
  const { data: ordersData, isLoading: ordersLoading } = useOrders({ limit: 5 });
  const recentOrders = ordersData?.data?.orders ?? [];

  /** Current timestamp for subtitle */
  const timeStr = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">

      {/* ── Page heading ─────────────────────────────────────── */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1
            className="font-bold"
            style={{ fontSize: 24, lineHeight: '32px', letterSpacing: '-0.01em', color: T.onSurface }}
          >
            Tổng quan
          </h1>
          <p className="mt-1" style={{ fontSize: 13, lineHeight: '18px', color: T.onSurfaceVariant }}>
            Cập nhật lúc {timeStr}, Hôm nay
          </p>
        </div>
        <button
          type="button"
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded shadow-sm font-semibold transition-colors"
          style={{
            fontSize: 14,
            lineHeight: '20px',
            background: T.surfaceLowest,
            border: `1px solid ${T.outlineVariant}`,
            color: T.onSurface,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
          Xuất báo cáo
        </button>
      </div>

      {/* ── Error banner ─────────────────────────────────────── */}
      {isError && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
          role="alert"
          style={{ background: T.errorContainer, border: `1px solid ${T.error}33`, color: T.error }}
        >
          <span className="material-symbols-outlined text-lg">error</span>
          Không tải được dữ liệu. Vui lòng thử lại sau.
        </div>
      )}

      {/* ── Section 1: 4 KPI Cards ───────────────────────────── */}
      <section aria-label="KPI metrics">
        {/* Mobile KPI — per mobile UI reference */}
        <div className="grid grid-cols-2 gap-4 mb-6 md:hidden">
          {isLoading ? (
            <>
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
            </>
          ) : (
            <>
              <KpiCard
                label="Doanh thu (Tháng)"
                value={stats ? `${formatCompact(stats.revenueThisMonth)}₫` : '—'}
                trend="+12.5%"
                trendType="up"
              />
              <KpiCard
                label="Đơn hàng mới"
                value={stats?.ordersToday?.toLocaleString('vi-VN') ?? '—'}
                trend="+5.2%"
                trendType="up"
              />
              <KpiCard
                label="Đối tác T.Cực"
                value={stats?.activePartners?.toLocaleString('vi-VN') ?? '—'}
                trend="0.0%"
                trendType="neutral"
              />
              <KpiCard
                label="Cần duyệt"
                value={pendingPartners.length.toLocaleString('vi-VN')}
                trend="Cần xử lý ngay"
                trendType="down"
              />
            </>
          )}
        </div>

        {/* Desktop KPI — per desktop UI reference */}
        <div className="hidden md:grid md:grid-cols-4 gap-6 mb-6">
          {isLoading ? (
            <>
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
            </>
          ) : (
            <>
              <KpiCard
                label="Người dùng"
                value={stats?.totalUsers?.toLocaleString('vi-VN') ?? '—'}
                trend="+12%"
                trendType="up"
              />
              <KpiCard
                label="Đối tác"
                value={stats?.activePartners?.toLocaleString('vi-VN') ?? '—'}
                trend="+2"
                trendType="up"
              />
              <KpiCard
                label="Doanh thu tháng"
                value={stats ? formatCompact(stats.revenueThisMonth) : '—'}
                trend="+8.4%"
                trendType="up"
              />
              <KpiCard
                label="Đơn hàng hôm nay"
                value={stats?.ordersToday?.toLocaleString('vi-VN') ?? '—'}
                trend="-3%"
                trendType="down"
              />
            </>
          )}
        </div>
      </section>

      {/* ── Section 2: Chart + Partners sidebar ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Main Chart — span 2 cols on desktop */}
        <section aria-label="Revenue chart" className="lg:col-span-2">
          <div
            className="rounded-lg p-5 shadow-sm h-full"
            style={{ background: T.surfaceLowest, border: `1px solid ${T.outlineVariant}` }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                className="font-semibold flex items-center gap-2"
                style={{ fontSize: 18, lineHeight: '28px', color: T.onSurface }}
              >
                Doanh thu (30 ngày qua)
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: T.surfaceContainerHigh, color: T.onSurfaceVariant }}>
                  Dữ liệu mẫu
                </span>
              </h2>
              <button
                type="button"
                className="transition-colors"
                style={{ color: T.onSurfaceVariant }}
                aria-label="Tùy chọn biểu đồ"
                title="Tùy chọn biểu đồ"
              >
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
            <div className="h-[280px]">
              {/* TODO: replace mock data with API /api/admin/stats/revenue?days=30 */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.surfaceContainerHigh} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: T.onSurfaceVariant }}
                    tickLine={false}
                    axisLine={{ stroke: T.outlineVariant }}
                    interval={4}
                  />
                  <YAxis
                    tickFormatter={(v) => (v / 1_000_000).toFixed(1) + 'M'}
                    tick={{ fontSize: 11, fill: T.onSurfaceVariant }}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                  />
                  <Tooltip content={<RevenueTooltip />} cursor={{ fill: T.surface }} />
                  <Bar
                    dataKey="revenue"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={20}
                  >
                    {revenueData.map((_, index) => (
                      <Cell key={`bar-${index}`} fill={getBarFill(index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Pending partners sidebar — card layout, NOT table */}
        <section aria-label="Pending partners">
          <div
            className="rounded-lg p-5 shadow-sm flex flex-col h-full"
            style={{ background: T.surfaceLowest, border: `1px solid ${T.outlineVariant}` }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                className="font-semibold"
                style={{ fontSize: 18, lineHeight: '28px', color: T.onSurface }}
              >
                Đối tác chờ duyệt
              </h2>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: T.errorContainer, color: T.error }}
              >
                {pendingPartners.length} Mới
              </span>
            </div>

            {/* Partner cards */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
              {partnersLoading ? (
                <div className="text-center py-4" style={{ color: T.onSurfaceVariant, fontSize: 13 }}>Đang tải...</div>
              ) : pendingPartners.length === 0 ? (
                <div className="text-center py-4" style={{ color: T.onSurfaceVariant, fontSize: 13 }}>Không có đối tác chờ duyệt</div>
              ) : (
                pendingPartners.map((p) => (
                  <PartnerCard key={p.id} partner={p} />
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate('/admin/partners')}
              className="w-full mt-4 py-2 text-center rounded transition-colors hover:opacity-80"
              style={{ fontSize: 12, lineHeight: '16px', letterSpacing: '0.02em', fontWeight: 500, color: T.primary }}
            >
              Xem tất cả
            </button>
          </div>
        </section>
      </div>

      {/* ── Section 3: Full-width orders table ───────────────── */}
      <section aria-label="Recent orders" className="mb-8">
        <div
          className="rounded-lg shadow-sm overflow-hidden"
          style={{ background: T.surfaceLowest, border: `1px solid ${T.outlineVariant}` }}
        >
          {/* Table header bar */}
          <div
            className="p-5 flex justify-between items-center"
            style={{ borderBottom: `1px solid ${T.outlineVariant}`, background: T.surfaceLowest }}
          >
            <h2
              className="font-semibold"
              style={{ fontSize: 18, lineHeight: '28px', color: T.onSurface }}
            >
              Đơn hàng mới nhất
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                className="p-1.5 rounded transition-colors"
                style={{ border: `1px solid ${T.outlineVariant}`, color: T.onSurfaceVariant }}
                aria-label="Lọc đơn hàng"
                title="Lọc đơn hàng"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>filter_list</span>
              </button>
            </div>
          </div>

          <AdminTable
            columns={orderColumns}
            data={recentOrders}
            loading={isLoading || ordersLoading}
            emptyMessage="Chưa có đơn hàng nào"
          />

          {/* Footer */}
          <div
            className="p-3 flex justify-center"
            style={{ borderTop: `1px solid ${T.outlineVariant}`, background: T.surfaceBright }}
          >
            <button
              type="button"
              onClick={() => navigate('/admin/orders')}
              className="transition-colors hover:opacity-80"
              style={{ fontSize: 12, lineHeight: '16px', letterSpacing: '0.02em', fontWeight: 500, color: T.onSurfaceVariant }}
            >
              Xem tất cả đơn hàng
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}