import { useState } from "react";
import { Link } from "react-router-dom";

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center p-4 antialiased">
      <main className="w-full max-w-[440px] flex flex-col items-center">
        <header className="text-center mb-8 w-full">
          <h1 className="font-display-lg text-display-lg text-primary mb-2 tracking-tight">
            ViVouch
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Mua voucher — Tiết kiệm mỗi ngày
          </p>
        </header>

        <div className="bg-surface-container-lowest w-full rounded-xl shadow-lg border border-surface-variant/50 p-section-gap">
          <form
            action="#"
            className="space-y-6"
            method="POST"
            onSubmit={(event) => event.preventDefault()}
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

            <button
              className="w-full bg-primary hover:bg-surface-tint text-on-primary font-label-md text-label-md py-3.5 rounded-lg transition-colors duration-200 shadow-sm flex justify-center items-center gap-2"
              type="submit"
            >
              Đăng nhập
              <span className="material-symbols-outlined text-[20px]" data-icon="arrow_forward">
                arrow_forward
              </span>
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-surface-variant" />
            <span className="px-4 font-label-md text-label-md text-outline">hoặc</span>
            <div className="flex-grow border-t border-surface-variant" />
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
