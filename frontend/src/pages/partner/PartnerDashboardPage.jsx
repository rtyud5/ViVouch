import React, { useState, useEffect } from 'react';
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

// --- Components ---

const KpiCard = ({ title, value, icon: Icon, trend, trendLabel, iconBgClass, iconTextClass }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
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

export function PartnerDashboardPage() {
  const navigate = useNavigate();

  // State for dashboard data
  const [chartData, setChartData] = useState([]);
  const [topVouchers, setTopVouchers] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [kpiData, setKpiData] = useState({
    activeVouchers: 0,
    totalSold: 0,
    totalUsed: 0,
    revenue: '0'
  });

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['partnerProfile'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/partner/profile');
        return response.data;
      } catch (error) {
        // Fallback for UI only in development
        if (import.meta.env.DEV || process.env.NODE_ENV === 'development') {
          console.warn('Could not fetch partner profile, using fallback data');
          return { name: 'Đối Tác Demo' };
        }
        throw error;
      }
    },
    retry: false
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch chart data
        const chartResponse = await apiClient.get('/api/partner/dashboard/revenue-chart');
        setChartData(chartResponse.data || []);
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
        setChartData([]);
      }

      try {
        // Fetch top vouchers
        const vouchersResponse = await apiClient.get('/api/partner/dashboard/top-vouchers');
        setTopVouchers(vouchersResponse.data || []);
      } catch (error) {
        console.error('Failed to fetch top vouchers:', error);
        setTopVouchers([]);
      }

      try {
        // Fetch timeline
        const timelineResponse = await apiClient.get('/api/partner/dashboard/timeline');
        setTimeline(timelineResponse.data || []);
      } catch (error) {
        console.error('Failed to fetch timeline:', error);
        setTimeline([]);
      }

      try {
        // Fetch KPI data
        const kpiResponse = await apiClient.get('/api/partner/dashboard/kpi');
        setKpiData(kpiResponse.data || {
          activeVouchers: 0,
          totalSold: 0,
          totalUsed: 0,
          revenue: '0'
        });
      } catch (error) {
        console.error('Failed to fetch KPI data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const partnerName = profileData?.name || 'Đối tác';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Xin chào, <span className="text-purple-600">{isLoading ? '...' : partnerName}</span> 👋
          </h1>
          <p className="text-gray-500 mt-1">Dưới đây là tổng quan hiệu quả kinh doanh của bạn hôm nay.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/partner/vouchers')}
            className="btn bg-purple-600 hover:bg-purple-700 border-none text-white shadow-sm"
          >
            Tạo Voucher Mới
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Voucher Đang Bán"
          value={kpiData.activeVouchers.toString()}
          icon={Ticket}
          trend="+2"
          trendLabel="tuần trước"
          iconBgClass="bg-purple-100"
          iconTextClass="text-purple-600"
        />
        <KpiCard
          title="Tổng Đã Bán"
          value={kpiData.totalSold.toLocaleString()}
          icon={ShoppingCart}
          trend="+15%"
          trendLabel="tháng trước"
          iconBgClass="bg-blue-100"
          iconTextClass="text-blue-600"
        />
        <KpiCard
          title="Đã Sử Dụng"
          value={kpiData.totalUsed.toLocaleString()}
          icon={CheckCircle}
          trend="+5%"
          trendLabel="tháng trước"
          iconBgClass="bg-emerald-100"
          iconTextClass="text-emerald-600"
        />
        <KpiCard
          title="Doanh Thu"
          value={kpiData.revenue}
          icon={DollarSign}
          trend="+22%"
          trendLabel="tháng trước"
          iconBgClass="bg-amber-100"
          iconTextClass="text-amber-600"
        />
      </div>

      {/* Charts & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Doanh thu 30 ngày qua</h3>
            <select
              className="select select-bordered select-sm bg-gray-50"
              aria-label="Select revenue timeframe"
            >
              <option>30 ngày qua</option>
              <option>Tuần này</option>
              <option>Tháng này</option>
            </select>
          </div>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
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

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Hoạt động gần đây</h3>
            <button className="text-purple-600 text-sm font-medium hover:underline">Xem tất cả</button>
          </div>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-100 before:to-transparent">
            {timeline.map((item) => (
              <div key={item.id} className="relative flex items-start gap-4 group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white
                  ${item.type === 'used' ? 'bg-emerald-100 text-emerald-600' :
                    item.type === 'approved' ? 'bg-blue-100 text-blue-600' :
                    item.type === 'order' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'}`}>
                  {item.type === 'used' ? <CheckCircle size={16} /> :
                   item.type === 'approved' ? <Ticket size={16} /> :
                   item.type === 'order' ? <ShoppingCart size={16} /> :
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

      {/* Top Vouchers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Voucher hiệu quả nhất</h3>
          <button className="btn btn-sm btn-ghost text-purple-600 hover:bg-purple-50 font-medium normal-case">
            Xem chi tiết <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-gray-50/50 text-gray-500 font-medium text-sm">
              <tr>
                <th className="rounded-none font-medium py-4 px-6 bg-transparent">Tên Voucher</th>
                <th className="font-medium py-4 bg-transparent">Đã Bán / Tổng Số</th>
                <th className="font-medium py-4 text-center bg-transparent">Tỷ Lệ Chuyển Đổi</th>
                <th className="font-medium py-4 text-right px-6 bg-transparent">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {topVouchers.map((voucher) => (
                <tr key={voucher.id} className="hover:bg-gray-50/50 transition-colors border-t border-gray-100">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{voucher.name}</div>
                    <div className="text-xs text-gray-400 mt-1">ID: VOU-{voucher.id.toString().padStart(4, '0')}</div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">{voucher.sold}</span>
                      <span className="text-gray-400">/ {voucher.total}</span>
                    </div>
                    <progress
                      className="progress progress-primary w-24 h-1.5 mt-2 opacity-70"
                      value={voucher.sold}
                      max={voucher.total}
                    ></progress>
                  </td>
                  <td className="py-4 text-center">
                    <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                      {voucher.conversion}%
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="badge badge-success badge-sm gap-1 bg-emerald-100 border-none text-emerald-700 p-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Đang chạy
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
