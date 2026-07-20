import React, { useState, useEffect } from 'react';
import { useOrders, useOrderById, useCancelOrder } from '../../features/admin/hooks/useOrders';
import { AdminTable } from '../../features/admin/components/AdminTable';
import { AdminStatusBadge } from '../../features/admin/components/AdminStatusBadge';
import { ApiSuccessToast } from '../../components/common/ApiSuccessToast';
import { ApiErrorToast } from '../../components/common/ApiErrorToast';

export default function OrdersPage() {
  const [params, setParams] = useState({ page: 1, limit: 10, status: '', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [toastSuccess, setToastSuccess] = useState('');
  const [toastError, setToastError] = useState(null);

  const { data, isLoading, isError, error, refetch } = useOrders(params);
  const { data: orderDetailData } = useOrderById(selectedOrderId);
  const orders = data?.data?.orders || [];
  const total = data?.data?.pagination?.total || 0;
  const totalPages = data?.data?.pagination?.totalPages || 1;
  const selectedOrder = orderDetailData?.data;
  const cancelOrder = useCancelOrder();

  const handleCancelOrder = () => {
    if (!selectedOrder || !cancelReason.trim()) return;
    setToastError(null);
    cancelOrder.mutate({ id: selectedOrder.id, reason: cancelReason.trim() }, {
      onSuccess: () => {
        setToastSuccess('Đã hủy đơn, khóa mã voucher và mô phỏng hoàn tiền.');
        setTimeout(() => setToastSuccess(''), 4000);
        setCancelReason('');
      },
      onError: setToastError,
    });
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setParams(p => ({ ...p, search: searchInput, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const columns = [
    {
      key: 'id',
      label: 'Mã Đơn',
      render: (row) => <span className="font-mono text-xs font-bold text-amber-600">#{row.id.split('-')[0]}</span>,
    },
    {
      key: 'customer',
      label: 'Khách hàng',
      render: (row) => (
        <div>
          <div className="font-semibold">{row.user?.fullName}</div>
          <div className="text-xs text-gray-500">{row.user?.email}</div>
        </div>
      ),
    },
    {
      key: 'itemsCount',
      label: 'Sản phẩm',
      render: (row) => <span className="text-sm">{row.items?.length || 0} vouchers</span>,
    },
    {
      key: 'totalAmount',
      label: 'Tổng tiền',
      render: (row) => <span className="font-semibold text-gray-900">{Number(row.totalAmount).toLocaleString('vi-VN')}₫</span>,
    },
    {
      key: 'payment',
      label: 'Thanh toán',
      render: (row) => <AdminStatusBadge status={row.payment?.status} />
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => <AdminStatusBadge status={row.status} />
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (row) => <span className="text-sm text-gray-500">{new Date(row.createdAt).toLocaleDateString('vi-VN')}</span>,
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row) => (
        <div className="flex justify-end pr-4">
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedOrderId(row.id); }}
            className="p-1 text-amber-600 hover:bg-amber-50 rounded"
            title="Xem chi tiết"
          >
            <span className="material-symbols-outlined text-[20px]">visibility</span>
          </button>
        </div>
      ),
    },
  ];

  const handlePageChange = (newPage) => {
    setParams(p => ({ ...p, page: newPage }));
  };

  return (
    <div className="p-6 h-full flex flex-col relative bg-[#f8f9ff]">
      <ApiSuccessToast message={toastSuccess} />
      <ApiErrorToast error={toastError} />
      <div className="mb-6 flex justify-between items-center text-[#0b1c30]">
        <h1 className="text-2xl font-bold">Quản lý Đơn hàng</h1>
      </div>

      {/* Error banner */}
      {isError && !isLoading && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
          <span className="material-symbols-outlined text-lg">error</span>
          <span className="flex-1">{error?.response?.data?.message || 'Không tải được danh sách đơn hàng. Vui lòng thử lại.'}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1 rounded border border-red-300 hover:bg-red-100 font-medium"
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded border border-gray-200 shadow-sm">
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              placeholder="Tìm theo mã hoặc email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <select
            value={params.status}
            onChange={(e) => setParams(p => ({ ...p, status: e.target.value, page: 1 }))}
            className="pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:border-amber-500"
          >
            <option value="">Trạng thái: Tất cả</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="PENDING_PAYMENT">Chờ thanh toán</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl flex-1 flex flex-col shadow-sm overflow-hidden">
        <div className="flex-1 overflow-auto">
          <AdminTable
            columns={columns}
            data={orders}
            loading={isLoading}
            onRowClick={(row) => setSelectedOrderId(row.id)}
            emptyMessage="Không tìm thấy đơn hàng nào"
          />
        </div>
        <div className="border-t border-gray-200 p-3 flex items-center justify-between text-sm text-gray-600 bg-gray-50">
          <span>Tổng số: {total} đơn hàng</span>
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

      {selectedOrder && (
        <aside className="fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div>
              <h3 className="text-lg font-bold">Chi tiết đơn hàng</h3>
              <p className="font-mono text-sm text-amber-600 mt-0.5">#{selectedOrder.id}</p>
            </div>
            <button onClick={() => setSelectedOrderId(null)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <section>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">person</span> Khách hàng
              </h4>
              <div className="p-3 border border-gray-200 rounded bg-gray-50 text-sm">
                <div className="font-bold mb-1">{selectedOrder.user?.fullName}</div>
                <div className="text-gray-600 space-y-1">
                  <div>Email: {selectedOrder.user?.email}</div>
                  {selectedOrder.user?.phone && <div>Phone: {selectedOrder.user?.phone}</div>}
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">receipt_long</span> Sản phẩm
              </h4>
              <div className="space-y-3">
                {selectedOrder.items?.map(item => (
                  <div key={item.id} className="flex flex-col gap-1 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="font-semibold text-sm">{item.voucher?.title}</div>
                    <div className="text-sm flex justify-between text-gray-600">
                      <span>SL: {item.qty}</span>
                      <span className="font-semibold text-gray-900">{Number(item.unitPrice).toLocaleString('vi-VN')}₫</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="font-bold text-sm">Tổng cộng</span>
                <span className="text-lg font-bold text-amber-600">{Number(selectedOrder.totalAmount).toLocaleString('vi-VN')}₫</span>
              </div>
            </section>

            <section>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">payments</span> Thanh toán
              </h4>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <AdminStatusBadge status={selectedOrder.payment?.status} />
                </div>
                {selectedOrder.payment?.amount != null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-semibold">{Number(selectedOrder.payment.amount).toLocaleString('vi-VN')}₫</span>
                  </div>
                )}
              </div>
            </section>

            {selectedOrder.voucherCodes && selectedOrder.voucherCodes.length > 0 && (
              <section>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">qr_code</span> Mã đã phát hành
                </h4>
                <div className="space-y-2">
                  {selectedOrder.voucherCodes.map(code => (
                    <div key={code.id} className="flex items-center justify-between p-2 border border-gray-200 rounded text-sm bg-white">
                      <span className="font-mono font-bold tracking-widest">{code.code}</span>
                      <AdminStatusBadge status={code.status} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {selectedOrder.status !== 'CANCELLED' && (
              <section className="rounded-lg border border-red-200 bg-red-50 p-4">
                <h4 className="font-bold text-red-800">Hủy đơn / hoàn tiền mô phỏng</h4>
                <p className="mt-1 text-xs text-red-700">
                  Không thể hủy khi bất kỳ mã nào đã được sử dụng. Mã chưa dùng sẽ chuyển CANCELLED và tồn kho được hoàn lại.
                </p>
                <textarea
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  maxLength={500}
                  placeholder="Lý do hủy đơn..."
                  className="textarea textarea-bordered w-full mt-3 bg-white"
                />
                <button
                  type="button"
                  className="btn btn-error btn-sm mt-3 w-full"
                  disabled={!cancelReason.trim() || cancelOrder.isPending}
                  onClick={handleCancelOrder}
                >
                  {cancelOrder.isPending ? <span className="loading loading-spinner" /> : 'Xác nhận hủy và hoàn tiền'}
                </button>
              </section>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
