import { useState } from "react";
import {
  usePartnerBranches,
  useCreatePartnerBranch,
  useUpdatePartnerBranch,
  useDeletePartnerBranch,
} from "../../features/partner/hooks/usePartnerBranches";
import { ApiErrorToast } from "../../components/common/ApiErrorToast";
import { ApiSuccessToast } from "../../components/common/ApiSuccessToast";
import { ConfirmModal } from "../../components/common/ConfirmModal";

const EMPTY_FORM = { name: "", address: "", city: "Hồ Chí Minh", isActive: true };

export function BranchesPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [deletingBranch, setDeletingBranch] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState(null);

  const branchesQuery = usePartnerBranches();
  const createBranch = useCreatePartnerBranch();
  const updateBranch = useUpdatePartnerBranch();
  const deleteBranch = useDeletePartnerBranch();
  const branches = branchesQuery.data?.data || [];
  const isSaving = createBranch.isPending || updateBranch.isPending;

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const notifySuccess = (message) => {
    setError(null);
    setSuccess(message);
    setTimeout(() => setSuccess(""), 4000);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError(null);
    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      isActive: form.isActive,
    };

    const mutation = editingId ? updateBranch : createBranch;
    const variables = editingId ? { id: editingId, ...payload } : payload;
    mutation.mutate(variables, {
      onSuccess: () => {
        notifySuccess(editingId ? "Đã cập nhật chi nhánh." : "Đã tạo chi nhánh.");
        resetForm();
      },
      onError: setError,
    });
  };

  const handleEdit = (branch) => {
    setEditingId(branch.id);
    setForm({
      name: branch.name,
      address: branch.address,
      city: branch.city,
      isActive: branch.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggle = (branch) => {
    setError(null);
    updateBranch.mutate(
      { id: branch.id, isActive: !branch.isActive },
      {
        onSuccess: () => notifySuccess(branch.isActive ? "Đã tạm ngưng chi nhánh." : "Đã kích hoạt chi nhánh."),
        onError: setError,
      },
    );
  };

  const handleDelete = () => {
    if (!deletingBranch) return;
    setError(null);
    deleteBranch.mutate(deletingBranch.id, {
      onSuccess: () => {
        notifySuccess("Đã xóa chi nhánh chưa phát sinh dữ liệu.");
        setDeletingBranch(null);
      },
      onError: (mutationError) => {
        setError(mutationError);
        setDeletingBranch(null);
      },
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <ApiSuccessToast message={success} />
      <ApiErrorToast error={error || branchesQuery.error} />

      <header>
        <h1 className="text-3xl font-bold text-base-content">Quản lý chi nhánh</h1>
        <p className="mt-1 text-base-content/60">
          Chi nhánh đang hoạt động có thể được gắn với voucher và dùng khi xác nhận đổi mã.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between gap-4">
            <h2 className="card-title">{editingId ? "Cập nhật chi nhánh" : "Thêm chi nhánh"}</h2>
            {editingId && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={resetForm}>Hủy sửa</button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control">
              <span className="label-text mb-2">Tên chi nhánh</span>
              <input
                className="input input-bordered"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                maxLength={255}
                required
              />
            </label>
            <label className="form-control">
              <span className="label-text mb-2">Tỉnh/thành phố</span>
              <input
                className="input input-bordered"
                value={form.city}
                onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                maxLength={255}
                required
              />
            </label>
            <label className="form-control md:col-span-2">
              <span className="label-text mb-2">Địa chỉ</span>
              <input
                className="input input-bordered"
                value={form.address}
                onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                maxLength={255}
                required
              />
            </label>
          </div>

          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={form.isActive}
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
            />
            <span className="label-text">Kích hoạt ngay</span>
          </label>

          <div className="card-actions justify-end">
            <button className="btn btn-primary" disabled={isSaving || !form.name.trim() || !form.address.trim() || !form.city.trim()}>
              {isSaving ? <span className="loading loading-spinner" /> : editingId ? "Lưu thay đổi" : "Tạo chi nhánh"}
            </button>
          </div>
        </div>
      </form>

      <section className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title">Danh sách chi nhánh</h2>
            <span className="badge badge-neutral">{branches.length} chi nhánh</span>
          </div>

          {branchesQuery.isLoading ? (
            <div className="py-12 text-center"><span className="loading loading-spinner loading-lg" /></div>
          ) : branches.length === 0 ? (
            <div className="py-12 text-center text-base-content/60">Chưa có chi nhánh. Hãy tạo chi nhánh đầu tiên.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr><th>Tên</th><th>Địa chỉ</th><th>Trạng thái</th><th className="text-right">Thao tác</th></tr>
                </thead>
                <tbody>
                  {branches.map((branch) => (
                    <tr key={branch.id}>
                      <td className="font-semibold">{branch.name}</td>
                      <td><div>{branch.address}</div><div className="text-xs text-base-content/50">{branch.city}</div></td>
                      <td><span className={`badge ${branch.isActive ? "badge-success" : "badge-ghost"}`}>{branch.isActive ? "Hoạt động" : "Tạm ngưng"}</span></td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleEdit(branch)}>Sửa</button>
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => handleToggle(branch)} disabled={updateBranch.isPending}>
                            {branch.isActive ? "Tạm ngưng" : "Kích hoạt"}
                          </button>
                          <button type="button" className="btn btn-error btn-outline btn-sm" onClick={() => setDeletingBranch(branch)}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <ConfirmModal
        isOpen={Boolean(deletingBranch)}
        title="Xóa chi nhánh?"
        message="Chỉ chi nhánh chưa gắn voucher và chưa có lịch sử đổi mã mới được xóa. Dữ liệu đã phát sinh nên được chuyển sang tạm ngưng."
        confirmLabel="Xóa"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeletingBranch(null)}
        loading={deleteBranch.isPending}
      />
    </div>
  );
}
