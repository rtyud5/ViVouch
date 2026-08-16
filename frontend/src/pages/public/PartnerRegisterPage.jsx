import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerPartner } from '../../features/auth/api/auth.api';

export function PartnerRegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault(); setError('');
    const form = new FormData(event.currentTarget);
    const password = form.get('password');
    if (password !== form.get('confirmPassword')) return setError('Mật khẩu xác nhận không khớp.');
    const branchName = String(form.get('branchName') || '').trim();
    const branchAddress = String(form.get('branchAddress') || '').trim();
    if ((branchName && !branchAddress) || (!branchName && branchAddress)) {
      return setError('Tên và địa chỉ chi nhánh đầu tiên phải được nhập cùng nhau.');
    }
    setLoading(true);
    try {
      const result = await registerPartner({
        fullName: form.get('fullName'), email: form.get('email'), phone: form.get('phone') || null, password,
        businessName: form.get('businessName'), taxCode: form.get('taxCode'), representativeName: form.get('representativeName'),
        contactEmail: form.get('contactEmail') || form.get('email'), contactPhone: form.get('contactPhone') || form.get('phone') || null,
        address: form.get('address'),
        firstBranch: branchName ? { name: branchName, address: branchAddress, city: form.get('branchCity') || 'Hồ Chí Minh' } : undefined,
      });
      if (result.verificationRequired) {
        navigate(`/verify-email?email=${encodeURIComponent(result.user.email)}`);
      } else {
        navigate('/login', { state: { message: 'Đã tạo hồ sơ đối tác. Hãy đăng nhập để theo dõi phê duyệt.' } });
      }
    } catch (requestError) { setError(requestError?.response?.data?.message || 'Không thể tạo hồ sơ đối tác.'); }
    finally { setLoading(false); }
  }
  return <main className="min-h-screen bg-base-200 p-4 py-10"><div className="card bg-base-100 shadow-xl max-w-3xl mx-auto"><div className="card-body">
    <h1 className="card-title text-2xl">Đăng ký đối tác ViVouch</h1><p className="text-sm text-base-content/60">Người đăng ký sẽ trở thành Partner Owner sau khi Admin duyệt hồ sơ.</p>
    {error && <div className="alert alert-error text-sm">{error}</div>}
    <form onSubmit={submit} className="grid md:grid-cols-2 gap-4" autoComplete="off">
      {/* Thông tin tài khoản Owner */}
      <label className="form-control" key="fullName"><span className="label-text mb-1">Họ tên Owner</span><input name="fullName" type="text" autoComplete="name" className="input input-bordered" required /></label>
      <label className="form-control" key="email"><span className="label-text mb-1">Email đăng nhập</span><input name="email" type="email" autoComplete="username" className="input input-bordered" required /></label>
      <label className="form-control" key="phone"><span className="label-text mb-1">Số điện thoại</span><input name="phone" type="text" autoComplete="tel" className="input input-bordered" /></label>
      {/* Thông tin doanh nghiệp */}
      <label className="form-control" key="businessName"><span className="label-text mb-1">Tên doanh nghiệp</span><input name="businessName" type="text" autoComplete="organization" className="input input-bordered" required /></label>
      <label className="form-control" key="taxCode"><span className="label-text mb-1">Mã số thuế</span><input name="taxCode" type="text" autoComplete="off" className="input input-bordered" required /></label>
      <label className="form-control" key="representativeName"><span className="label-text mb-1">Người đại diện</span><input name="representativeName" type="text" autoComplete="off" className="input input-bordered" required /></label>
      <label className="form-control" key="contactEmail"><span className="label-text mb-1">Email liên hệ</span><input name="contactEmail" type="email" autoComplete="off" className="input input-bordered" /></label>
      <label className="form-control" key="contactPhone"><span className="label-text mb-1">Điện thoại liên hệ</span><input name="contactPhone" type="text" autoComplete="off" className="input input-bordered" /></label>
      <label className="form-control md:col-span-2" key="address"><span className="label-text mb-1">Địa chỉ doanh nghiệp</span><input name="address" type="text" autoComplete="street-address" className="input input-bordered" required /></label>
      {/* Chi nhánh đầu tiên */}
      <label className="form-control" key="branchName"><span className="label-text mb-1">Tên chi nhánh đầu tiên</span><input name="branchName" type="text" autoComplete="off" className="input input-bordered" /></label>
      <label className="form-control" key="branchAddress"><span className="label-text mb-1">Địa chỉ chi nhánh</span><input name="branchAddress" type="text" autoComplete="off" className="input input-bordered" /></label>
      <label className="form-control" key="branchCity"><span className="label-text mb-1">Thành phố</span><input name="branchCity" type="text" autoComplete="off" className="input input-bordered" /></label>
      {/* Mật khẩu — dùng new-password để Chrome không tự điền mật khẩu đã lưu */}
      <label className="form-control"><span className="label-text mb-1">Mật khẩu</span><input name="password" type="password" autoComplete="new-password" className="input input-bordered" minLength="8" required /></label>
      <label className="form-control"><span className="label-text mb-1">Xác nhận mật khẩu</span><input name="confirmPassword" type="password" autoComplete="new-password" className="input input-bordered" minLength="8" required /></label>
      <button className="btn btn-primary md:col-span-2" disabled={loading}>{loading ? <span className="loading loading-spinner" /> : 'Gửi hồ sơ đăng ký'}</button>
    </form><Link to="/login" className="btn btn-ghost btn-sm">Quay lại đăng nhập</Link>
  </div></div></main>;
}
