import { useMemo, useState } from 'react';
import {
  Ticket,
  ShoppingCart,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { getPartnerVouchers } from '../../features/partner/api/vouchers.api';

// Sub-components
const KpiCard = ({ title, value, icon: Icon, trend, trendLabel, iconBgClass, iconTextClass, isLoading }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        {isLoading
          ? <div className="h-8 w-20 bg-gray-100 animate-pulse rounded mt-1" />
          : <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        }
      </div>
      <div className={`p-3 rounded-xl ${iconBgClass} transition-transform group-hover:scale-110`}>
        <Icon className={`w-6 h-6 ${iconTextClass}`} />
      </div>
    </div>
    {trend && (
      <div className="flex items-center text-sm">
        <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
        <span className="text-emerald-500 font-semibold">{trend}</span>
        <span className="text-gray-400 ml-2">{trendLabel}</span>
      </div>
    )}
  </div>
);

/** Badge hiển thị rõ ràng rằng dữ liệu là mẫu minh họa */
function MockDataBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
      Dữ liệu mẫu
    </span>
  );
}

// Mock data chỉ dùng cho chart và timeline (chưa có API thật)

const MOCK_CHART_DATA = [
  { date: 'Ngày 1', revenue: 450000 },
  { date: 'Ngày 5', revenue: 680000 },
  { date: 'Ngày 10', revenue: 520000 },
  { date: 'Ngày 15', revenue: 890000 },
  { date: 'Ngày 20', revenue: 720000 },
  { date: 'Ngày 25', revenue: 950000 },
  { date: 'Ngày 30', revenue: 1100000 },
];

const MOCK_TIMELINE = [
  { id: 1, type: 'order',    content: 'Voucher "Buffet Haidilao" nhận được đơn hàng mới',  time: '2 phút trước' },
  { id: 2, type: 'used',     content: 'Khách hàng đã sử dụng voucher "Sushi Hokkaido"',     time: '15 phút trước' },
  { id: 3, type: 'approved', content: 'Voucher "Combo BBQ" vừa được duyệt',                 time: '1 giờ trước' },
  { id: 4, type: 'order',    content: 'Voucher "GongCha" nhận được đơn hàng mới',           time: '3 giờ trước' },
];

// Main Component

