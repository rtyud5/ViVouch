import { useCallback, useEffect, useState } from 'react';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../features/marketplace/api/marketplace.api';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });

export function NotificationsPage() {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const data = await getNotifications();
      setState({ loading: false, error: '', data });
    } catch (error) {
      setState({ loading: false, error: error?.response?.data?.message || 'Không thể tải thông báo.', data: null });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function readOne(id) {
    await markNotificationRead(id);
    setState((current) => ({
      ...current,
      data: current.data ? {
        ...current.data,
        unread: Math.max(0, current.data.unread - 1),
        notifications: current.data.notifications.map((item) => item.id === id ? { ...item, isRead: true } : item),
      } : current.data,
    }));
  }

  async function readAll() {
    await markAllNotificationsRead();
    setState((current) => ({
      ...current,
      data: current.data ? {
        ...current.data,
        unread: 0,
        notifications: current.data.notifications.map((item) => ({ ...item, isRead: true })),
      } : current.data,
    }));
  }

  const notifications = state.data?.notifications || [];
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Thông báo</h1>
          <p className="text-base-content/60">Theo dõi thanh toán, voucher, hồ sơ và yêu cầu hỗ trợ.</p>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={readAll} disabled={!state.data?.unread}>
          Đánh dấu tất cả đã đọc
        </button>
      </div>
      {state.error && <div className="alert alert-error"><span>{state.error}</span><button className="btn btn-sm" onClick={load}>Thử lại</button></div>}
      {state.loading && <div className="py-12 text-center"><span className="loading loading-spinner loading-lg" /></div>}
      {!state.loading && notifications.length === 0 && <div className="card bg-base-100 border border-base-300"><div className="card-body text-center text-base-content/60">Chưa có thông báo.</div></div>}
      <div className="space-y-3">
        {notifications.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => !item.isRead && readOne(item.id)}
            className={`w-full text-left card border transition ${item.isRead ? 'bg-base-100 border-base-300' : 'bg-primary/5 border-primary/30'}`}
          >
            <div className="card-body py-4">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="font-bold">{item.title}</h2><p className="text-sm text-base-content/70 mt-1">{item.message}</p></div>
                {!item.isRead && <span className="badge badge-primary badge-sm">Mới</span>}
              </div>
              <time className="text-xs text-base-content/50">{dateFormatter.format(new Date(item.createdAt))}</time>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
