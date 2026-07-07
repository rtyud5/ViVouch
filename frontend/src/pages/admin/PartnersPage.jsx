import React, { useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { AdminTable } from '../../features/admin/components';
import { usePartners, useApprovePartner, useRejectPartner } from '../../features/admin/hooks/usePartners';
import { ApiSuccessToast } from '../../components/common/ApiSuccessToast';
import { ApiErrorToast } from '../../components/common/ApiErrorToast';

export default function PartnersPage() {
  const [params, setParams] = useState({ page: 1, limit: 10, status: '', search: '' });
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toastSuccess, setToastSuccess] = useState('');
  const [toastError, setToastError] = useState(null);

  const { data, isLoading, isError, error, refetch } = usePartners(params);
  const { mutate: approvePartner, isPending: isApprovePending } = useApprovePartner();
  const { mutate: rejectPartner, isPending: isRejectPending } = useRejectPartner();

  const partners = data?.data?.partners || [];

  const handleApprovePartner = (partnerId) => {
    setToastError(null);
    approvePartner(partnerId, {
      onSuccess: () => {
        setToastSuccess('Đã phê duyệt đối tác thành công.');
        setSelectedPartner(null);
      },
      onError: (err) => {
        setToastError(err);
      },
    });
  };

  const handleReject = (partnerId) => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }
    setToastError(null);
    rejectPartner({ partnerId, reason: rejectReason }, {
      onSuccess: () => {
        setToastSuccess('Đã từ chối đối tác thành công.');
        setSelectedPartner(null);
        setRejectReason('');
      },
      onError: (err) => {
        setToastError(err);
      },
    });
  };

  const columns = [
    {
      key: 'company',
      label: 'Tên doanh nghiệp',
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.businessName}</div>
          <div className="text-xs text-gray-500 max-w-[200px] truncate">{row.taxCode}</div>
        </div>
      ),
    },
    {
      key: 'taxCode',
      label: 'MST',
      render: (row) => <span className="font-mono text-sm text-gray-700">{row.taxCode}</span>,
    },
    {
      key: 'representative',
      label: 'Người đại diện',
      render: (row) => <span className="text-sm text-gray-900">{row.representativeName}</span>,
    },
    {
      key: 'date',
      label: 'Ngày đăng ký',
      render: (row) => <span className="text-sm text-gray-500">{new Date(row.createdAt).toLocaleDateString('vi-VN')}</span>,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => {
        let badgeClass = "bg-gray-100 text-gray-800";
        let statusText = row.status;
        if (row.status === 'PENDING') {
          badgeClass = "bg-amber-100 text-amber-800";
          statusText = "Chờ duyệt";
        } else if (row.status === 'APPROVED') {
          badgeClass = "bg-green-100 text-green-800";
          statusText = "Đã duyệt";
        } else if (row.status === 'REJECTED') {
          badgeClass = "bg-red-100 text-red-800";
          statusText = "Từ chối";
        }
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
            {statusText}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row) => {
        if (row.status !== 'PENDING') return null;
        return (
          <div className="flex justify-end gap-2 pr-6">
            <button 
              onClick={(e) => { e.stopPropagation(); handleApprovePartner(row.id); }}
              className="p-1 text-green-600 hover:bg-green-50 rounded" 
              title="Duyệt"
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedPartner(row); }}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Từ chối"
            >
              <span className="material-symbols-outlined text-[20px]">cancel</span>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 h-full flex flex-col relative bg-[#f8f9ff]">
      <ApiSuccessToast message={toastSuccess} />
      <ApiErrorToast error={toastError} />
      <div className="mb-6 flex justify-between items-center text-[#0b1c30]">
        <h1 className="text-2xl font-bold">Quản lý đối tác</h1>
      </div>

      {/* Error banner */}
      {isError && !isLoading && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
          <span className="material-symbols-outlined text-lg">error</span>
          <span className="flex-1">{error?.response?.data?.message || 'Không tải được danh sách đối tác. Vui lòng thử lại.'}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1 rounded border border-red-300 hover:bg-red-100 font-medium"
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="bg-white border text-[#0b1c30] border-gray-200 rounded-xl flex-1 flex flex-col shadow-sm">
        <div className="px-6 pt-4 border-b border-gray-200">
          <div className="flex gap-6">
            <button 
              onClick={() => setParams(p => ({ ...p, status: '' }))}
              className={`pb-3 font-semibold ${params.status === '' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-500'}`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setParams(p => ({ ...p, status: 'PENDING' }))}
              className={`pb-3 font-semibold ${params.status === 'PENDING' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-500'}`}
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
        </div>

        <div className="flex-1 p-0 overflow-auto">
          <AdminTable 
            columns={columns} 
            data={partners} 
            loading={isLoading} 
            onRowClick={(partner) => setSelectedPartner(partner)} 
          />
        </div>
      </div>

      {selectedPartner && (
        <aside className="w-[380px] bg-white border-l text-[#0b1c30] border-gray-200 shadow-lg flex flex-col shrink-0 absolute right-0 top-0 h-full z-20">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start bg-gray-50">
            <h3 className="text-lg font-bold">{selectedPartner.businessName}</h3>
            <button onClick={() => setSelectedPartner(null)} className="text-gray-500 hover:text-gray-900">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
             <div className="space-y-3 text-sm">
               <div className="flex justify-between"><span className="text-gray-500">MST</span><span className="font-mono">{selectedPartner.taxCode}</span></div>
               <div className="flex justify-between"><span className="text-gray-500">Người liên hệ</span><span>{selectedPartner.representativeName}</span></div>
             </div>

             {selectedPartner.status === 'PENDING' && (
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
                        <button onClick={() => setSelectedPartner(null)} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100">Hủy bỏ</button>
                        <button
                          onClick={() => handleReject(selectedPartner.id)}
                          className="px-6 py-2 rounded-lg border border-red-500 text-red-500 font-semibold hover:bg-red-50"
                        >Từ chối</button>
                        <button
                          onClick={() => handleApprovePartner(selectedPartner.id)}
                          disabled={isApprovePending || isRejectPending}
                          className="px-6 py-2 rounded-lg bg-amber-500 text-white font-semibold flex items-center gap-2 hover:bg-amber-600"
                        ><span className="material-symbols-outlined text-[18px]">check_circle</span> Duyệt đối tác</button>
                     </div>
                  </div>
               </div>
             )}
          </div>
        </aside>
      )}
    </div>
  );
}
