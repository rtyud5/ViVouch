import { useEffect, useState } from 'react';
import { getStaffRedeemHistory } from '../../features/marketplace/api/marketplace.api';

export function StaffRedeemHistoryPage() {
  const [state, setState] = useState({ loading: true, error: '', items: [] });
  useEffect(() => {
    getStaffRedeemHistory()
      .then((items) => setState({ loading: false, error: '', items }))
      .catch((error) => setState({ loading: false, error: error?.response?.data?.message || 'Không thể tải lịch sử.', items: [] }));
  }, []);
  return <div className="p-4 md:p-8 max-w-5xl mx-auto"><h1 className="text-3xl font-bold mb-2">Lịch sử đổi voucher</h1><p className="text-base-content/60 mb-6">Các mã do tài khoản Staff hiện tại xác nhận tại chi nhánh được giao.</p>{state.error && <div className="alert alert-error">{state.error}</div>}{state.loading ? <div className="py-12 text-center"><span className="loading loading-spinner loading-lg" /></div> : <div className="overflow-x-auto bg-base-100 border border-base-300 rounded-xl"><table className="table"><thead><tr><th>Voucher</th><th>Mã</th><th>Chi nhánh</th><th>Thời gian</th></tr></thead><tbody>{state.items.map((item) => <tr key={item.id}><td>{item.voucherCode?.voucher?.title}</td><td className="font-mono">{item.voucherCode?.code}</td><td>{item.branch?.name}</td><td>{new Date(item.redeemedAt).toLocaleString('vi-VN')}</td></tr>)}</tbody></table>{state.items.length === 0 && <p className="p-8 text-center text-base-content/60">Chưa có lượt đổi voucher.</p>}</div>}</div>;
}
