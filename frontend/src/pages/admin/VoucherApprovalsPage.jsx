import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AdminLayout } from '../../layouts/AdminLayout';
import { AdminTable } from '../../features/admin/components';
import { useVoucherApprovals, useApproveVoucher, useRejectVoucher } from '../../features/admin/hooks/useVoucherApprovals';

export default function VoucherApprovalsPage() {
  const [params, setParams] = useState({ page: 1, limit: 10, status: 'PENDING_APPROVAL' });
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  
  const { data, isLoading, isError, error, refetch } = useVoucherApprovals(params);
  const { mutate: approveVoucher } = useApproveVoucher();
  const { mutate: rejectVoucher } = useRejectVoucher();

  const vouchers = data?.data?.vouchers || [];

  const handleApprove = (voucherId) => {
    approveVoucher(voucherId);
    setSelectedVoucher(null);
  };

  const handleReject = (voucherId) => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }
    rejectVoucher({ voucherId, reason: rejectReason });
    setSelectedVoucher(null);
    setRejectReason('');
  };

  const columns = [
    {
      key: 'name',
      label: 'Tên Voucher',
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.title}</div>
          <div className="text-xs text-gray-500 mt-0.5">Mã: {row.code}</div>
        </div>
      ),
    },
    {
      key: 'partner',
      label: 'Đối tác',
      render: (row) => <span className="text-sm">{row.partner?.businessName}</span>,
    },
    {
      key: 'price',
      label: 'Giá (Gốc/Bán)',
      render: (row) => (
        <div>
          <div><span className="line-through text-gray-500 text-xs">{row.originalPrice}đ</span></div>
          <div className="font-medium text-red-600">{row.salePrice}đ</div>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row) => (
        <div className="flex justify-end gap-2 pr-6">
           <button 
             onClick={(e) => { e.stopPropagation(); setSelectedVoucher(row); }}
             className="text-amber-600 hover:text-amber-800 text-sm font-semibold"
           >
             Xem chi tiết
           </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 h-full flex flex-col relative bg-[#f8f9ff]">
      <div className="mb-6 flex justify-between items-center text-[#0b1c30]">
        <h1 className="text-2xl font-bold">Kiểm duyệt Voucher</h1>
      </div>

      {/* Error banner */}
      {isError && !isLoading && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
          <span className="material-symbols-outlined text-lg">error</span>
          <span className="flex-1">{error?.response?.data?.message || 'Không tải được danh sách voucher. Vui lòng thử lại.'}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1 rounded border border-red-300 hover:bg-red-100 font-medium"
          >
            Thử lại
          </button>
        </div>
      )}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mt-1">Quản lý và phê duyệt các voucher mới từ đối tác.</p>
      </div>

      <div className="flex gap-6 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setParams(p => ({ ...p, status: 'PENDING_APPROVAL' }))}
          className={`pb-3 font-semibold ${params.status === 'PENDING_APPROVAL' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-500'}`}
        >
          Chờ duyệt
        </button>
        <button 
          onClick={() => setParams(p => ({ ...p, status: 'APPROVED' }))}
          className={`pb-3 font-semibold ${params.status === 'APPROVED' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-500'}`}
        >
          Đã duyệt
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <AdminTable columns={columns} data={vouchers} loading={isLoading} onRowClick={(v) => setSelectedVoucher(v)} />
      </div>

      {/* Modal - rendered via Portal to avoid stacking context issues */}
      {selectedVoucher && document.body && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-[#0b1c30]">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-lg font-bold">Chi tiết Voucher: {selectedVoucher.status === 'PENDING_APPROVAL' ? 'Chờ duyệt' : 'Xem'}</h3>
              <button onClick={() => setSelectedVoucher(null)} className="text-gray-500 hover:text-gray-800">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 text-sm space-y-6">
               <div className="flex justify-between items-start">
                 <h2 className="text-2xl font-bold">{selectedVoucher.title}</h2>
               </div>
               <p className="text-gray-600">{selectedVoucher.description}</p>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <div className="text-xs text-gray-500 mb-1">Giá gốc</div>
                    <div className="line-through text-gray-500 font-medium">{selectedVoucher.originalPrice} ₫</div>
                 </div>
                 <div className="border border-amber-500/30 p-4 rounded-lg bg-amber-50">
                    <div className="text-xs text-gray-500 mb-1">Giá bán</div>
                    <div className="text-red-500 font-bold text-lg">{selectedVoucher.salePrice} ₫</div>
                 </div>
               </div>

               {selectedVoucher.status === 'PENDING_APPROVAL' && (
                 <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <h4 className="font-bold mb-4">Quyết định phê duyệt</h4>
                    <div className="space-y-4">
                       <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Lý do từ chối (bắt buộc nếu chọn Từ chối)</label>
                          <textarea 
                             value={rejectReason}
                             onChange={(e) => setRejectReason(e.target.value)}
                             className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none h-24"
                             placeholder="Nhập lý do chi tiết..."
                          />
                       </div>
                       <div className="flex justify-end gap-3 pt-2">
                          <button onClick={() => setSelectedVoucher(null)} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100">Hủy bỏ</button>
                          <button 
                            onClick={() => handleReject(selectedVoucher.id)}
                            className="px-6 py-2 rounded-lg border border-red-500 text-red-500 font-semibold hover:bg-red-50"
                          >Từ chối</button>
                          <button 
                            onClick={() => handleApprove(selectedVoucher.id)}
                            className="px-6 py-2 rounded-lg bg-amber-500 text-white font-semibold flex items-center gap-2 hover:bg-amber-600"
                          ><span className="material-symbols-outlined text-[18px]">check_circle</span> Duyệt Voucher</button>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
