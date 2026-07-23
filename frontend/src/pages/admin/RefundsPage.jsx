import { useCallback, useEffect, useState } from 'react';
import { approveRefund, completeManualRefund, listAdminRefunds, rejectRefund } from '../../features/marketplace/api/marketplace.api';

export default function RefundsPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [state, setState] = useState({ loading: true, error: '', success: '' });
  const load = useCallback(async () => { setState((c) => ({ ...c, loading: true, error: '' })); try { const data = await listAdminRefunds({ status: status || undefined }); setItems(data.items || []); setState((c) => ({ ...c, loading: false })); } catch (error) { setState((c) => ({ ...c, loading: false, error: error?.response?.data?.message || 'Không thể tải yêu cầu hoàn tiền.' })); } }, [status]);
  useEffect(() => { load(); }, [load]);
  async function action(item, type) {
    const adminNote = window.prompt(type === 'reject' ? 'Lý do từ chối:' : 'Ghi chú xử lý:');
    if (!adminNote) return;
    try {
      if (type === 'approve') await approveRefund(item.id, adminNote);
      if (type === 'reject') await rejectRefund(item.id, adminNote);
      if (type === 'complete') {
        const reference = window.prompt('Mã tham chiếu hoàn tiền thủ công:');
        if (!reference) return;
        await completeManualRefund(item.id, adminNote, reference);
      }
      setState((c) => ({ ...c, success: 'Đã cập nhật yêu cầu hoàn tiền.', error: '' })); await load();
    } catch (error) { setState((c) => ({ ...c, error: error?.response?.data?.message || 'Không thể xử lý.', success: '' })); }
  }
  return <div className="p-6 space-y-5"><div className="flex flex-wrap justify-between gap-3"><div><h1 className="text-2xl font-bold">Yêu cầu hoàn tiền</h1><p className="text-sm text-gray-500">Ví ViVouch hoàn tự động; payOS cần ghi nhận hoàn thủ công.</p></div><select className="select select-bordered" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Tất cả</option><option value="REQUESTED">Chờ xử lý</option><option value="MANUAL_REFUND_REQUIRED">Chờ hoàn thủ công</option><option value="REFUNDED">Đã hoàn</option><option value="REJECTED">Từ chối</option></select></div>{state.error && <div className="alert alert-error">{state.error}</div>}{state.success && <div className="alert alert-success">{state.success}</div>}{state.loading ? <div className="py-12 text-center"><span className="loading loading-spinner loading-lg" /></div> : <div className="grid gap-3">{items.map((item) => <article className="card bg-white border border-gray-200" key={item.id}><div className="card-body py-4"><div className="flex flex-wrap justify-between gap-3"><div><b>#{item.orderId.slice(0, 8)}</b><div className="text-sm text-gray-500">{item.user?.fullName} — {item.user?.email}</div></div><span className="badge badge-outline">{item.status}</span></div><p>{item.reason}</p><div className="text-sm">{Number(item.order?.totalAmount || 0).toLocaleString('vi-VN')}₫ · {item.order?.payment?.method}</div><div className="card-actions justify-end">{item.status === 'REQUESTED' && <><button className="btn btn-success btn-sm" onClick={() => action(item, 'approve')}>Duyệt</button><button className="btn btn-error btn-outline btn-sm" onClick={() => action(item, 'reject')}>Từ chối</button></>}{item.status === 'MANUAL_REFUND_REQUIRED' && <button className="btn btn-primary btn-sm" onClick={() => action(item, 'complete')}>Xác nhận đã hoàn</button>}</div></div></article>)}{items.length === 0 && <p className="py-10 text-center text-gray-500">Không có yêu cầu.</p>}</div>}</div>;
}
