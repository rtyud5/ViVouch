import { useState } from 'react';
import { Link } from 'react-router-dom';

const MOCK_VOUCHERS = [
  {
    id: 1,
    code: 'VL-2023-001',
    name: 'Buffet Lẩu Haidilao',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxkrlOXVApAVCOodc7ylQiuMUoB8q2Z9HnoXGGq4Q2e4ztLeWm4SB8nUYvSpjQnjJux2RhX75bsval7wH9hJCfz0Ixo_ImK2RHYmQJDWdKKi0i2NY8RjKWvxJ01AtOJWEo3pi-l2lz7RKYCx9c_EfbMe82KRbMhyJQ1rFah-YBWz8tFU6zetee8LyO3jXhuH5Rq7IZjSjZ-pkkNxfC6dOHh5L_YKvNl_VG8MLtbG3vZvaeBcq9Q7zM7TiXqBiRS_QcBZ2PY-Ev8X8',
    status: 'ON_SALE',
    price: 250000,
    sold: 45,
    total: 100,
    startDate: '01/10/2023',
    endDate: '31/10/2023'
  },
  {
    id: 2,
    code: 'VL-2023-002',
    name: 'Set Sushi Hokkaido Sachi',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0UHJJJCCG0E-x8K0_HcCFbeV-UmJThvtVY__EdnwUNSdIeBjn1shsAyr0DFWUc3FkuiVl97Zek2D07_kVMVru2eguV54IsHBmjsLEymMW9rmQiYhT7ewTk2QrI9MN9h0DxlD019t7Ah5Qlryd4E-y8P66QS4jcNH-ZEw_ez5VRyHsjSWK5wjdj-LnhVCyF-dGqTXHrU97JKSmDvYshInivA9SPKQDHzvSSqHt_U2xH0Lp95UXes7aImkKzEKRWt7dmvO3zVQ19cQ',
    status: 'PENDING_APPROVAL',
    price: 500000,
    sold: 0,
    total: 50,
    startDate: '15/10/2023',
    endDate: '15/11/2023'
  },
  {
    id: 3,
    code: '--',
    name: 'Combo Nướng BBQ',
    thumbnail: null,
    status: 'DRAFT',
    price: null,
    sold: 0,
    total: 0,
    startDate: null,
    endDate: null
  },
  {
    id: 4,
    code: 'VL-2023-004',
    name: 'Vé xem phim CGV',
    thumbnail: null,
    status: 'REJECTED',
    price: 100000,
    sold: 0,
    total: 100,
    startDate: '01/11/2023',
    endDate: '30/11/2023'
  },
  {
    id: 5,
    code: 'VL-2023-005',
    name: 'Voucher trà sữa GongCha',
    thumbnail: null,
    status: 'PAUSED',
    price: 50000,
    sold: 20,
    total: 100,
    startDate: '01/09/2023',
    endDate: '30/09/2023'
  },
  {
    id: 6,
    code: 'VL-2023-006',
    name: 'Voucher Highlands Coffee',
    thumbnail: null,
    status: 'EXPIRED',
    price: 30000,
    sold: 100,
    total: 100,
    startDate: '01/08/2023',
    endDate: '31/08/2023'
  }
];

const TABS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'DRAFT', label: 'Nháp' },
  { id: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
  { id: 'ON_SALE', label: 'Đang bán' },
  { id: 'PAUSED', label: 'Tạm dừng' },
  { id: 'EXPIRED', label: 'Hết hạn' }
];

