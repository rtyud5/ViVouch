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

    const formData = new FormData(event.currentTarget);
    const result = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password")
    });

    if (!result.success) {
      setFormError(result.error.issues[0]?.message || "Dữ liệu không hợp lệ");
      return;
    }

    loginMutation.mutate(result.data);
  }

  return (
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center p-4 antialiased">
      <main className="w-full max-w-110 flex flex-col items-center">
        <header className="text-center mb-8 w-full">
          <h1 className="font-display-lg text-display-lg text-primary mb-2 tracking-tight">
            ViVouch
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Mua voucher - Tiết kiệm mỗi ngày
          </p>
        </header>

        <div className="bg-surface-container-lowest w-full rounded-xl shadow-lg border border-surface-variant/50 p-section-gap">
          <form
            action="#"
            className="space-y-6"
            method="POST"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                className="block font-label-md text-label-md text-on-surface mb-1.5"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <span className="material-symbols-outlined text-[20px]" data-icon="mail">
                    mail
                  </span>
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  id="email"
                  name="email"
                  placeholder="email@example.com"
                  required
                  type="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className="block font-label-md text-label-md text-on-surface"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <span className="material-symbols-outlined text-[20px]" data-icon="lock">
                    lock
                  </span>
                </span>
                <input
                  className="w-full pl-10 pr-12 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
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
            </div>

            <div className="flex justify-end">
              <a
                className="font-label-md text-label-md text-primary hover:text-surface-tint transition-colors"
                href="#"
              >
                Quên mật khẩu?
              </a>
            </div>

            {formError ? (
              <p className="font-body-md text-body-md text-error" role="alert">
                {formError}
              </p>
            ) : null}

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

          <div className="flex items-center my-6">
            <div className="grow border-t border-surface-variant" />
            <span className="px-4 font-label-md text-label-md text-outline">hoặc</span>
            <div className="grow border-t border-surface-variant" />
          </div>

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
