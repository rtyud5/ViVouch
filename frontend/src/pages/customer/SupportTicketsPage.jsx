import { useCallback, useEffect, useState } from 'react';
import { getOrders } from '../../features/orders/api/orders.api';
import { createTicket, listMyTickets } from '../../features/marketplace/api/marketplace.api';

const TYPES = [
  ['PAYMENT_PROBLEM', 'Vấn đề thanh toán'],
  ['VOUCHER_NOT_ACCEPTED', 'Đối tác không nhận voucher'],
  ['REFUND_REQUEST', 'Vấn đề hoàn tiền'],
  ['CODE_PROBLEM', 'Lỗi mã voucher'],
  ['OTHER', 'Khác'],
];

export function SupportTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ type: 'PAYMENT_PROBLEM', subject: '', description: '', orderId: '' });
  const [state, setState] = useState({ loading: true, saving: false, error: '', success: '' });

  const load = useCallback(async () => {
    try {
      const [ticketData, orderData] = await Promise.all([listMyTickets(), getOrders()]);
      setTickets(ticketData); setOrders(orderData); setState((current) => ({ ...current, loading: false, error: '' }));
    } catch (error) { setState((current) => ({ ...current, loading: false, error: error?.response?.data?.message || 'Không thể tải yêu cầu hỗ trợ.' })); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function submit(event) {
    event.preventDefault(); setState((current) => ({ ...current, saving: true, error: '', success: '' }));
    try {
      await createTicket({ ...form, orderId: form.orderId || null });
      setForm({ type: 'PAYMENT_PROBLEM', subject: '', description: '', orderId: '' });
      setState((current) => ({ ...current, saving: false, success: 'Đã gửi yêu cầu hỗ trợ.' })); await load();
    } catch (error) { setState((current) => ({ ...current, saving: false, error: error?.response?.data?.message || 'Không thể gửi yêu cầu.' })); }
  }

  return <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6"><header><h1 className="text-3xl font-bold">Hỗ trợ & khiếu nại</h1><p className="text-base-content/60">Gửi vấn đề cho Admin và theo dõi phản hồi ngay trong hệ thống.</p></header>{state.error && <div className="alert alert-error">{state.error}</div>}{state.success && <div className="alert alert-success">{state.success}</div>}
    <form onSubmit={submit} className="card bg-base-100 border border-base-300"><div className="card-body"><div className="grid md:grid-cols-2 gap-4"><label className="form-control"><span className="label-text mb-1">Loại yêu cầu</span><select className="select select-bordered" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{TYPES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className="form-control"><span className="label-text mb-1">Đơn liên quan (không bắt buộc)</span><select className="select select-bordered" value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })}><option value="">Không chọn</option>{orders.map((order) => <option value={order.id} key={order.id}>#{order.id.slice(0, 8)}</option>)}</select></label></div><label className="form-control"><span className="label-text mb-1">Tiêu đề</span><input className="input input-bordered" minLength="5" maxLength="200" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required /></label><label className="form-control"><span className="label-text mb-1">Mô tả</span><textarea className="textarea textarea-bordered min-h-28" minLength="10" maxLength="2000" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label><div className="card-actions justify-end"><button className="btn btn-primary" disabled={state.saving}>{state.saving ? <span className="loading loading-spinner" /> : 'Gửi yêu cầu'}</button></div></div></form>
    <section className="space-y-3">{state.loading ? <div className="py-8 text-center"><span className="loading loading-spinner" /></div> : tickets.map((ticket) => <article className="card bg-base-100 border border-base-300" key={ticket.id}><div className="card-body py-4"><div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold">{ticket.subject}</h2><span className="badge badge-outline">{ticket.status}</span></div><p className="text-sm">{ticket.description}</p>{ticket.adminResponse && <div className="alert mt-2"><span><b>Admin:</b> {ticket.adminResponse}</span></div>}</div></article>)}</section>
  </div>;
}
