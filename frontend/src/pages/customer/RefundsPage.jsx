import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getOrders } from '../../features/orders/api/orders.api';
import { listMyRefunds, requestRefund } from '../../features/marketplace/api/marketplace.api';
import { getRefundEligibility } from '../../utils/refundEligibility';

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
    () => orders.filter((order) => getRefundEligibility(order).eligible),
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
    <form onSubmit={submit} className="card bg-base-100 border border-base-300"><div className="card-body"><h2 className="card-title">Tạo yêu cầu</h2>
      <label className="form-control"><span className="label-text mb-1">Đơn đủ điều kiện</span><select className="select select-bordered" value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} required><option value="">Chọn đơn</option>{refundableOrders.map((order) => <option key={order.id} value={order.id}>#{order.id.slice(0, 8)} — {Number(order.totalAmount).toLocaleString('vi-VN')}₫ — {order.payment?.method}</option>)}</select></label>
      <label className="form-control"><span className="label-text mb-1">Lý do</span><textarea className="textarea textarea-bordered min-h-28" minLength="10" maxLength="1000" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required /></label>
      <div className="card-actions justify-end"><button className="btn btn-primary" disabled={state.saving || refundableOrders.length === 0}>{state.saving ? <span className="loading loading-spinner" /> : 'Gửi yêu cầu'}</button></div>
      {refundableOrders.length === 0 && <p className="text-sm text-base-content/60">Hiện không có đơn đủ điều kiện hoàn.</p>}
    </div></form>
    <section className="card bg-base-100 border border-base-300"><div className="card-body"><h2 className="card-title">Lịch sử yêu cầu</h2>{state.loading ? <div className="py-8 text-center"><span className="loading loading-spinner" /></div> : <div className="space-y-3">{refunds.map((refund) => <article className="border border-base-300 rounded-xl p-4" key={refund.id}><div className="flex flex-wrap justify-between gap-2"><b>Đơn #{refund.orderId.slice(0, 8)}</b><span className="badge badge-outline">{statusLabel[refund.status] || refund.status}</span></div><p className="text-sm mt-2">{refund.reason}</p>{refund.adminNote && <p className="text-sm text-base-content/60 mt-2">Phản hồi: {refund.adminNote}</p>}</article>)}{refunds.length === 0 && <p className="text-center py-6 text-base-content/60">Chưa có yêu cầu.</p>}</div>}</div></section>
  </div>;
}
