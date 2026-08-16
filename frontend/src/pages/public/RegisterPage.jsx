import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { register } from '../../features/auth/api/auth.api';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-2 text-sm text-error">{message}</p>;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  async function submit(event) {
    event.preventDefault();
    setError('');
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') || '');
    const confirmPassword = String(form.get('confirmPassword') || '');

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    setLoading(true);
    try {
      const response = await register({
        fullName: String(form.get('fullName') || '').trim(),
        email: String(form.get('email') || '').trim(),
        phone: String(form.get('phone') || '').trim() || null,
        password,
      });

      const email = response.data?.user?.email || String(form.get('email') || '').trim();
      const deliveryMessage = response.message;

      if (response.data?.verificationRequired) {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`, {
          state: { message: deliveryMessage },
        });
        return;
      }

      navigate('/login', { state: { message: deliveryMessage || 'Đăng ký thành công. Hãy đăng nhập.' } });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Không thể đăng ký tài khoản.');
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
            Tạo tài khoản để nhận ưu đãi mỗi ngày
          </p>
        </header>

        <div className="bg-surface-container-lowest w-full rounded-xl shadow-lg border border-surface-variant/50 p-8 md:p-10">
          {location.state?.message && (
            <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-center gap-3 text-success">
              <span className="material-symbols-outlined text-[20px]">info</span>
              <p className="font-body-md text-body-md">{location.state.message}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-center gap-3 text-error">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <p className="font-body-md text-body-md">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={submit} autoComplete="off">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="fullName">
                Họ và tên
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                minLength={2}
                required
                autoComplete="name"
                placeholder="Nhập họ và tên của bạn"
                className="w-full px-4 py-3 border rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-1 transition-all duration-200 bg-surface border-outline-variant focus:border-primary focus:ring-primary"
              />
              <FieldError message={fieldErrors.fullName} />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="email@example.com"
                className="w-full px-4 py-3 border rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-1 transition-all duration-200 bg-surface border-outline-variant focus:border-primary focus:ring-primary"
              />
              <FieldError message={fieldErrors.email} />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="phone">
                Số điện thoại
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Nhập số điện thoại"
                className="w-full px-4 py-3 border rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-1 transition-all duration-200 bg-surface border-outline-variant focus:border-primary focus:ring-primary"
              />
              <FieldError message={fieldErrors.phone} />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="password">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  minLength={8}
                  required
                  autoComplete="new-password"
                  placeholder="Tạo mật khẩu"
                  className="w-full px-4 py-3 pr-12 border rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-1 transition-all duration-200 bg-surface border-outline-variant focus:border-primary focus:ring-primary"
                />
                <button
                  aria-label="Toggle password visibility"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-outline hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <p className="mt-2 text-xs text-base-content/60">
                Tối thiểu 8 ký tự, có chữ hoa, chữ thường và số.
              </p>
              <FieldError message={fieldErrors.password} />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="confirmPassword">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  minLength={8}
                  required
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu"
                  className="w-full px-4 py-3 pr-12 border rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-1 transition-all duration-200 bg-surface border-outline-variant focus:border-primary focus:ring-primary"
                />
                <button
                  aria-label="Toggle confirm password visibility"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-outline hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <FieldError message={fieldErrors.confirmPassword} />
            </div>

            <button
              className="w-full bg-primary hover:bg-surface-tint disabled:bg-outline-variant disabled:cursor-not-allowed text-on-primary font-label-md text-label-md py-3.5 rounded-lg transition-colors duration-200 shadow-sm flex justify-center items-center gap-2"
              disabled={loading}
              type="submit"
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'Đăng ký'}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="grow border-t border-surface-variant" />
            <span className="px-4 font-label-md text-label-md text-outline">hoặc</span>
            <div className="grow border-t border-surface-variant" />
          </div>

          <div className="space-y-3">
            <Link
              to="/partner/apply"
              className="btn btn-outline btn-block"
            >
              Đăng ký trở thành đối tác
            </Link>
            <p className="text-center font-body-md text-body-md text-on-surface-variant">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="font-label-md text-label-md text-primary hover:text-surface-tint transition-colors ml-1"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
