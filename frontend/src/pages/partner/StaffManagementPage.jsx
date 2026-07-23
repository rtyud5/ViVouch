import { useCallback, useEffect, useMemo, useState } from 'react';
import { createStaff, listStaff, updateStaff } from '../../features/marketplace/api/marketplace.api';
import { apiClient } from '../../services/apiClient';

const EMPTY_FORM = { fullName: '', email: '', phone: '', branchId: '' };

export function StaffManagementPage() {
  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [state, setState] = useState({ loading: true, saving: false, error: '', success: '' });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const [staffData, branchResponse] = await Promise.all([listStaff(), apiClient.get('/partner/branches')]);
      setStaff(staffData);
      setBranches(branchResponse.data.data || []);
      setState((current) => ({ ...current, loading: false }));
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error?.response?.data?.message || 'Không thể tải danh sách nhân viên.' }));
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const activeBranches = useMemo(() => branches.filter((branch) => branch.isActive), [branches]);

  async function submit(event) {
    event.preventDefault();
    setState((current) => ({ ...current, saving: true, error: '', success: '' }));
    try {
      const created = await createStaff({ ...form, phone: form.phone.trim() || null });
      setForm(EMPTY_FORM);
      setState((current) => ({ ...current, saving: false, success: created.delivery?.otp ? 'Đã tạo Staff và gửi email thiết lập tài khoản.' : 'Đã tạo Staff nhưng chưa gửi được OTP. Hãy yêu cầu Staff dùng chức năng gửi lại mã.' }));
      await load();
    } catch (error) {
      setState((current) => ({ ...current, saving: false, error: error?.response?.data?.message || 'Không thể tạo Staff.' }));
    }
  }

  async function changeMember(member, payload) {
    setState((current) => ({ ...current, error: '', success: '' }));
    try {
      await updateStaff(member.id, payload);
      setState((current) => ({ ...current, success: 'Đã cập nhật nhân viên.' }));
      await load();
    } catch (error) {
      setState((current) => ({ ...current, error: error?.response?.data?.message || 'Không thể cập nhật nhân viên.' }));
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <header><h1 className="text-3xl font-bold">Nhân viên chi nhánh</h1><p className="text-base-content/60">Owner tạo Staff và giới hạn quyền đổi voucher theo đúng chi nhánh.</p></header>
      {state.error && <div className="alert alert-error">{state.error}</div>}
      {state.success && <div className="alert alert-success">{state.success}</div>}
      <form onSubmit={submit} className="card bg-base-100 border border-base-300"><div className="card-body">
        <h2 className="card-title">Thêm Staff</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="form-control"><span className="label-text mb-1">Họ tên</span><input className="input input-bordered" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required minLength="2" /></label>
          <label className="form-control"><span className="label-text mb-1">Email</span><input type="email" className="input input-bordered" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
          <label className="form-control"><span className="label-text mb-1">Số điện thoại</span><input className="input input-bordered" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label className="form-control"><span className="label-text mb-1">Chi nhánh</span><select className="select select-bordered" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })} required><option value="">Chọn chi nhánh</option>{activeBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
        </div>
        <div className="card-actions justify-end"><button className="btn btn-primary" disabled={state.saving || activeBranches.length === 0}>{state.saving ? <span className="loading loading-spinner" /> : 'Tạo Staff'}</button></div>
      </div></form>
      <section className="card bg-base-100 border border-base-300"><div className="card-body">
        <h2 className="card-title">Danh sách Staff</h2>
        {state.loading ? <div className="py-10 text-center"><span className="loading loading-spinner loading-lg" /></div> : (
          <div className="overflow-x-auto"><table className="table"><thead><tr><th>Nhân viên</th><th>Chi nhánh</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
            {staff.map((member) => <tr key={member.id}><td><div className="font-semibold">{member.user.fullName}</div><div className="text-xs text-base-content/60">{member.user.email}</div></td><td><select className="select select-bordered select-sm" value={member.branchId || ''} onChange={(e) => changeMember(member, { branchId: e.target.value })}>{activeBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></td><td><span className={`badge ${member.status === 'ACTIVE' ? 'badge-success' : member.status === 'INVITED' ? 'badge-warning' : 'badge-ghost'}`}>{member.status}</span></td><td><button className={`btn btn-sm ${member.status === 'INACTIVE' ? 'btn-success' : 'btn-error btn-outline'}`} onClick={() => changeMember(member, { status: member.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE' })}>{member.status === 'INACTIVE' ? 'Kích hoạt' : 'Khóa'}</button></td></tr>)}
          </tbody></table>{staff.length === 0 && <p className="py-8 text-center text-base-content/60">Chưa có Staff.</p>}</div>
        )}
      </div></section>
    </div>
  );
}
