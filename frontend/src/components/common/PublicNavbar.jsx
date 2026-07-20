import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../stores/authStore";
import { useCart } from "../../features/cart/hooks/useCart";
import { logoutSession } from "../../features/auth/api/auth.api";

/**
 * PublicNavbar
 *
 * Thanh điều hướng sticky cho khu vực public.
 *
 * Desktop: Logo | Search bar | Đăng nhập + Đăng ký
 * Mobile : Logo | 🔍 icon | Đăng nhập + Đăng ký
 *          (icon 🔍 toggle search bar full-width ở hàng dưới)
 */
export function PublicNavbar() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const queryClient = useQueryClient();

  const isCustomer = user?.role === "CUSTOMER";
  const { cartCount } = useCart({ enabled: isAuthenticated && isCustomer });

  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  /** Submit form tìm kiếm → navigate /vouchers?q=... */
  function handleSearch(e) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/vouchers?q=${encodeURIComponent(q)}`);
      setShowMobileSearch(false);
    }
  }

  /** Đăng xuất: xóa state + về trang chủ */
  async function handleLogout() {
    try {
      await logoutSession(refreshToken);
    } finally {
      clearAuth();
      queryClient.clear();
      navigate("/");
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-base-100 border-b border-base-300 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4">

        {/* ── Hàng chính ── */}
        <div className="flex items-center gap-3 h-16">

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-extrabold text-primary shrink-0 tracking-tight"
            aria-label="ViVouch – Trang chủ"
          >
            ViVouch
          </Link>

          {/* Search bar — desktop (md+) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-lg mx-auto"
            role="search"
          >
            <label className="input input-bordered flex items-center gap-2 w-full rounded-full bg-base-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-base-content/40 shrink-0"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                id="navbar-search-desktop"
                type="search"
                className="grow bg-transparent outline-none text-sm"
                placeholder="Tìm kiếm voucher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Tìm kiếm voucher"
              />
            </label>
          </form>

          {/* Spacer mobile */}
          <div className="flex-1 md:hidden" />

          {/* Icon kính lúp — mobile only */}
          <button
            className="btn btn-ghost btn-circle md:hidden"
            aria-label="Tìm kiếm"
            onClick={() => setShowMobileSearch((v) => !v)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </button>

          {/* ── Auth section ── */}
          {isAuthenticated && user ? (
            /* Đã đăng nhập */
            <div className="flex items-center gap-4 shrink-0">
              {isCustomer && (
                <Link to="/customer/cart" className="relative group p-1" aria-label="Giỏ hàng">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-base-content/70 group-hover:text-primary transition-colors">
                    <circle cx="8" cy="21" r="1"/>
                    <circle cx="19" cy="21" r="1"/>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-2 badge badge-primary badge-sm text-[10px] min-w-[18px] px-1 h-[18px]">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}
              
              <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium border-l border-base-300 pl-4">
                {/* Avatar chữ cái đầu */}
                <div className="w-8 h-8 rounded-full bg-primary text-primary-content
                                flex items-center justify-center text-xs font-bold shrink-0">
                  {user.fullName?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span className="hidden lg:inline text-base-content">{user.fullName}</span>
              </div>
              <button
                id="navbar-logout-btn"
                className="btn btn-ghost btn-sm text-base-content/70 hover:text-error"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            /* Chưa đăng nhập */
            <div className="flex items-center gap-2 shrink-0">
              <Link
                id="navbar-login-btn"
                to="/login"
                className="btn btn-ghost btn-sm font-semibold"
              >
                Đăng nhập
              </Link>
              <Link
                id="navbar-register-btn"
                to="/register"
                className="btn btn-primary btn-sm font-semibold rounded-full"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        {/* ── Search bar mobile (toggle) ── */}
        {showMobileSearch && (
          <div className="pb-3 md:hidden">
            <form onSubmit={handleSearch} role="search">
              <label className="input input-bordered flex items-center gap-2 w-full rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 text-base-content/40 shrink-0"
                >
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  id="navbar-search-mobile"
                  type="search"
                  className="grow bg-transparent outline-none text-sm"
                  placeholder="Tìm kiếm voucher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  aria-label="Tìm kiếm voucher"
                />
              </label>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
