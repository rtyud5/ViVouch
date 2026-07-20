import { useEffect, useState } from 'react';
import { useContent, useCreateContent, useUpdateContent, useDeleteContent } from '../../features/admin/hooks/useContent';
import { ApiErrorToast } from '../../components/common/ApiErrorToast';
import { ApiSuccessToast } from '../../components/common/ApiSuccessToast';

const CONFIG = {
  categories: {
    label: 'Danh mục',
    empty: { name: '', slug: '', icon: '' },
    fields: [
      ['name', 'Tên danh mục', 'text'],
      ['slug', 'Slug', 'text'],
      ['icon', 'Icon', 'text'],
    ],
  },
  pages: {
    label: 'Trang / bài viết / chính sách',
    empty: { title: '', slug: '', content: '', status: 'DRAFT' },
    fields: [
      ['title', 'Tiêu đề', 'text'],
      ['slug', 'Slug', 'text'],
      ['content', 'Nội dung', 'textarea'],
      ['status', 'Trạng thái', 'page-status'],
    ],
  },
  banners: {
    label: 'Banner / popup',
    empty: { title: '', imageUrl: '', linkUrl: '', position: 'HOME_HERO', sortOrder: 0, isActive: true },
    fields: [
      ['title', 'Tiêu đề', 'text'],
      ['imageUrl', 'URL hình ảnh', 'url'],
      ['linkUrl', 'URL liên kết', 'url'],
      ['position', 'Vị trí', 'position'],
      ['sortOrder', 'Thứ tự', 'number'],
      ['isActive', 'Đang hiển thị', 'boolean'],
    ],
  },
};

function ContentField({ field, value, onChange }) {
  const [name, label, type] = field;
  if (type === 'textarea') {
    return <label className="form-control md:col-span-2"><span className="label-text mb-1">{label}</span><textarea className="textarea textarea-bordered min-h-32" value={value} onChange={(event) => onChange(name, event.target.value)} required /></label>;
  }
  if (type === 'page-status') {
    return <label className="form-control"><span className="label-text mb-1">{label}</span><select className="select select-bordered" value={value} onChange={(event) => onChange(name, event.target.value)}><option value="DRAFT">Bản nháp</option><option value="PUBLISHED">Đã xuất bản</option></select></label>;
  }
  if (type === 'position') {
    return <label className="form-control"><span className="label-text mb-1">{label}</span><select className="select select-bordered" value={value} onChange={(event) => onChange(name, event.target.value)}><option value="HOME_HERO">Trang chủ</option><option value="HOME_SECONDARY">Khối phụ</option><option value="POPUP">Popup</option></select></label>;
  }
  if (type === 'boolean') {
    return <label className="label cursor-pointer justify-start gap-3"><input type="checkbox" className="toggle toggle-primary" checked={Boolean(value)} onChange={(event) => onChange(name, event.target.checked)} /><span className="label-text">{label}</span></label>;
  }
  return <label className="form-control"><span className="label-text mb-1">{label}</span><input type={type} min={type === 'number' ? 0 : undefined} className="input input-bordered" value={value ?? ''} onChange={(event) => onChange(name, type === 'number' ? Number(event.target.value) : event.target.value)} required={!['icon', 'linkUrl'].includes(name)} /></label>;
}

export function CmsPagesPage() {
  const [type, setType] = useState('categories');
  const [form, setForm] = useState(CONFIG.categories.empty);
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState(null);
  const query = useContent(type);
  const createMutation = useCreateContent();
  const updateMutation = useUpdateContent();
  const deleteMutation = useDeleteContent();
  const config = CONFIG[type];
  const items = query.data || [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    setForm(CONFIG[type].empty);
    setEditingId(null);
  }, [type]);

  const notify = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 4000);
  };

  const normalize = () => Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value === '' && ['icon', 'linkUrl'].includes(key) ? null : value]));

  const submit = (event) => {
    event.preventDefault();
    setError(null);
    const mutation = editingId ? updateMutation : createMutation;
    mutation.mutate({ type, id: editingId, data: normalize() }, {
      onSuccess: () => {
        notify(editingId ? 'Đã cập nhật nội dung.' : 'Đã tạo nội dung.');
        setForm(config.empty);
        setEditingId(null);
      },
      onError: setError,
    });
  };

  const edit = (item) => {
    setEditingId(item.id);
    setForm(Object.fromEntries(Object.keys(config.empty).map((key) => [key, item[key] ?? config.empty[key]])));
  };

  const remove = (item) => {
    if (!window.confirm(`Xóa “${item.title || item.name}”?`)) return;
    setError(null);
    deleteMutation.mutate({ type, id: item.id }, {
      onSuccess: () => notify('Đã xóa nội dung.'),
      onError: setError,
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <ApiSuccessToast message={success} />
      <ApiErrorToast error={error || query.error} />
      <header><h1 className="text-3xl font-bold">Quản lý nội dung</h1><p className="text-base-content/60 mt-1">Quản lý danh mục, banner, popup, bài viết và chính sách.</p></header>

      <div role="tablist" className="tabs tabs-boxed w-fit">
        {Object.entries(CONFIG).map(([key, value]) => <button key={key} role="tab" className={`tab ${type === key ? 'tab-active' : ''}`} onClick={() => setType(key)}>{value.label}</button>)}
      </div>

      <form onSubmit={submit} className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <div className="flex justify-between"><h2 className="card-title">{editingId ? 'Cập nhật' : 'Tạo mới'} {config.label.toLowerCase()}</h2>{editingId && <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setEditingId(null); setForm(config.empty); }}>Hủy sửa</button>}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{config.fields.map((field) => <ContentField key={field[0]} field={field} value={form[field[0]]} onChange={(name, value) => setForm((current) => ({ ...current, [name]: value }))} />)}</div>
          <div className="card-actions justify-end"><button className="btn btn-primary" disabled={isSaving}>{isSaving ? <span className="loading loading-spinner" /> : 'Lưu nội dung'}</button></div>
        </div>
      </form>

      <section className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Danh sách {config.label.toLowerCase()} <span className="badge">{items.length}</span></h2>
          {query.isLoading ? <div className="py-12 text-center"><span className="loading loading-spinner loading-lg" /></div> : items.length === 0 ? <p className="py-12 text-center text-base-content/60">Chưa có dữ liệu.</p> : (
            <div className="overflow-x-auto"><table className="table"><thead><tr><th>Tên / tiêu đề</th><th>Slug / vị trí</th><th>Trạng thái</th><th className="text-right">Thao tác</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td className="font-semibold">{item.title || item.name}</td><td className="font-mono text-xs">{item.slug || item.position}</td><td><span className="badge badge-ghost">{item.status || (item.isActive ? 'ACTIVE' : 'INACTIVE') || '—'}</span></td><td><div className="flex justify-end gap-2"><button className="btn btn-ghost btn-sm" onClick={() => edit(item)}>Sửa</button><button className="btn btn-error btn-outline btn-sm" onClick={() => remove(item)} disabled={deleteMutation.isPending}>Xóa</button></div></td></tr>)}</tbody></table></div>
          )}
        </div>
      </section>
    </div>
  );
}
