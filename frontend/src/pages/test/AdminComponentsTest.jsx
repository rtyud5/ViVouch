import React, { useState } from 'react';
import { 
  KpiCard, 
  AdminTable, 
  AdminStatusBadge, 
  ConfirmModal 
} from '../../features/admin/components';

export function AdminComponentsTest() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const columns = [
    { key: 'name', label: 'Đối tác', width: '25%' },
    { key: 'email', label: 'Email', width: '25%' },
    { 
      key: 'status', 
      label: 'Trạng thái', 
      render: (row) => <AdminStatusBadge status={row.status} /> 
    },
    { 
      key: 'revenue', 
      label: 'Doanh thu', 
      render: (row) => <span>{row.revenue.toLocaleString()}đ</span> 
    }
  ];

  const data = [
    { id: 1, name: 'Starbucks', email: 'contact@starbucks.com', status: 'ACTIVE', revenue: 15000000 },
    { id: 2, name: 'Highlands Coffee', email: 'info@highlands.vn', status: 'PENDING_APPROVAL', revenue: 0 },
    { id: 3, name: 'Phúc Long', email: 'support@phuclong.com.vn', status: 'SUSPENDED', revenue: 8500000 },
  ];

  const handleConfirm = () => {
    setModalLoading(true);
    setTimeout(() => {
      setModalLoading(false);
      setModalOpen(false);
      alert('Đã xác nhận thành công!');
    }, 1500);
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen space-y-12">
      <header className="border-b border-[#cbd5e1] pb-6">
        <h1 className="text-3xl font-bold text-[#0f172a]">Admin Component Kit Demo</h1>
        <p className="text-[#64748b] mt-2">Previewing new props-driven UI components for Admin Portal</p>
      </header>

      {/* KPI Cards */}
      <section>
        <h2 className="text-xl font-semibold text-[#1e293b] mb-6">1. KPI Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KpiCard label="Tổng doanh thu" value="452.3M" trend="+12.5%" trendType="up" />
          <KpiCard label="Đối tác mới" value="12" trend="+3" trendType="up" />
          <KpiCard label="Voucher chờ duyệt" value="45" trend="-5" trendType="down" />
          <KpiCard label="Tỷ lệ quy đổi" value="68%" trend="Ổn định" trendType="neutral" />
        </div>
      </section>

      {/* Admin Table */}
      <section>
        <h2 className="text-xl font-semibold text-[#1e293b] mb-6">2. Admin Table</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-medium text-[#64748b] mb-3">Dữ liệu thực tế:</h3>
            <AdminTable 
              columns={columns} 
              data={data} 
              onRowClick={(row) => console.log('Clicked row:', row)}
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-[#64748b] mb-3">Trạng thái Loading:</h3>
            <AdminTable columns={columns} loading={true} />
          </div>
        </div>
      </section>

      {/* Status Badges */}
      <section>
        <h2 className="text-xl font-semibold text-[#1e293b] mb-6">3. Admin Status Badges</h2>
        <div className="bg-white p-6 rounded-lg border border-[#e2e8f0]">
          <div className="flex flex-wrap gap-4">
            <AdminStatusBadge status="ACTIVE" />
            <AdminStatusBadge status="PENDING_APPROVAL" />
            <AdminStatusBadge status="SUSPENDED" />
            <AdminStatusBadge status="ON_SALE" />
            <AdminStatusBadge status="DRAFT" />
            <AdminStatusBadge status="REJECTED" />
            <AdminStatusBadge status="EXPIRED" />
            <AdminStatusBadge status="PAUSED" />
            <AdminStatusBadge status="ISSUED" />
            <AdminStatusBadge status="USED" />
            <AdminStatusBadge status="CANCELLED" />
            <AdminStatusBadge status="LOCKED" />
            <AdminStatusBadge status="CUSTOMER" />
            <AdminStatusBadge status="PARTNER" />
            <AdminStatusBadge status="ADMIN" />
          </div>
        </div>
      </section>

      {/* Confirm Modal */}
      <section>
        <h2 className="text-xl font-semibold text-[#1e293b] mb-6">4. Confirm Modal</h2>
        <div className="flex gap-4">
          <button 
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 bg-[#0f172a] text-white rounded-lg font-medium hover:bg-[#1e293b] transition-colors"
          >
            Mở Modal Thử Nghiệm
          </button>
        </div>

        <ConfirmModal 
          isOpen={modalOpen}
          title="Xác nhận xóa đối tác?"
          message="Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến đối tác này sẽ bị ẩn khỏi hệ thống."
          confirmLabel="Xóa vĩnh viễn"
          confirmVariant="danger"
          loading={modalLoading}
          onConfirm={handleConfirm}
          onCancel={() => setModalOpen(false)}
        />
      </section>
    </div>
  );
}
