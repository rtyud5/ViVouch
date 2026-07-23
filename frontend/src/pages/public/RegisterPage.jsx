import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../features/auth/api/auth.api';

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password'));
    if (password !== form.get('confirmPassword')) return setError('Mật khẩu xác nhận không khớp.');
    setLoading(true);
    try {
      const data = await register({
        fullName: form.get('fullName'), email: form.get('email'), phone: form.get('phone') || null, password,
      });
      if (data.verificationRequired) navigate(`/verify-email?email=${encodeURIComponent(data.user.email)}`);
      else navigate('/login', { state: { message: 'Đăng ký thành công. Hãy đăng nhập.' } });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Không thể đăng ký tài khoản.');
    } finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-base-200 grid place-items-center p-4">
    <div className="card bg-base-100 shadow-xl w-full max-w-lg"><div className="card-body">
      <h1 className="card-title text-2xl">Đăng ký khách hàng</h1>
      <p className="text-sm text-base-content/60">Tài khoản sẽ được xác minh bằng OTP gửi qua email.</p>
      {error && <div className="alert alert-error text-sm">{error}</div>}
      <form onSubmit={submit} className="grid gap-4">
        <label className="form-control"><span className="label-text mb-1">Họ tên</span><input name="fullName" className="input input-bordered" minLength="2" required /></label>
        <label className="form-control"><span className="label-text mb-1">Email</span><input name="email" type="email" className="input input-bordered" required /></label>
        <label className="form-control"><span className="label-text mb-1">Số điện thoại</span><input name="phone" className="input input-bordered" /></label>
        <label className="form-control"><span className="label-text mb-1">Mật khẩu</span><input name="password" type="password" className="input input-bordered" minLength="8" required /></label>
        <p className="text-xs text-base-content/60">Tối thiểu 8 ký tự, có chữ hoa, chữ thường và số.</p>
        <label className="form-control"><span className="label-text mb-1">Xác nhận mật khẩu</span><input name="confirmPassword" type="password" className="input input-bordered" minLength="8" required /></label>
        <button className="btn btn-primary" disabled={loading}>{loading ? <span className="loading loading-spinner" /> : 'Đăng ký'}</button>
      </form>
      <div className="divider">hoặc</div>
      <Link to="/partner/apply" className="btn btn-outline">Đăng ký trở thành đối tác</Link>
      <Link to="/login" className="btn btn-ghost btn-sm">Đã có tài khoản? Đăng nhập</Link>
    </div></div>
  </main>;
}
