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

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-primary">Hỗ trợ & khiếu nại</h1>
        <p className="text-base-content/70">
          Gửi vấn đề cho Admin và theo dõi phản hồi ngay trong hệ thống.
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
        <form onSubmit={submit} className="card bg-base-100 border border-base-200 shadow-md h-fit">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4 border-b border-base-200 pb-2">Tạo yêu cầu mới</h2>
            
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base-content/80">Loại yêu cầu</span>
                </label>
                <select 
                  className="select select-bordered w-full rounded-xl focus:select-primary" 
                  value={form.type} 
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {TYPES.map(([value, label]) => (
                    <option value={value} key={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base-content/80">Đơn liên quan (không bắt buộc)</span>
                </label>
                <select 
                  className="select select-bordered w-full rounded-xl focus:select-primary" 
                  value={form.orderId} 
                  onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                >
                  <option value="">Không chọn</option>
                  {orders.map((order) => (
                    <option value={order.id} key={order.id}>Đơn #{order.id.slice(0, 8)}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base-content/80">Tiêu đề</span>
                </label>
                <input 
                  className="input input-bordered w-full rounded-xl focus:input-primary" 
                  placeholder="Tóm tắt vấn đề của bạn..."
                  minLength="5" 
                  maxLength="200" 
                  value={form.subject} 
                  onChange={(e) => setForm({ ...form, subject: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base-content/80">Mô tả chi tiết</span>
                </label>
                <textarea 
                  className="textarea textarea-bordered h-32 rounded-xl focus:textarea-primary" 
                  placeholder="Vui lòng mô tả chi tiết vấn đề bạn đang gặp phải..."
                  minLength="10" 
                  maxLength="2000" 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  required 
                />
              </div>
            </div>

            <div className="card-actions justify-end mt-6">
              <button className="btn btn-primary w-full rounded-xl text-lg h-12" disabled={state.saving}>
                {state.saving ? <span className="loading loading-spinner" /> : 'Gửi yêu cầu'}
              </button>
            </div>
          </div>
        </form>

        {/* Danh sách yêu cầu */}
        <section className="card bg-base-100 border border-base-200 shadow-md h-fit">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4 border-b border-base-200 pb-2">Lịch sử yêu cầu</h2>
            
            {state.loading ? (
              <div className="py-12 flex justify-center">
                <span className="loading loading-spinner loading-lg text-primary" />
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {tickets.map((ticket) => (
                  <article className="bg-base-50 border border-base-200 rounded-xl p-4 hover:shadow-sm transition-shadow" key={ticket.id}>
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <h3 className="font-bold text-primary flex-1">{ticket.subject}</h3>
                      <span className={`badge whitespace-nowrap ${ticket.status === 'RESOLVED' ? 'badge-success text-white' : ticket.status === 'OPEN' ? 'badge-warning' : 'badge-neutral'}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm text-base-content/80 bg-base-100 p-3 rounded-lg border border-base-200 mt-2">
                      {ticket.description}
                    </p>
                    {ticket.adminResponse && (
                      <div className="mt-3 text-sm bg-info/10 text-info-content p-3 rounded-lg border border-info/20">
                        <span className="font-semibold block mb-1 text-xs">Phản hồi từ Admin:</span>
                        <p>{ticket.adminResponse}</p>
                      </div>
                    )}
                  </article>
                ))}
                
                {tickets.length === 0 && (
                  <div className="text-center py-12 text-base-content/50 flex flex-col items-center">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">headset_mic</span>
                    <p>Chưa có yêu cầu hỗ trợ nào.</p>
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
