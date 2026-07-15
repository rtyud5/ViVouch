import React, { useState } from 'react';
import { useAuditLogs } from '../../features/admin/hooks/useAuditLogs';

const AUDIT_ACTIONS = {
  ADMIN_APPROVE_PARTNER: "ADMIN_APPROVE_PARTNER",
  ADMIN_REJECT_PARTNER: "ADMIN_REJECT_PARTNER",
  ADMIN_APPROVE_VOUCHER: "ADMIN_APPROVE_VOUCHER",
  ADMIN_REJECT_VOUCHER: "ADMIN_REJECT_VOUCHER",
  ADMIN_LOCK_USER: "ADMIN_LOCK_USER",
  ADMIN_UNLOCK_USER: "ADMIN_UNLOCK_USER",
  PARTNER_CREATE_VOUCHER: "PARTNER_CREATE_VOUCHER",
  PARTNER_SUBMIT_VOUCHER: "PARTNER_SUBMIT_VOUCHER",
  CUSTOMER_CHECKOUT: "CUSTOMER_CHECKOUT",
  SYSTEM_ISSUE_VOUCHER_CODE: "SYSTEM_ISSUE_VOUCHER_CODE",
  PARTNER_REDEEM_VOUCHER: "PARTNER_REDEEM_VOUCHER"
};

const ACTION_LABELS = {
  [AUDIT_ACTIONS.ADMIN_APPROVE_PARTNER]: "Duyệt đối tác",
  [AUDIT_ACTIONS.ADMIN_REJECT_PARTNER]: "Từ chối đối tác",
  [AUDIT_ACTIONS.ADMIN_APPROVE_VOUCHER]: "Duyệt voucher",
  [AUDIT_ACTIONS.ADMIN_REJECT_VOUCHER]: "Từ chối voucher",
  [AUDIT_ACTIONS.ADMIN_LOCK_USER]: "Khóa người dùng",
  [AUDIT_ACTIONS.ADMIN_UNLOCK_USER]: "Mở khóa người dùng",
  [AUDIT_ACTIONS.PARTNER_CREATE_VOUCHER]: "Tạo voucher",
  [AUDIT_ACTIONS.PARTNER_SUBMIT_VOUCHER]: "Gửi duyệt voucher",
  [AUDIT_ACTIONS.CUSTOMER_CHECKOUT]: "Đặt hàng",
  [AUDIT_ACTIONS.PARTNER_REDEEM_VOUCHER]: "Đổi mã voucher"
};

const ACTION_COLORS = {
  "Duyệt": "bg-green-100 text-green-800",
  "Từ chối": "bg-red-100 text-red-800",
  "Khóa": "bg-orange-100 text-orange-800",
  "Mở khóa": "bg-green-100 text-green-800",
  "Tạo": "bg-blue-100 text-blue-800",
  "Gửi duyệt": "bg-yellow-100 text-yellow-800",
  "Đặt hàng": "bg-purple-100 text-purple-800",
  "Đổi mã": "bg-emerald-100 text-emerald-800"
};

const getBadgeStyle = (action) => {
  const label = ACTION_LABELS[action] || action;
  for (const key in ACTION_COLORS) {
    if (label.includes(key)) return ACTION_COLORS[key];
  }
  return "bg-gray-100 text-gray-800";
};

export default function AuditLogsPage() {
  const [params, setParams] = useState({ page: 1, limit: 20, action: '' });
  const { data, isLoading } = useAuditLogs(params);
  
  const logs = data?.data?.logs || [];
  const total = data?.data?.pagination?.total || 0;
  const totalPages = data?.data?.pagination?.totalPages || 1;

  const handlePageChange = (newPage) => {
    setParams(p => ({ ...p, page: newPage }));
  };

  return (
    <div className="p-6 h-full flex flex-col relative bg-[#f8f9ff]">
      <div className="mb-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-[#0b1c30]">Nhật ký hệ thống</h1>
        
        <div className="flex bg-white p-3 rounded border border-gray-200 shadow-sm">
          <select
            value={params.action}
            onChange={(e) => setParams(p => ({ ...p, action: e.target.value, page: 1 }))}
            className="pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:border-amber-500 min-w-[200px]"
          >
            <option value="">Tất cả thao tác</option>
            {Object.keys(AUDIT_ACTIONS).map(action => (
              <option key={action} value={action}>{ACTION_LABELS[action] || action}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl flex-1 flex flex-col shadow-sm overflow-hidden">
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium">Không có nhật ký nào</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f1efea] border-b border-[#dce9ff] sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Thời gian</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Người thực hiện</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Mục tiêu</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Chi tiết metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-[10px]">
                          {log.actor?.email ? log.actor.email[0].toUpperCase() : 'U'}
                        </div>
                        <span className="font-medium text-gray-900">{log.actor?.email}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600">
                          {log.actor?.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[11px] font-bold uppercase ${getBadgeStyle(log.action)}`}>
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 font-mono text-xs">
                      {log.targetType} <span className="text-gray-400">|</span> {log.targetId?.split('-')[0] || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      <pre className="max-w-xs truncate overflow-hidden bg-gray-50 p-1 rounded border border-gray-100" title={JSON.stringify(log.metadata)}>
                        {JSON.stringify(log.metadata)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="border-t border-gray-200 p-3 flex items-center justify-between text-sm text-gray-600 bg-gray-50">
          <span>Tổng số: {total} log</span>
          <div className="flex gap-1">
            <button
              disabled={params.page <= 1}
              onClick={() => handlePageChange(params.page - 1)}
              className="px-2 py-1 border rounded disabled:opacity-50 bg-white"
            >
              Trước
            </button>
            <span className="px-3 py-1">Trang {params.page} / {totalPages || 1}</span>
            <button
              disabled={params.page >= totalPages}
              onClick={() => handlePageChange(params.page + 1)}
              className="px-2 py-1 border rounded disabled:opacity-50 bg-white"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
