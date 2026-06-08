import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { register } from "../../features/auth/api/auth.api";

const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, "Vui lòng nhập họ và tên"),
    email: z.string().email("Email không hợp lệ"),
    phone: z.string().trim().optional(),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"]
  });

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || "Đăng ký thất bại";
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login", { 
          replace: true,
          state: { message: "Đăng ký thành công, vui lòng đăng nhập" }
        });
      }, 2000);
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
    const result = registerSchema.safeParse({
      fullName: formData.get("fullname"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirm_password")
    });

    if (!result.success) {
      const errors = {};
      result.error.issues.forEach(issue => {
        errors[issue.path[0]] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    const { confirmPassword, phone, ...data } = result.data;
    registerMutation.mutate({
      ...data,
      ...(phone ? { phone } : {})
    });
  }

  return (
    <div className="flex-1 bg-surface-container-low text-on-surface flex items-center justify-center p-4 min-h-screen relative overflow-hidden">
      {/* Decorative Background Circles */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-container opacity-20 blur-3xl pointer-events-none z-0"></div>
      <div className="absolute top-[60%] -right-[10%] w-[30%] h-[30%] rounded-full bg-secondary-container opacity-10 blur-3xl pointer-events-none z-0"></div>

      <main className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-lg p-8 relative overflow-hidden z-10 border border-surface-variant/50">
        {/* Decorative Circles inside the card */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-container rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary-container rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>

        {/* Header */}
        <header className="flex items-center gap-4 border-b border-surface-variant pb-4 mb-6 relative z-10">
          <button
            aria-label="Go back"
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-surface-container-low"
            onClick={() => navigate(-1)}
            type="button"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-headline-md text-on-surface m-0">
            Tạo tài khoản
          </h1>
        </header>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4 text-center animate-in fade-in zoom-in duration-300 relative z-10">
            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <div className="space-y-2">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Tạo tài khoản thành công!</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Đang chuyển về trang đăng nhập...</p>
            </div>
          </div>
        ) : (
          <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
            {formError && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-lg flex items-center gap-3 text-error animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <p className="font-body-md text-body-md">{formError}</p>
              </div>
            )}

            {/* Full Name Field */}
            <div>
              <label
                className="block font-label-md text-label-md text-on-surface-variant mb-1"
                htmlFor="fullname"
              >
                Họ và tên
              </label>
              <div className="relative">
                <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[20px] ${fieldErrors.fullName ? "text-error" : "text-on-surface-variant"}`}>
                  person
                </span>
                <input
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg font-body-md text-body-md text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-1 transition-colors ${
                    fieldErrors.fullName
                      ? "border-error bg-error-container/10 focus:border-error focus:ring-error"
                      : "bg-surface border-outline-variant focus:border-primary focus:ring-primary"
                  }`}
                  id="fullname"
                  name="fullname"
                  placeholder="Nguyễn Văn A"
                  required
                  type="text"
                />
                {fieldErrors.fullName && (
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-error pointer-events-none text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    error
                  </span>
                )}
              </div>
              {fieldErrors.fullName && (
                <p className="mt-1.5 font-label-md text-label-md text-error flex items-center gap-1 text-sm">
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                className="block font-label-md text-label-md text-on-surface-variant mb-1"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[20px] ${fieldErrors.email ? "text-error" : "text-on-surface-variant"}`}>
                  mail
                </span>
                <input
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg font-body-md text-body-md text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-1 transition-colors ${
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
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-error pointer-events-none text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    error
                  </span>
                )}
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 font-label-md text-label-md text-error flex items-center gap-1 text-sm">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Phone Number Field */}
            <div>
              <label
                className="block font-label-md text-label-md text-on-surface-variant mb-1"
                htmlFor="phone"
              >
                Số điện thoại
              </label>
              <div className="relative">
                <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[20px] ${fieldErrors.phone ? "text-error" : "text-on-surface-variant"}`}>
                  call
                </span>
                <input
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg font-body-md text-body-md text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-1 transition-colors ${
                    fieldErrors.phone
                      ? "border-error bg-error-container/10 focus:border-error focus:ring-error"
                      : "bg-surface border-outline-variant focus:border-primary focus:ring-primary"
                  }`}
                  id="phone"
                  name="phone"
                  placeholder="0912 345 678"
                  type="tel"
                />
                {fieldErrors.phone && (
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-error pointer-events-none text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    error
                  </span>
                )}
              </div>
              {fieldErrors.phone && (
                <p className="mt-1.5 font-label-md text-label-md text-error flex items-center gap-1 text-sm">
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                className="block font-label-md text-label-md text-on-surface-variant mb-1"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[20px] ${fieldErrors.password ? "text-error" : "text-on-surface-variant"}`}>
                  lock
                </span>
                <input
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg font-body-md text-body-md text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-1 transition-colors ${
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary focus:outline-none p-1 rounded-full hover:bg-surface-container-low transition-colors"
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 font-label-md text-label-md text-error flex items-center gap-1 text-sm">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                className="block font-label-md text-label-md text-on-surface-variant mb-1"
                htmlFor="confirm_password"
              >
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[20px] ${fieldErrors.confirmPassword ? "text-error" : "text-on-surface-variant"}`}>
                  lock_reset
                </span>
                <input
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg font-body-md text-body-md text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-1 transition-colors ${
                    fieldErrors.confirmPassword
                      ? "border-error bg-error-container/10 focus:border-error focus:ring-error"
                      : "bg-surface border-outline-variant focus:border-primary focus:ring-primary"
                  }`}
                  id="confirm_password"
                  name="confirm_password"
                  placeholder="••••••••"
                  required
                  type={showConfirmPassword ? "text" : "password"}
                />
                <button
                  aria-label="Toggle confirm password visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary focus:outline-none p-1 rounded-full hover:bg-surface-container-low transition-colors"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1.5 font-label-md text-label-md text-error flex items-center gap-1 text-sm">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary focus:ring-2 bg-surface cursor-pointer"
                  id="terms"
                  name="terms"
                  required
                  type="checkbox"
                />
              </div>
              <label
                className="font-body-md text-body-md text-on-surface-variant leading-tight cursor-pointer"
                htmlFor="terms"
              >
                Tôi đồng ý với{" "}
                <a
                  className="text-primary hover:text-primary-container underline underline-offset-2 transition-colors"
                  href="#"
                >
                  Điều khoản sử dụng
                </a>{" "}
                và{" "}
                <a
                  className="text-primary hover:text-primary-container underline underline-offset-2 transition-colors"
                  href="#"
                >
                  Chính sách bảo mật
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              className="w-full bg-primary hover:bg-surface-tint disabled:bg-outline-variant disabled:cursor-not-allowed text-on-primary font-label-md text-label-md py-3.5 px-6 rounded-lg transition-colors mt-6 shadow-md active:scale-[0.98] transform duration-150 flex items-center justify-center gap-2"
              disabled={registerMutation.isPending}
              type="submit"
            >
              {registerMutation.isPending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Đăng ký"
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 text-center relative z-10">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Đã có tài khoản?{" "}
            <Link
              className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded ml-1"
              to="/login"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