export function PartnerDashboardPage() {
  const navigate = useNavigate();
  // B103: chart range selector state (chart data is mock; state tracks selected label)
  const [chartRange, setChartRange] = useState('30d');

  // Fetch profile partner
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['partnerProfile'],
    queryFn: async () => {
      const response = await apiClient.get('/partner/profile');
      return response.data?.data ?? response.data;
    },
    retry: false,
  });

  // Fetch toàn bộ vouchers để tính KPI ở FE
  // Dùng limit=48 (giới hạn tối đa của API) để lấy đủ dữ liệu KPI
  const { data: vouchersData, isLoading: isVouchersLoading } = useQuery({
    queryKey: ['partnerVouchers', { page: 1, limit: 48 }],
    queryFn: () => getPartnerVouchers({ page: 1, limit: 48 }),
  });

  const isLoading = isProfileLoading || isVouchersLoading;
  const partnerName = profileData?.businessName || profileData?.name || 'Đối tác';

  // Tính KPI từ dữ liệu voucher trả về bởi API
  const kpi = useMemo(() => {
    const vouchers = vouchersData?.data ?? [];

    const onSaleCount    = vouchers.filter(v => v.status === 'ON_SALE').length;
    const totalSoldQty   = vouchers.reduce((sum, v) => sum + (v.soldQty   || 0), 0);
    const totalUsedCount = vouchers.reduce((sum, v) => sum + (v.usedCount || 0), 0);
    // Doanh thu ước tính = tổng (số đã bán × giá bán)
    const estimatedRevenue = vouchers.reduce(
      (sum, v) => sum + (v.soldQty || 0) * (v.salePrice || 0),
      0
    );

    return { onSaleCount, totalSoldQty, totalUsedCount, estimatedRevenue };
  }, [vouchersData]);

  // Top vouchers: lấy 5 voucher có soldQty cao nhất từ dữ liệu đã fetch
  const topVouchers = useMemo(() => {
    const vouchers = vouchersData?.data ?? [];
    return [...vouchers]
      .sort((a, b) => (b.soldQty || 0) - (a.soldQty || 0))
      .slice(0, 5);
  }, [vouchersData]);

  const formatCurrency = (amount) =>
    amount >= 1_000_000
      ? `${(amount / 1_000_000).toFixed(1)}M ₫`
      : `${amount.toLocaleString('vi-VN')} ₫`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Xin chào,{' '}
            <span className="text-purple-600">
              {isProfileLoading ? '...' : partnerName}
            </span>{' '}
            👋
          </h1>
          <p className="text-gray-500 mt-1">Dưới đây là tổng quan hiệu quả kinh doanh của bạn hôm nay.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/partner/vouchers/new')}
            className="btn bg-purple-600 hover:bg-purple-700 border-none text-white shadow-sm"
          >
            Tạo Voucher Mới
          </button>
        </div>
      </div>

      {/* KPI Cards — tính từ dữ liệu API thật */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Voucher Đang Bán"
          value={kpi.onSaleCount.toString()}
          icon={Ticket}
          iconBgClass="bg-purple-100"
          iconTextClass="text-purple-600"
          isLoading={isLoading}
        />
        <KpiCard
          title="Tổng Đã Bán"
          value={kpi.totalSoldQty.toLocaleString('vi-VN')}
          icon={ShoppingCart}
          iconBgClass="bg-blue-100"
          iconTextClass="text-blue-600"
          isLoading={isLoading}
        />
        <KpiCard
          title="Đã Sử Dụng"
          value={kpi.totalUsedCount.toLocaleString('vi-VN')}
          icon={CheckCircle}
          iconBgClass="bg-emerald-100"
          iconTextClass="text-emerald-600"
          isLoading={isLoading}
        />
        <KpiCard
          title="Doanh Thu Ước Tính"
          value={isLoading ? '...' : formatCurrency(kpi.estimatedRevenue)}
          icon={DollarSign}
          iconBgClass="bg-amber-100"
          iconTextClass="text-amber-600"
          isLoading={isLoading}
        />
      </div>

      {/* Charts & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Chart — dữ liệu mẫu (chưa có API) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-800">
                Doanh thu {chartRange === '7d' ? 'tuần này' : chartRange === 'month' ? 'tháng này' : '30 ngày qua'}
              </h3>
              <MockDataBadge />
            </div>
            <select
              className="select select-bordered select-sm bg-gray-50"
              aria-label="Chọn khoảng thời gian"
              value={chartRange}
              onChange={(e) => setChartRange(e.target.value)}
            >
              <option value="30d">30 ngày qua</option>
              <option value="7d">Tuần này</option>
              <option value="month">Tháng này</option>
            </select>
          </div>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_CHART_DATA} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 12 }}
                  dy={10}
                  tickFormatter={(val) => val.replace('Ngày ', '')}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 12 }}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value.toLocaleString()} ₫`, 'Doanh thu']}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#9333ea"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: '#9333ea', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline — dữ liệu mẫu (chưa có API) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-800">Hoạt động gần đây</h3>
              <MockDataBadge />
            </div>
            {/* B104: navigate to reports page */}
            <button
              className="text-purple-600 text-sm font-medium hover:underline"
              onClick={() => navigate('/partner/reports')}
            >
              Xem tất cả
            </button>
          </div>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-100 before:to-transparent">
            {MOCK_TIMELINE.map((item) => (
              <div key={item.id} className="relative flex items-start gap-4 group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white
                  ${item.type === 'used'     ? 'bg-emerald-100 text-emerald-600' :
                    item.type === 'approved' ? 'bg-blue-100 text-blue-600'       :
                    item.type === 'order'    ? 'bg-purple-100 text-purple-600'   :
                                              'bg-gray-100 text-gray-600'}`}
                >
                  {item.type === 'used'     ? <CheckCircle size={16} /> :
                   item.type === 'approved' ? <Ticket size={16} />      :
                   item.type === 'order'    ? <ShoppingCart size={16} /> :
                                             <Clock size={16} />}
                </div>
                <div className="flex-1 pt-1 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <p className="text-sm text-gray-800 font-medium leading-relaxed">{item.content}</p>
                  <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={12} /> {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top Vouchers — dữ liệu thật từ API */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Voucher hiệu quả nhất</h3>
          <button
            className="btn btn-sm btn-ghost text-purple-600 hover:bg-purple-50 font-medium normal-case"
            onClick={() => navigate('/partner/vouchers')}
          >
            Xem chi tiết <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-gray-50/50 text-gray-500 font-medium text-sm">
              <tr>
                <th className="rounded-none font-medium py-4 px-6 bg-transparent">Tên Voucher</th>
                <th className="font-medium py-4 bg-transparent">Đã Bán / Tổng Số</th>
                <th className="font-medium py-4 text-center bg-transparent">Tỷ Lệ Bán</th>
                <th className="font-medium py-4 text-right px-6 bg-transparent">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {isVouchersLoading && (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-t border-gray-100">
                    <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-100 rounded" /></td>
                    <td className="py-4"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
                    <td className="py-4 text-center"><div className="h-4 w-12 bg-gray-100 rounded mx-auto" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-16 bg-gray-100 rounded ml-auto" /></td>
                  </tr>
                ))
              )}
              {!isVouchersLoading && topVouchers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                    Chưa có voucher nào.
                  </td>
                </tr>
              )}
              {!isVouchersLoading && topVouchers.map((v) => {
                const soldPct = v.totalQty > 0
                  ? Math.round((v.soldQty / v.totalQty) * 100)
                  : 0;

                const statusBadge = {
                  ON_SALE:          { cls: 'bg-emerald-100 border-none text-emerald-700', dot: 'bg-emerald-500', label: 'Đang chạy' },
                  DRAFT:            { cls: 'bg-gray-100 border-none text-gray-600',     dot: 'bg-gray-400',    label: 'Nháp' },
                  PENDING_APPROVAL: { cls: 'bg-blue-100 border-none text-blue-700',     dot: 'bg-blue-500',    label: 'Chờ duyệt' },
                  PAUSED:           { cls: 'bg-yellow-100 border-none text-yellow-700', dot: 'bg-yellow-500',  label: 'Tạm dừng' },
                  EXPIRED:          { cls: 'bg-gray-100 border-none text-gray-500',     dot: 'bg-gray-400',    label: 'Hết hạn' },
                  REJECTED:         { cls: 'bg-red-100 border-none text-red-700',       dot: 'bg-red-500',     label: 'Từ chối' },
                }[v.status] || { cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', label: v.status };

                return (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition-colors border-t border-gray-100">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{v.title}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        ID: {v.id.slice(0, 8).toUpperCase()}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">{v.soldQty}</span>
                        <span className="text-gray-400">/ {v.totalQty}</span>
                      </div>
                      <progress
                        className="progress progress-primary w-24 h-1.5 mt-2 opacity-70"
                        value={v.soldQty}
                        max={v.totalQty}
                      />
                    </td>
                    <td className="py-4 text-center">
                      <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                        {soldPct}%
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className={`badge badge-sm gap-1 p-2.5 ${statusBadge.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                        {statusBadge.label}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
