import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getOrders } from '../../features/orders/api/orders.api';
import { listMyRefunds, requestRefund } from '../../features/marketplace/api/marketplace.api';
const statusLabel = {
  REQUESTED: 'Chờ Admin xử lý',
  REJECTED: 'Đã từ chối',
  MANUAL_REFUND_REQUIRED: 'Đang hoàn thủ công',
  REFUNDED: 'Đã hoàn tiền',
};

export function RefundsPage() {
  const [searchParams] = useSearchParams();
  const requestedOrderId = searchParams.get('orderId') || '';
  const [orders, setOrders] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [form, setForm] = useState({ orderId: '', reason: '' });
  const [state, setState] = useState({ loading: true, saving: false, error: '', success: '' });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const [orderData, refundData] = await Promise.all([getOrders(), listMyRefunds()]);
      setOrders(orderData);
      setRefunds(refundData);
      if (requestedOrderId && orderData.some((order) => order.id === requestedOrderId)) {
        setForm((current) => ({ ...current, orderId: requestedOrderId }));
      }
      setState((current) => ({ ...current, loading: false }));
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error?.response?.data?.message || 'Không thể tải dữ liệu hoàn tiền.' }));
    }
  }, [requestedOrderId]);

  useEffect(() => { load(); }, [load]);

  const refundableOrders = useMemo(
    () => orders.filter((order) => order.refundEligibility?.eligible),
    [orders],
  );

  async function submit(event) {
    event.preventDefault();
    setState((current) => ({ ...current, saving: true, error: '', success: '' }));
    try {
      await requestRefund(form);
      setForm({ orderId: '', reason: '' });
      setState((current) => ({ ...current, saving: false, success: 'Đã gửi yêu cầu. Voucher được tạm khóa trong thời gian xử lý.' }));
      await load();
    } catch (error) {
      setState((current) => ({ ...current, saving: false, error: error?.response?.data?.message || 'Không thể gửi yêu cầu hoàn tiền.' }));
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-primary">Hoàn tiền</h1>
        <p className="text-base-content/70">
          Chỉ đơn đã thanh toán, voucher chưa dùng và có chính sách cho phép hoàn mới đủ điều kiện.
        </p>
      </header>

      {state.error && (
        <div className="alert alert-error shadow-sm rounded-xl">
          <span className="material-symbols-outlined">error</span>
          <span>{state.error}</span>
        </div>
      )}
      {state.success && (
        <div className="alert alert-success shadow-sm rounded-xl">
          <span className="material-symbols-outlined">check_circle</span>
          <span>{state.success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Yêu cầu */}
        <div className="card bg-base-100 border border-base-200 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4 border-b border-base-200 pb-2">Tạo yêu cầu</h2>
            
            {state.loading ? (
              <div className="py-12 flex justify-center">
                <span className="loading loading-spinner loading-lg text-primary" />
              </div>
            ) : refundableOrders.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-primary">inventory_2</span>
                </div>
                <h3 className="text-lg font-bold mb-2">Không có đơn hàng đủ điều kiện</h3>
                <p className="text-sm text-base-content/60 max-w-xs mb-6">
                  Bạn hiện không có đơn hàng nào đủ điều kiện để hoàn tiền.
                </p>
                <Link to="/customer/home" className="btn btn-outline btn-primary rounded-full px-6">
                  Khám phá Voucher
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content/80">Đơn đủ điều kiện</span>
                  </label>
                  <select 
                    className="select select-bordered w-full rounded-xl focus:select-primary" 
                    value={form.orderId} 
                    onChange={(e) => setForm({ ...form, orderId: e.target.value })} 
                    required
                  >
                    <option value="" disabled>Chọn đơn hàng cần hoàn...</option>
                    {refundableOrders.map((order) => (
                      <option key={order.id} value={order.id}>
                        Đơn #{order.id.slice(0, 8)} — {Number(order.totalAmount).toLocaleString('vi-VN')}₫
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content/80">Lý do hoàn tiền</span>
                  </label>
                  <textarea 
                    className="textarea textarea-bordered h-32 rounded-xl focus:textarea-primary" 
                    placeholder="Vui lòng mô tả chi tiết lý do bạn muốn hoàn tiền..."
                    minLength="10" 
                    maxLength="1000" 
                    value={form.reason} 
                    onChange={(e) => setForm({ ...form, reason: e.target.value })} 
                    required 
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/50">Tối thiểu 10 ký tự</span>
                  </label>
                </div>

                <div className="pt-2">
                  <button className="btn btn-primary w-full rounded-xl text-lg h-12" disabled={state.saving}>
                    {state.saving ? <span className="loading loading-spinner" /> : 'Gửi yêu cầu hoàn tiền'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Lịch sử yêu cầu */}
        <section className="card bg-base-100 border border-base-200 shadow-md h-fit">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4 border-b border-base-200 pb-2">Lịch sử yêu cầu</h2>
            
            {state.loading ? (
              <div className="py-12 flex justify-center">
                <span className="loading loading-spinner loading-lg text-primary" />
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {refunds.map((refund) => (
                  <article className="bg-base-50 border border-base-200 rounded-xl p-4 hover:shadow-sm transition-shadow" key={refund.id}>
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <b className="text-primary font-bold">Đơn #{refund.orderId.slice(0, 8)}</b>
                      <span className={`badge ${refund.status === 'REFUNDED' ? 'badge-success text-white' : refund.status === 'REJECTED' ? 'badge-error text-white' : 'badge-warning'}`}>
                        {statusLabel[refund.status] || refund.status}
                      </span>
                    </div>
                    <p className="text-sm text-base-content/80 bg-base-100 p-3 rounded-lg border border-base-200">
                      <span className="font-semibold block mb-1 text-xs text-base-content/50">Lý do:</span>
                      {refund.reason}
                    </p>
                    {refund.adminNote && (
                      <div className="mt-3 text-sm bg-info/10 text-info-content p-3 rounded-lg border border-info/20">
                        <span className="font-semibold block mb-1 text-xs">Phản hồi từ Admin:</span>
                        <p>{refund.adminNote}</p>
                      </div>
                    )}
                  </article>
                ))}
                
                {refunds.length === 0 && (
                  <div className="text-center py-12 text-base-content/50 flex flex-col items-center">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">history</span>
                    <p>Chưa có yêu cầu hoàn tiền nào.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
