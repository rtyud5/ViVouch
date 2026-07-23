import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resendVerification, verifyEmail } from '../../features/auth/api/auth.api';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(params.get('email') || '');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault(); setLoading(true); setError('');
    try {
      await verifyEmail(email, otp);
      navigate('/login', { replace: true, state: { message: 'Xác minh email thành công. Hãy đăng nhập.' } });
    } catch (requestError) { setError(requestError?.response?.data?.message || 'OTP không hợp lệ.'); }
    finally { setLoading(false); }
  }
  async function resend() {
    setLoading(true); setError(''); setMessage('');
    try { const response = await resendVerification(email); setMessage(response.message); }
    catch (requestError) { setError(requestError?.response?.data?.message || 'Không thể gửi lại OTP.'); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-base-200 grid place-items-center p-4"><div className="card bg-base-100 shadow-xl w-full max-w-md"><div className="card-body">
    <h1 className="card-title text-2xl">Xác minh email</h1>
    <p className="text-sm text-base-content/60">Nhập mã 6 số đã gửi tới email của bạn.</p>
    {message && <div className="alert alert-success text-sm">{message}</div>}{error && <div className="alert alert-error text-sm">{error}</div>}
    <form onSubmit={submit} className="space-y-4">
      <label className="form-control"><span className="label-text mb-1">Email</span><input type="email" className="input input-bordered" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label className="form-control"><span className="label-text mb-1">Mã OTP</span><input inputMode="numeric" pattern="[0-9]{6}" maxLength="6" className="input input-bordered text-center text-2xl tracking-[.4em]" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required /></label>
      <button className="btn btn-primary w-full" disabled={loading || otp.length !== 6}>{loading ? <span className="loading loading-spinner" /> : 'Xác minh'}</button>
    </form>
    <button className="btn btn-ghost btn-sm" onClick={resend} disabled={loading || !email}>Gửi lại OTP</button>
    <Link to="/login" className="btn btn-ghost btn-sm">Quay lại đăng nhập</Link>
  </div></div></main>;
}
