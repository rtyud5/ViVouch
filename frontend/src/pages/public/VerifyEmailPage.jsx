import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { resendVerification, verifyEmail } from '../../features/auth/api/auth.api';
import { getInitialCooldownSeconds, readStoredFlow, writeStoredFlow } from './recoveryFlowStorage';

const STORAGE_KEY = 'vivouch.verify-email-flow';
const RESEND_COOLDOWN_SECONDS = 60;

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const storedFlow = readStoredFlow(STORAGE_KEY);
  const [email, setEmail] = useState(params.get('email') || storedFlow.email || '');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');
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
      cooldownUntil: cooldown > 0 ? Date.now() + cooldown * 1000 : 0,
    });
  }, [email, cooldown]);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await verifyEmail(email, otp);
      writeStoredFlow(STORAGE_KEY, { email: '', cooldownUntil: 0 });
      navigate('/login', { replace: true, state: { message: 'Xác minh email thành công. Hãy đăng nhập.' } });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'OTP không hợp lệ.');
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await resendVerification(email);
      setMessage(response.message);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Không thể gửi lại OTP.');
      if (requestError?.response?.status === 429) setCooldown(RESEND_COOLDOWN_SECONDS);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center p-4 antialiased relative overflow-hidden">
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-container opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute top-[60%] -right-[10%] w-[30%] h-[30%] rounded-full bg-secondary-container opacity-10 blur-3xl pointer-events-none" />

      <main className="w-full max-w-[440px] flex flex-col items-center relative z-10 py-8">
        <header className="text-center mb-8 w-full">
          <h1 className="font-display-lg text-display-lg text-primary mb-2 tracking-tight">
            ViVouch
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Xác minh email để hoàn tất đăng ký
          </p>
        </header>

        <div className="bg-surface-container-lowest w-full rounded-xl shadow-lg border border-surface-variant/50 p-8 md:p-10">
          {message && (
            <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-center gap-3 text-success">
              <span className="material-symbols-outlined text-[20px]">info</span>
              <p className="font-body-md text-body-md">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-center gap-3 text-error">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <p className="font-body-md text-body-md">{error}</p>
            </div>
          )}

          <p className="mb-6 text-sm text-base-content/70">
            Nhập mã 6 số đã gửi tới email của bạn. Nếu chưa nhận được email, hãy kiểm tra thư rác hoặc dùng nút gửi lại OTP.
          </p>

          <form className="space-y-5" onSubmit={submit}>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="verify-email">
                Email
              </label>
              <input
                id="verify-email"
                type="email"
                className="w-full px-4 py-3 border rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-1 transition-all duration-200 bg-surface border-outline-variant focus:border-primary focus:ring-primary"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="verify-otp">
                Mã OTP
              </label>
              <input
                id="verify-otp"
                type="password"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                className="w-full px-4 py-3 border rounded-lg font-body-md text-2xl tracking-[.4em] text-center text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-1 transition-all duration-200 bg-surface border-outline-variant focus:border-primary focus:ring-primary"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                required
              />
            </div>

            <button
              className="w-full bg-primary hover:bg-surface-tint disabled:bg-outline-variant disabled:cursor-not-allowed text-on-primary font-label-md text-label-md py-3.5 rounded-lg transition-colors duration-200 shadow-sm flex justify-center items-center gap-2"
              disabled={loading || otp.length !== 6 || !email}
              type="submit"
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'Xác minh'}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="grow border-t border-surface-variant" />
            <span className="px-4 font-label-md text-label-md text-outline">hoặc</span>
            <div className="grow border-t border-surface-variant" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              className="btn btn-outline btn-block"
              onClick={resend}
              disabled={loading || !email || cooldown > 0}
            >
              {cooldown > 0 ? `Vui lòng đợi ${cooldown}s` : 'Gửi lại OTP'}
            </button>
            <Link
              to="/login"
              className="btn btn-ghost btn-block text-primary"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
