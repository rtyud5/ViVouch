import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { login } from "../../features/auth/api/auth.api";
import { useAuthStore } from "../../stores/authStore";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu")
});

const roleRedirects = {
  CUSTOMER: "/customer/home",
  PARTNER: "/partner/dashboard",
  ADMIN: "/admin/dashboard"
};

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || "Đăng nhập thất bại";
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: ({ user, accessToken }) => {
      setAuth({ user, accessToken });
      const returnUrl = location.state?.returnUrl;
      const safeReturnUrl = (returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//"))
        ? returnUrl
        : (roleRedirects[user.role] || "/customer/home");
      navigate(safeReturnUrl, { replace: true });
    },
    onError: (error) => {
      setFormError(getErrorMessage(error));
    }
  });

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const result = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password")
    });

    if (!result.success) {
      const errors = {};
      result.error.issues.forEach(issue => {
        errors[issue.path[0]] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    loginMutation.mutate(result.data);
  }

  return (
    <div className="flex-1 bg-surface-container-low flex items-center justify-center p-4 antialiased min-h-screen relative overflow-hidden">
      {/* Decorative Background Circles */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-container opacity-20 blur-3xl pointer-events-none z-0"></div>
      <div className="absolute top-[60%] -right-[10%] w-[30%] h-[30%] rounded-full bg-secondary-container opacity-10 blur-3xl pointer-events-none z-0"></div>

      <main className="w-full max-w-[440px] flex flex-col items-center relative z-10 py-8">
        {/* Header / Logo Area */}
        <header className="text-center mb-8 w-full">
          <h1 className="font-display-lg text-display-lg text-primary mb-2 tracking-tight">
            ViVouch
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Mua voucher — Tiết kiệm mỗi ngày
          </p>
        </header>

        {/* Card Container for Form */}
        <div className="bg-surface-container-lowest w-full rounded-xl shadow-lg border border-surface-variant/50 p-8 md:p-10">
          {location.state?.message && (
            <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-center gap-3 text-success animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="material-symbols-outlined text-[20px]">info</span>
              <p className="font-body-md text-body-md">{location.state.message}</p>
            </div>
          )}

          {formError && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-center gap-3 text-error animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <p className="font-body-md text-body-md">{formError}</p>
            </div>
          )}

          <form
            action="#"
            className="space-y-6"
            method="POST"
            onSubmit={handleSubmit}
          >
            {/* Email Field */}
            <div>
              <label
                className="block font-label-md text-label-md text-on-surface mb-1.5"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <span className={`material-symbols-outlined text-[20px] ${fieldErrors.email ? "text-error" : "text-outline"}`} data-icon="mail">
                    mail
                  </span>
                </span>
                <input
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-1 transition-all duration-200 ${
                    fieldErrors.email
                      ? "border-error bg-error-container/10 focus:border-error focus:ring-error"
                      : "bg-surface border-outline-variant focus:border-primary focus:ring-primary"
                  }`}
                  id="email"
                  name="email"
                  placeholder="email@example.com"
                  required
                  type="email"
                />
                {fieldErrors.email && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="material-symbols-outlined text-error text-[20px]" data-icon="error">
                      error
                    </span>
                  </div>
                )}
              </div>
              {fieldErrors.email && (
                <p className="mt-2 font-body-md text-body-md text-error text-sm" id="email-error">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  className="block font-label-md text-label-md text-on-surface"
                  htmlFor="password"
                >
                  Mật khẩu
                </label>
                <a
                  className="font-label-md text-label-md text-primary hover:text-surface-tint transition-colors"
                  href="#"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <span className={`material-symbols-outlined text-[20px] ${fieldErrors.password ? "text-error" : "text-outline"}`} data-icon="lock">
                    lock
                  </span>
                </span>
                <input
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-1 transition-all duration-200 ${
                    fieldErrors.password
                      ? "border-error bg-error-container/10 focus:border-error focus:ring-error"
                      : "bg-surface border-outline-variant focus:border-primary focus:ring-primary"
                  }`}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                />
                <button
                  aria-label="Toggle password visibility"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-outline hover:text-on-surface transition-colors cursor-pointer"
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]" data-icon="visibility">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-2 font-body-md text-body-md text-error text-sm">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              className="w-full bg-primary hover:bg-surface-tint disabled:bg-outline-variant disabled:cursor-not-allowed text-on-primary font-label-md text-label-md py-3.5 rounded-lg transition-colors duration-200 shadow-sm flex justify-center items-center gap-2"
              disabled={loginMutation.isPending}
              type="submit"
            >
              {loginMutation.isPending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  Đăng nhập
                  <span className="material-symbols-outlined text-[20px]" data-icon="arrow_forward">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="grow border-t border-surface-variant" />
            <span className="px-4 font-label-md text-label-md text-outline">hoặc</span>
            <div className="grow border-t border-surface-variant" />
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Chưa có tài khoản?
              <Link
                className="font-label-md text-label-md text-primary hover:text-surface-tint transition-colors ml-1"
                to="/register"
              >
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
