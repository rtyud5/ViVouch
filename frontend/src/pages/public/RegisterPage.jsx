import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-4">
      <main className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-lg p-section-gap flex flex-col gap-6">
        <header className="flex items-center gap-4 border-b border-surface-variant pb-4">
          <button
            aria-label="Go back"
            className="text-on-surface hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-container-low"
            onClick={() => navigate(-1)}
            type="button"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-headline-md text-on-surface m-0">
            Tạo tài khoản
          </h1>
        </header>

        <form className="flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
          <div className="flex flex-col gap-2">
            <label
              className="font-label-md text-label-md text-on-surface-variant"
              htmlFor="fullname"
            >
              Họ và tên
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-outline"
              id="fullname"
              name="fullname"
              placeholder="Nhập họ và tên"
              type="text"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="font-label-md text-label-md text-on-surface-variant"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-outline"
              id="email"
              name="email"
              placeholder="Nhập địa chỉ email"
              type="email"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="font-label-md text-label-md text-on-surface-variant"
              htmlFor="phone"
            >
              Số điện thoại
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-outline"
              id="phone"
              name="phone"
              placeholder="Nhập số điện thoại"
              type="tel"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="font-label-md text-label-md text-on-surface-variant"
              htmlFor="password"
            >
              Mật khẩu
            </label>
            <div className="relative w-full">
              <input
                className="w-full px-4 py-3 pr-12 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-outline"
                id="password"
                name="password"
                placeholder="Nhập mật khẩu"
                type={showPassword ? "text" : "password"}
              />
              <button
                aria-label="Toggle password visibility"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-1"
                onClick={() => setShowPassword((value) => !value)}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="font-label-md text-label-md text-on-surface-variant"
              htmlFor="confirm_password"
            >
              Xác nhận mật khẩu
            </label>
            <div className="relative w-full">
              <input
                className="w-full px-4 py-3 pr-12 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-outline"
                id="confirm_password"
                name="confirm_password"
                placeholder="Nhập lại mật khẩu"
                type={showConfirmPassword ? "text" : "password"}
              />
              <button
                aria-label="Toggle confirm password visibility"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-1"
                onClick={() => setShowConfirmPassword((value) => !value)}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showConfirmPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 mt-2">
            <div className="flex items-center h-5 mt-0.5">
              <input
                className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary focus:ring-2 bg-surface-container-lowest cursor-pointer"
                id="terms"
                name="terms"
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

          <button
            className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-3.5 px-6 rounded-lg transition-colors mt-4 shadow-sm active:scale-[0.98] transform duration-150"
            type="submit"
          >
            Đăng ký
          </button>
        </form>

        <div className="text-center mt-2">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Đã có tài khoản?
            <Link
              className="text-primary font-label-md hover:underline underline-offset-2 transition-all ml-1"
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
