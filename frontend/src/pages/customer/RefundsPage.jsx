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

  return <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
    <header><h1 className="text-3xl font-bold">Hoàn tiền</h1><p className="text-base-content/60">Chỉ đơn đã thanh toán, voucher chưa dùng và có chính sách cho phép hoàn mới đủ điều kiện.</p></header>
    {state.error && <div className="alert alert-error">{state.error}</div>}{state.success && <div className="alert alert-success">{state.success}</div>}
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <h2 className="card-title">Tạo yêu cầu</h2>
        {state.loading ? (
          <div className="py-8 text-center"><span className="loading loading-spinner" /></div>
        ) : refundableOrders.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-base-content/40">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Không có đơn hàng đủ điều kiện</h3>
            <p className="text-base-content/60 max-w-sm mt-2 mb-6">Bạn hiện không có đơn hàng nào đủ điều kiện để hoàn tiền. Chỉ những đơn hàng đã thanh toán, voucher chưa sử dụng và có chính sách cho phép hoàn mới có thể thực hiện thao tác này.</p>
            <Link to="/customer/home" className="btn btn-outline border-base-300 shadow-sm hover:border-primary hover:bg-primary/10 hover:text-primary">Khám phá Voucher</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-2">
            <label className="form-control"><span className="label-text mb-1">Đơn đủ điều kiện</span><select className="select select-bordered" value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} required><option value="">Chọn đơn</option>{refundableOrders.map((order) => <option key={order.id} value={order.id}>#{order.id.slice(0, 8)} — {Number(order.totalAmount).toLocaleString('vi-VN')}₫ — {order.payment?.method}</option>)}</select></label>
            <label className="form-control"><span className="label-text mb-1">Lý do</span><textarea className="textarea textarea-bordered min-h-28" minLength="10" maxLength="1000" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required /></label>
            <div className="card-actions justify-end mt-4"><button className="btn btn-primary" disabled={state.saving}>{state.saving ? <span className="loading loading-spinner" /> : 'Gửi yêu cầu'}</button></div>
          </form>
        )}
      </div>
    </div>
    <section className="card bg-base-100 border border-base-300"><div className="card-body"><h2 className="card-title">Lịch sử yêu cầu</h2>{state.loading ? <div className="py-8 text-center"><span className="loading loading-spinner" /></div> : <div className="space-y-3">{refunds.map((refund) => <article className="border border-base-300 rounded-xl p-4" key={refund.id}><div className="flex flex-wrap justify-between gap-2"><b>Đơn #{refund.orderId.slice(0, 8)}</b><span className="badge badge-outline">{statusLabel[refund.status] || refund.status}</span></div><p className="text-sm mt-2">{refund.reason}</p>{refund.adminNote && <p className="text-sm text-base-content/60 mt-2">Phản hồi: {refund.adminNote}</p>}</article>)}{refunds.length === 0 && <p className="text-center py-6 text-base-content/60">Chưa có yêu cầu.</p>}</div>}</div></section>
  </div>;
}
