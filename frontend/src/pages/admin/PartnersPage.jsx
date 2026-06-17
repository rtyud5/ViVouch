import React, { useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { AdminTable } from '../../features/admin/components';
import { usePartners, useApprovePartner, useRejectPartner } from '../../features/admin/hooks/usePartners';

export default function PartnersPage() {
  const [params, setParams] = useState({ page: 1, limit: 10, status: '', search: '' });
  const [selectedPartner, setSelectedPartner] = useState(null);
  
  const { data, isLoading } = usePartners(params);
  const { mutate: approvePartner } = useApprovePartner();
  const { mutate: rejectPartner } = useRejectPartner();

  const partners = data?.data?.partners || [];

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
              onClick={(e) => { e.stopPropagation(); approvePartner(row.id); }}
              className="p-1 text-green-600 hover:bg-green-50 rounded" 
              title="Duyệt"
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); rejectPartner({ partnerId: row.id, reason: 'Chưa đủ điều kiện' }); }}
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
      <div className="mb-6 flex justify-between items-center text-[#0b1c30]">
        <h1 className="text-2xl font-bold">Quản lý đối tác</h1>
      </div>

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
          </div>
          <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3">
            {selectedPartner.status === 'PENDING' && (
              <>
                <button 
                  onClick={() => { rejectPartner({ partnerId: selectedPartner.id, reason: 'Chưa đủ điều kiện' }); setSelectedPartner(null); }}
                  className="px-4 py-2 border border-red-500 text-red-500 rounded-lg text-sm"
                >Từ chối</button>
                <button 
                  onClick={() => { approvePartner(selectedPartner.id); setSelectedPartner(null); }}
                  className="px-6 py-2 bg-[#855300] text-white rounded-lg text-sm flex items-center gap-1"
                ><span className="material-symbols-outlined text-[18px]">check_circle</span> Duyệt đối tác</button>
              </>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
