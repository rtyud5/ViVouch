import { useCallback, useEffect, useState } from 'react';
import { approveRefund, completeManualRefund, listAdminRefunds, rejectRefund } from '../../features/marketplace/api/marketplace.api';
import { AdminStatusBadge } from '../../features/admin/components/AdminStatusBadge';

export default function RefundsPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [state, setState] = useState({ loading: true, error: '', success: '' });

  const load = useCallback(async () => {
    setState((c) => ({ ...c, loading: true, error: '' }));
    try {
      const data = await listAdminRefunds({ status: status || undefined });
      setItems(data.items || []);
      setState((c) => ({ ...c, loading: false }));
    } catch (error) {
      setState((c) => ({ ...c, loading: false, error: error?.response?.data?.message || 'Không thể tải yêu cầu hoàn tiền.' }));
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function action(item, type) {
    const isPayos = item.order?.payment?.method === 'PAYOS';
    const notePrompt = type === 'reject'
      ? 'Lý do từ chối:'
      : isPayos && type === 'approve'
      ? 'Ghi chú duyệt (payOS chuyển sang Chờ hoàn thủ công):'
      : 'Ghi chú xử lý hoàn tiền:';
    
    const adminNote = window.prompt(notePrompt);
    if (!adminNote) return;

    try {
      if (type === 'approve') {
        await approveRefund(item.id, adminNote);
      } else if (type === 'reject') {
        await rejectRefund(item.id, adminNote);
      } else if (type === 'complete') {
        const reference = window.prompt('Mã tham chiếu ngân hàng/payOS (bắt buộc cho hoàn thủ công):');
        if (!reference) return;
        await completeManualRefund(item.id, adminNote, reference);
      }
      setState((c) => ({ ...c, success: 'Đã cập nhật yêu cầu hoàn tiền.', error: '' }));
      await load();
    } catch (error) {
      setState((c) => ({ ...c, error: error?.response?.data?.message || 'Không thể xử lý.', success: '' }));
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap justify-between gap-3 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý hoàn tiền</h1>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-medium text-blue-600">Ví ViVouch:</span> Hoàn tự động vào ví khách · <span className="font-medium text-orange-600">payOS VietQR:</span> Cần Admin chuyển khoản ngân hàng và xác nhận mã tham chiếu thủ công (Không giả auto-refund).
          </p>
        </div>
        <select
          className="select select-bordered select-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Lọc trạng thái hoàn tiền"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="REQUESTED">Chờ duyệt</option>
          <option value="MANUAL_REFUND_REQUIRED">Chờ hoàn thủ công (payOS)</option>
          <option value="REFUNDED">Đã hoàn tiền</option>
          <option value="REJECTED">Đã từ chối</option>
        </select>
      </div>

      {state.error && <div className="alert alert-error text-sm">{state.error}</div>}
      {state.success && <div className="alert alert-success text-sm">{state.success}</div>}

      {state.loading ? (
        <div className="py-12 text-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => {
            const isPayOS = item.order?.payment?.method === 'PAYOS';
            const paymentLabel = isPayOS ? 'payOS VietQR (Hoàn thủ công)' : item.order?.payment?.method === 'VIVOUCH_WALLET' ? 'Ví ViVouch (Hoàn tự động)' : item.order?.payment?.method;
            
            return (
              <article className="card bg-white border border-gray-200 shadow-sm hover:shadow transition-shadow" key={item.id}>
                <div className="card-body p-5">
                  <div className="flex flex-wrap justify-between gap-3 items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">Đơn hàng #{item.orderId.slice(0, 8)}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 font-mono text-gray-600">
                          {paymentLabel}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Khách hàng: <span className="font-medium text-gray-800">{item.user?.fullName}</span> ({item.user?.email})
                      </div>
                    </div>
                    <AdminStatusBadge status={item.status} />
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg text-sm my-2 text-gray-700">
                    <span className="font-semibold">Lý do hoàn:</span> {item.reason}
                  </div>

                  <div className="flex flex-wrap justify-between items-center text-sm pt-1">
                    <div className="text-gray-600">
                      Số tiền hoàn: <span className="font-bold text-lg text-primary">{Number(item.order?.totalAmount || 0).toLocaleString('vi-VN')}₫</span>
                      {item.providerRefundReference && (
                        <span className="ml-3 text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-mono">
                          Mã GD hoàn: {item.providerRefundReference}
                        </span>
                      )}
                    </div>

                    <div className="card-actions justify-end gap-2 mt-2 sm:mt-0">
                      {item.status === 'REQUESTED' && (
                        <>
                          <button className="btn btn-success btn-sm text-white" onClick={() => action(item, 'approve')}>
                            {isPayOS ? 'Duyệt (Chờ chuyển khoản)' : 'Duyệt & Hoàn ví ngay'}
                          </button>
                          <button className="btn btn-error btn-outline btn-sm" onClick={() => action(item, 'reject')}>
                            Từ chối
                          </button>
                        </>
                      )}
                      {item.status === 'MANUAL_REFUND_REQUIRED' && (
                        <button className="btn btn-warning btn-sm" onClick={() => action(item, 'complete')}>
                          Xác nhận đã chuyển khoản payOS
                        </button>
                      )}
                    </div>
                  </div>

                  {item.adminNote && (
                    <div className="text-xs text-gray-500 mt-2 border-t pt-2">
                      <span className="font-semibold">Ghi chú xử lý Admin:</span> {item.adminNote}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
          {items.length === 0 && (
            <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
              Không có yêu cầu hoàn tiền nào.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