export function PartnerVoucherListPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  
  const filteredVouchers = activeTab === 'ALL' 
    ? MOCK_VOUCHERS 
    : MOCK_VOUCHERS.filter(v => v.status === activeTab);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'DRAFT': 
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-variant text-on-surface-variant">Nháp</span>;
      case 'PENDING_APPROVAL': 
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-tertiary-fixed text-on-tertiary-fixed">Chờ duyệt</span>;
      case 'ON_SALE': 
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-fixed text-on-primary-fixed">Đang bán</span>;
      case 'REJECTED': 
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-error-container text-on-error-container">Từ chối</span>;
      case 'PAUSED': 
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-tertiary-fixed text-on-tertiary-fixed">Tạm dừng</span>;
      case 'EXPIRED': 
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-variant text-on-surface-variant">Hết hạn</span>;
      default: 
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-variant text-on-surface-variant">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest">
      {/* Header Section */}
      <header className="px-6 py-6 flex justify-between items-center border-b border-outline-variant/30">
        <h1 className="font-headline-md text-headline-md text-on-background">Voucher của tôi</h1>
        <Link to="/partner/vouchers/new" className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:bg-primary-fixed-variant transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tạo voucher mới
        </Link>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-6 mt-4 px-6 pb-6">
        {/* Filters & Search */}
        <div className="flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex border-b border-outline-variant/50 w-full overflow-x-auto hide-scrollbar">
            {TABS.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-label-md text-label-md whitespace-nowrap transition-colors ${activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                placeholder="Tìm kiếm voucher..." 
                type="text" 
              />
            </div>
          </div>
        </div>

        {/* Data Table Card */}
        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-variant border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">Voucher</th>
                  <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">Giá bán</th>
                  <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">Đã bán/Tổng</th>
                  <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold min-w-[120px]">Tỷ lệ dùng</th>
                  <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">Thời hạn bán</th>
                  <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-on-surface-variant">
                      <div className="flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-4xl mb-2 text-outline-variant">inbox</span>
                        <p className="font-body-md text-body-md mt-2">Không có voucher nào trong trạng thái này.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map(v => {
                    const usageRate = v.total > 0 ? Math.round((v.sold / v.total) * 100) : 0;
                    return (
                      <tr key={v.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-md bg-surface-dim overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {v.thumbnail ? (
                                <img alt={v.name} className="w-full h-full object-cover" src={v.thumbnail} />
                              ) : (
                                <span className="material-symbols-outlined text-outline">image</span>
                              )}
                            </div>
                            <div>
                              <p className="font-body-md text-body-md font-semibold text-on-background">{v.name}</p>
                              <p className="font-label-md text-[11px] text-on-surface-variant mt-0.5">Mã: {v.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {getStatusBadge(v.status)}
                        </td>
                        <td className="px-4 py-4 font-body-md text-body-md">
                          {v.price ? `${v.price.toLocaleString('vi-VN')}đ` : '--'}
                        </td>
                        <td className="px-4 py-4 font-body-md text-body-md text-on-surface-variant">
                          <span className="text-on-background font-medium">{v.sold}</span>/{v.total || '--'}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${usageRate}%` }}></div>
                            </div>
                            <span className="font-label-md text-[11px] text-on-surface-variant">{usageRate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-body-md text-[13px] text-on-surface-variant">
                          {v.startDate && v.endDate ? `${v.startDate} - ${v.endDate}` : '--'}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Action buttons: Edit (DRAFT/REJECTED only), View Details */}
                            <button 
                              className="btn btn-sm btn-ghost p-1 h-auto min-h-0 text-primary hover:bg-primary/10 tooltip tooltip-top"
                              data-tip="Xem chi tiết"
                            >
                              <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </button>
                            
                            <button 
                              className={`btn btn-sm btn-ghost p-1 h-auto min-h-0 tooltip tooltip-top ${
                                ['DRAFT', 'REJECTED'].includes(v.status) ? 'text-secondary hover:bg-secondary/10' : 'text-outline-variant opacity-50 cursor-not-allowed'
                              }`}
                              data-tip="Chỉnh sửa"
                              disabled={!['DRAFT', 'REJECTED'].includes(v.status)}
                            >
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {filteredVouchers.length > 0 && (
            <div className="px-4 py-3 border-t border-outline-variant/50 bg-surface flex items-center justify-between">
              <div className="font-body-md text-[13px] text-on-surface-variant">
                Hiển thị 1-{filteredVouchers.length} trong số {filteredVouchers.length} voucher
              </div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50" disabled>
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-on-primary font-label-md">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
