import { useCallback, useEffect, useState } from 'react';
import { listAdminTickets, respondTicket } from '../../features/marketplace/api/marketplace.api';
import { AdminStatusBadge } from '../../features/admin/components/AdminStatusBadge';

export default function SupportTicketsPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [state, setState] = useState({ loading: true, error: '', success: '' });

  const load = useCallback(async () => {
    try {
      const data = await listAdminTickets({ status: status || undefined });
      setItems(data.items || []);
      setState((c) => ({ ...c, loading: false, error: '' }));
    } catch (error) {
      setState((c) => ({ ...c, loading: false, error: error?.response?.data?.message || 'Không thể tải yêu cầu hỗ trợ.' }));
    }
  }, [status]);

  useEffect(() => {
    setState((c) => ({ ...c, loading: true }));
    load();
  }, [load]);

  async function respond(item) {
    const adminResponse = window.prompt('Nội dung phản hồi khách hàng:');
    if (!adminResponse) return;
    const nextStatus = window.confirm('Đánh dấu là "Đã giải quyết" (RESOLVED)? Chọn Cancel nếu tiếp tục "Đang xử lý" (PROCESSING).') ? 'RESOLVED' : 'PROCESSING';
    
    try {
      await respondTicket(item.id, { status: nextStatus, adminResponse });
      setState((c) => ({ ...c, success: 'Đã gửi phản hồi ticket thành công.', error: '' }));
      await load();
    } catch (error) {
      setState((c) => ({ ...c, error: error?.response?.data?.message || 'Không thể phản hồi ticket.', success: '' }));
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap justify-between gap-3 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hỗ trợ & khiếu nại</h1>
          <p className="text-sm text-gray-500 mt-1">Quy trình tiếp nhận và phản hồi hỗ trợ một cấp giữa Khách hàng và Admin.</p>
        </div>
        <select
          className="select select-bordered select-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Lọc trạng thái ticket"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="OPEN">Mới tiếp nhận</option>
          <option value="PROCESSING">Đang xử lý</option>
          <option value="RESOLVED">Đã giải quyết</option>
          <option value="REJECTED">Từ chối</option>
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
          {items.map((item) => (
            <article className="card bg-white border border-gray-200 shadow-sm hover:shadow transition-shadow" key={item.id}>
              <div className="card-body p-5">
                <div className="flex flex-wrap justify-between gap-3 items-start">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{item.subject}</h2>
                    <div className="text-sm text-gray-500 mt-1">
                      Người gửi: <span className="font-medium text-gray-800">{item.user?.fullName}</span> ({item.user?.email})
                    </div>
                  </div>
                  <AdminStatusBadge status={item.status} />
                </div>

                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg my-2 whitespace-pre-wrap">
                  {item.description}
                </p>

                {item.adminResponse && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-amber-900 my-1">
                    <span className="font-bold block text-xs uppercase tracking-wider text-amber-700 mb-1">Phản hồi của Admin:</span>
                    <p className="whitespace-pre-wrap">{item.adminResponse}</p>
                  </div>
                )}

                <div className="card-actions justify-end mt-2">
                  <button className="btn btn-primary btn-sm" onClick={() => respond(item)}>
                    {item.adminResponse ? 'Cập nhật phản hồi' : 'Phản hồi ngay'}
                  </button>
                </div>
              </div>
            </article>
          ))}
          {items.length === 0 && (
            <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
              Không có yêu cầu hỗ trợ nào.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
