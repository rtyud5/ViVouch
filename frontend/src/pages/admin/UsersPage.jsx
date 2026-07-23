import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { AdminTable, AdminStatusBadge } from '../../features/admin/components';
import { useUsers, useToggleUserLock, useAssignUserRole } from '../../features/admin/hooks/useUsers';
import { adjustWallet } from '../../features/admin/api/adminApi';
import { useAuthStore } from '../../stores/authStore';
import { ApiSuccessToast } from '../../components/common/ApiSuccessToast';
import { ApiErrorToast } from '../../components/common/ApiErrorToast';

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default function UsersPage() {
  const [params, setParams] = useState({ page: 1, limit: 10, role: '', isLocked: '', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [toastSuccess, setToastSuccess] = useState('');
  const [toastError, setToastError] = useState(null);
  const currentUser = useAuthStore((state) => state.user);

  const { data, isLoading, refetch } = useUsers(params);
  const { mutate: toggleUserLock, isPending: isTogglePending } = useToggleUserLock();
  const { mutate: assignUserRole, isPending: isRolePending } = useAssignUserRole();

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value) => {
      setParams((prev) => ({ ...prev, search: value, page: 1 }));
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    const filterValue = value === 'Tất cả' ? '' : value;
    setParams((prev) => ({ ...prev, [key]: filterValue, page: 1 }));
  };

  const handleToggleLock = (e, userId) => {
    e.stopPropagation();
    setToastError(null);
    toggleUserLock(userId, {
      onSuccess: (res) => {
        const isLocked = res?.data?.isLocked;
        setToastSuccess(isLocked ? 'Đã khóa tài khoản thành công.' : 'Đã mở khóa tài khoản thành công.');
        setTimeout(() => setToastSuccess(''), 4000);
      },
      onError: (err) => {
        setToastError(err);
      },
    });
  };

  const handleRoleChange = (event, userId) => {
    event.stopPropagation();
    const role = event.target.value;
    setToastError(null);
    assignUserRole({ userId, role }, {
      onSuccess: () => {
        setToastSuccess('Đã cập nhật vai trò và thu hồi các phiên đăng nhập cũ.');
        setTimeout(() => setToastSuccess(''), 4000);
      },
      onError: setToastError,
    });
  };


  const handleWalletAdjust = async () => {
    if (!selectedUser || selectedUser.role !== 'CUSTOMER') return;
    const rawAmount = window.prompt('Nhập số tiền điều chỉnh (dương để cộng, âm để trừ):', '100000');
    if (rawAmount === null) return;
    const amount = Number(rawAmount);
    if (!Number.isInteger(amount) || amount === 0) {
      setToastError(new Error('Số tiền phải là số nguyên khác 0.'));
      return;
    }
    const note = window.prompt('Lý do điều chỉnh:', 'Cộng số dư demo');
    if (!note?.trim()) return;
    try {
      const response = await adjustWallet(selectedUser.id, amount, note.trim());
      setToastSuccess(`Số dư mới: ${Number(response.data.balance).toLocaleString('vi-VN')}₫`);
      setSelectedUser((current) => ({ ...current, wallet: { balance: response.data.balance } }));
      await refetch();
    } catch (error) {
      setToastError(error);
    }
  };

  const columns = [
    {
      key: 'user',
      label: 'Người dùng',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.avatarUrl ? (
            <img src={row.avatarUrl} alt={row.fullName} className="w-8 h-8 rounded-full border border-gray-200 shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold shrink-0">
              {row.fullName?.charAt(0) || row.email?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-[14px] text-gray-900 font-medium">
            {row.fullName}
          </span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) => <span className="text-gray-600 text-[13px]">{row.email}</span>,
    },
    {
      key: 'role',
      label: 'Vai trò',
      render: (row) => {
        const isSelf = currentUser?.id === row.id;
        return isSelf ? (
          <span className="badge badge-warning">{row.role} · Bạn</span>
        ) : (
          <select
            aria-label={`Vai trò của ${row.fullName}`}
            value={row.role}
            disabled={isRolePending}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => handleRoleChange(event, row.id)}
            className="select select-bordered select-xs"
          >
            <option value="CUSTOMER">Khách hàng</option>
            <option value="PARTNER">Đối tác</option>
            <option value="ADMIN">Admin</option>
          </select>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Ngày đăng ký',
      render: (row) => (
        <span className="text-gray-500 text-[13px]">
          {new Date(row.createdAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'orders',
      label: 'Số đơn hàng',
      render: (row) => <div className="text-right font-medium">{row._count?.orders || 0}</div>,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => {
        const isSelf = currentUser?.id === row.id;
        return (
          <div className="flex justify-center">
            {isSelf ? (
              <span className="text-xs text-gray-400 italic" title="Không thể khóa tài khoản của chính mình">Bạn</span>
            ) : (
              <button 
                type="button"
                role="switch"
                aria-checked={!row.isLocked}
                aria-label={row.isLocked ? "Mở khóa người dùng" : "Khóa người dùng"}
                onClick={(e) => handleToggleLock(e, row.id)}
                disabled={isTogglePending}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${row.isLocked ? 'bg-gray-300' : 'bg-green-500'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition shadow-sm ${row.isLocked ? 'translate-x-[2px]' : 'translate-x-4'}`} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 h-full flex flex-col relative">
      <ApiSuccessToast message={toastSuccess} />
      <ApiErrorToast error={toastError} />
      {/* Header */}
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Quản lý người dùng</h1>
          <p className="text-sm text-gray-500">Quản lý tài khoản khách hàng, đối tác và phân quyền hệ thống.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4 shrink-0 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1 max-w-sm relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
          <input 
            type="text" 
            placeholder="Tìm kiếm..."
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Vai trò:</span>
          <select 
            className="text-sm py-1.5 pl-3 pr-8 border-gray-300 rounded-md focus:border-amber-500"
            onChange={(e) => handleFilterChange('role', e.target.value)}
          >
            <option value="Tất cả">Tất cả</option>
            <option value="CUSTOMER">Khách hàng</option>
            <option value="PARTNER">Đối tác</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div className="w-px h-6 bg-gray-200"></div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Trạng thái:</span>
          <select 
            className="text-sm py-1.5 pl-3 pr-8 border-gray-300 rounded-md focus:border-amber-500"
            onChange={(e) => handleFilterChange('isLocked', e.target.value)}
          >
            <option value="Tất cả">Tất cả</option>
            <option value="false">Hoạt động</option>
            <option value="true">Bị khóa</option>
          </select>
        </div>
      </div>

      <AdminTable 
        columns={columns} 
        data={users} 
        loading={isLoading} 
        onRowClick={(user) => setSelectedUser(user)}
      />
      
      {/* Pagination summary */}
      <div className="mt-4 text-sm text-gray-500 shrink-0">
        Hiển thị trang {pagination.page} / {pagination.totalPages} (Tổng {pagination.total})
      </div>

      {/* Selected-user detail drawer */}
      {selectedUser && (
        <aside className="w-[400px] h-full bg-white border-l border-gray-200 shadow-[-8px_0_24px_rgba(0,0,0,0.05)] flex flex-col shrink-0 z-20 absolute right-0 top-0">
          <div className="p-6 border-b border-gray-100 shrink-0 relative bg-gradient-to-b from-blue-50 to-white">
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div className="flex flex-col items-center mt-2 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-3xl font-bold mb-3 shadow-sm border-2 border-white relative">
                {selectedUser.fullName?.charAt(0) || selectedUser.email?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{selectedUser.fullName}</h2>
              <p className="text-sm text-gray-500 mb-2">{selectedUser.email}</p>
              {selectedUser.role === 'CUSTOMER' && (
                <div className="mt-4 w-full rounded-lg border border-amber-200 bg-amber-50 p-3 text-left">
                  <div className="text-xs text-gray-500">Số dư Ví ViVouch</div>
                  <div className="text-lg font-bold text-amber-700">{Number(selectedUser.wallet?.balance || 0).toLocaleString('vi-VN')}₫</div>
                  <button type="button" className="btn btn-warning btn-sm mt-2 w-full" onClick={handleWalletAdjust}>Điều chỉnh số dư demo</button>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
