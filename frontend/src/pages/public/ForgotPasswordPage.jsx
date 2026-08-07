import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { requestPasswordReset, resetPassword } from '../../features/auth/api/auth.api';
import { getInitialCooldownSeconds, readStoredFlow, writeStoredFlow } from './recoveryFlowStorage';

const STORAGE_KEY = 'vivouch.forgot-password-flow';
const RESEND_COOLDOWN_SECONDS = 60;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const storedFlow = readStoredFlow(STORAGE_KEY);
  const [step, setStep] = useState(() => (params.get('step') === 'RESET' || storedFlow.step === 'RESET' ? 'RESET' : 'REQUEST'));
  const [email, setEmail] = useState(params.get('email') || storedFlow.email || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(() => getInitialCooldownSeconds(Number(storedFlow.cooldownUntil || 0)));

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    writeStoredFlow(STORAGE_KEY, {
      email,
      step,
      cooldownUntil: cooldown > 0 ? Date.now() + cooldown * 1000 : 0,
    });
  }, [email, step, cooldown]);

  async function request(event) {
    if (event) event.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await requestPasswordReset(email.trim());
      setMessage(response.message);
      setStep('RESET');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể gửi OTP.');
      if (err?.response?.status === 429) setCooldown(RESEND_COOLDOWN_SECONDS);
    } finally {
      setLoading(false);
    }
  }

  async function reset(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await resetPassword(email.trim(), otp, password);
      writeStoredFlow(STORAGE_KEY, { email: '', step: 'REQUEST', cooldownUntil: 0 });
      navigate('/login', { state: { message: 'Đặt lại mật khẩu thành công.' } });
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  }

  const resendDisabled = loading || cooldown > 0 || !email.trim();

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
              <input
                type="email"
                className="input input-bordered w-full"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button className="btn btn-primary w-full" disabled={loading || !email.trim()}>
                Gửi OTP
              </button>
            </form>
          ) : (
            <form onSubmit={reset} className="space-y-4">
              <input
                type="email"
                className="input input-bordered w-full"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                inputMode="numeric"
                className="input input-bordered w-full text-center tracking-widest text-2xl"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="OTP"
                pattern="[0-9]{6}"
                required
              />
              <input
                type="password"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu mới"
                minLength="8"
                required
              />
              <button className="btn btn-primary w-full" disabled={loading || otp.length !== 6}>
                Đặt lại mật khẩu
              </button>
              <button type="button" className="btn btn-ghost w-full btn-sm" onClick={() => request()} disabled={resendDisabled}>
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
