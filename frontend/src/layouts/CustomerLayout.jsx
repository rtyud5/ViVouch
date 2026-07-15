import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useCart } from '../features/cart/hooks/useCart';
import { BottomNav } from '../components/common/BottomNav';

/**
 * CustomerLayout
 *
 * Layout dành cho khách hàng đã đăng nhập.
 *
 * Desktop Navbar (hiển thị trên md+):
 *   Logo | Cart | My Vouchers | Profile | [Avatar + Tên] | Logout
 *
 * Mobile:
 *   Header nhỏ: Logo + [Avatar + Tên] + Logout
 *   BottomNav 5 tabs phía dưới.
 *
 * Avatar fallback: chữ cái đầu của fullName (khi không có ảnh).
 * Cart badge: lấy cartCount từ useCart() — cập nhật realtime theo React Query.
 */
export function CustomerLayout() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const currentPath = location.pathname;

  // ── Auth ────────────────────────────────────────────────────────────────────
  const user      = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  // ── Cart badge ──────────────────────────────────────────────────────────────
  // cartCount = tổng số lượng sản phẩm trong giỏ (từ React Query cache).
  const { cartCount } = useCart();

  // ── Handlers ────────────────────────────────────────────────────────────────
  function handleLogout() {
    clearAuth();                        // xoá token khỏi localStorage + state
    queryClient.clear();
    navigate('/login', { replace: true });
  }

  // ── Avatar ──────────────────────────────────────────────────────────────────
  // Nếu user có avatar URL thì hiển thị ảnh, không thì hiển thị chữ cái đầu.
  const avatarInitial = user?.fullName?.[0]?.toUpperCase() ?? 'U';

  // ── Nav links ───────────────────────────────────────────────────────────────
  function navLinkClass(path) {
    const isActive = currentPath === path;
    return [
      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors',
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-base-content/70 hover:text-primary hover:bg-base-200',
    ].join(' ');
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-100">

      {/* ── Desktop Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-base-100 border-b border-base-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 flex items-center h-16 gap-4">

          {/* Logo */}
          <Link
            to="/customer/home"
            className="text-2xl font-extrabold text-primary tracking-tight shrink-0"
            aria-label="ViVouch – Trang chủ"
          >
            ViVouch
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Desktop nav links (md+) */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Menu khách hàng">

            {/* Cart link + badge */}
            <Link
              to="/customer/cart"
              id="customer-nav-cart"
              className={`${navLinkClass('/customer/cart')} relative`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184
                     1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Giỏ hàng</span>
              {/* Badge */}
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold
                             min-w-[18px] h-[18px] flex items-center justify-center rounded-full
                             px-0.5 shadow border border-base-100"
                  aria-label={`${cartCount} sản phẩm`}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* My Vouchers */}
            <Link
              to="/customer/my-vouchers"
              id="customer-nav-vouchers"
              className={navLinkClass('/customer/my-vouchers')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002
                     2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span>My Vouchers</span>
            </Link>

            {/* Profile */}
            <Link
              to="/customer/profile"
              id="customer-nav-profile"
              className={navLinkClass('/customer/profile')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </Link>

          </nav>

          {/* Divider (desktop) */}
          <div className="hidden md:block h-6 w-px bg-base-200" />

          {/* Avatar + Tên user */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Avatar: ảnh hoặc chữ cái đầu */}
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full bg-primary text-primary-content
                           flex items-center justify-center text-sm font-bold shrink-0
                           ring-2 ring-primary/20"
                aria-label={`Avatar của ${user?.fullName}`}
              >
                {avatarInitial}
              </div>
            )}
            {/* Tên user (desktop) */}
            <span className="hidden lg:inline text-sm font-semibold text-base-content">
              {user?.fullName}
            </span>
          </div>

          {/* Logout button */}
          <button
            id="customer-logout-btn"
            onClick={handleLogout}
            className="btn btn-ghost btn-sm text-base-content/60 hover:text-error
                       flex items-center gap-1.5"
            aria-label="Đăng xuất"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0
                   013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden md:inline">Logout</span>
          </button>

        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      {/* pb-16 trên mobile để nội dung không bị BottomNav che khuất */}
      <main className="flex-grow pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* ── BottomNav — chỉ mobile ─────────────────────────────────────────── */}
      {/* cartCount truyền vào để badge giỏ hàng cập nhật realtime */}
      <BottomNav cartCount={cartCount} basePath="/customer" />

    </div>
  );
}
