import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset, resetPassword } from '../../features/auth/api/auth.api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestReset = async (event) => {
    event.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const response = await requestPasswordReset(email);
      setResetToken(response.data?.resetToken || '');
      setMessage(response.data?.resetToken
        ? 'Đã tạo mã đặt lại mô phỏng. Hãy nhập mật khẩu mới.'
        : 'Yêu cầu đã được tiếp nhận.');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Không thể tạo yêu cầu.');
    } finally { setLoading(false); }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    setLoading(true); setError('');
    try {
      const response = await resetPassword(resetToken, password);
      setMessage(response.message);
      setResetToken(''); setPassword('');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Không thể đặt lại mật khẩu.');
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-base-200 grid place-items-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title text-2xl">Quên mật khẩu</h1>
          <p className="text-sm text-base-content/60">Bản học tập sử dụng quy trình gửi mã mô phỏng, không gửi email thật.</p>
          {message && <div className="alert alert-success text-sm">{message}</div>}
          {error && <div className="alert alert-error text-sm">{error}</div>}

          {!resetToken ? (
            <form onSubmit={requestReset} className="space-y-4">
              <label className="form-control"><span className="label-text mb-1">Email</span><input type="email" className="input input-bordered" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? <span className="loading loading-spinner" /> : 'Tạo yêu cầu'}</button>
            </form>
          ) : (
            <form onSubmit={submitPassword} className="space-y-4">
              <label className="form-control"><span className="label-text mb-1">Mật khẩu mới</span><input type="password" className="input input-bordered" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></label>
              <p className="text-xs text-base-content/60">Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và chữ số.</p>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? <span className="loading loading-spinner" /> : 'Đặt lại mật khẩu'}</button>
            </form>
          )}

          <Link to="/login" className="btn btn-ghost btn-sm">Quay lại đăng nhập</Link>
        </div>
      </div>
    </main>
  );
}
