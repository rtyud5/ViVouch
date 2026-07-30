import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestPasswordReset, resetPassword } from '../../features/auth/api/auth.api';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('REQUEST');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  async function request(e) {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const r = await requestPasswordReset(email);
      setMessage(r.message);
      setStep('RESET');
      setCooldown(60);
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể gửi OTP.');
      if (err?.response?.status === 429) setCooldown(60);
    } finally {
      setLoading(false);
    }
  }

  async function reset(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await resetPassword(email, otp, password);
      navigate('/login', { state: { message: 'Đặt lại mật khẩu thành công.' } });
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-base-200 grid place-items-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title text-2xl">Quên mật khẩu</h1>
          <p className="text-sm text-base-content/60">OTP sẽ được gửi qua SMTP tới email đăng ký.</p>
          
          {message && <div className="alert alert-success text-sm">{message}</div>}
          {error && <div className="alert alert-error text-sm">{error}</div>}
          
          {step === 'REQUEST' ? (
            <form onSubmit={request} className="space-y-4">
              <input type="email" className="input input-bordered w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button className="btn btn-primary w-full" disabled={loading}>Gửi OTP</button>
            </form>
          ) : (
            <form onSubmit={reset} className="space-y-4">
              <input type="password" inputMode="numeric" className="input input-bordered w-full text-center tracking-widest text-2xl" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="OTP" pattern="[0-9]{6}" required />
              <input type="password" className="input input-bordered w-full" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu mới" minLength="8" required />
              <button className="btn btn-primary w-full" disabled={loading || otp.length !== 6}>Đặt lại mật khẩu</button>
              <button type="button" className="btn btn-ghost w-full btn-sm" onClick={() => request()} disabled={loading || cooldown > 0}>
                {cooldown > 0 ? `Vui lòng đợi ${cooldown}s` : 'Gửi lại OTP'}
              </button>
            </form>
          )}
          <Link to="/login" className="btn btn-ghost btn-sm mt-2">Quay lại đăng nhập</Link>
        </div>
      </div>
    </main>
  );
}
