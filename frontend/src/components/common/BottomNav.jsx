import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

/**
 * BottomNav — 5-tab mobile navigation bar.
 *
 * Dùng cho cả PublicLayout và CustomerLayout (chỉ hiển thị trên mobile).
 * Props:
 *   cartCount  {number}  – số lượng sản phẩm trong giỏ (dùng để hiển thị badge)
 *   basePath   {string}  – prefix route, ví dụ: '' (public) hoặc '/customer'
 */
export function BottomNav({ cartCount = 0, basePath: initialBasePath }) {
  const { pathname } = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const isCustomer = isAuthenticated && user?.role === 'customer';
  const basePath = initialBasePath ?? (isCustomer ? '/customer' : '');
  // Xác định tab nào đang active
  const isHome    = pathname === basePath || pathname === `${basePath}/home` || pathname === '/';
  const isSearch  = pathname === `${basePath}/vouchers` || pathname === '/vouchers';
  const isCart    = pathname === `${basePath}/cart`;
  const isVoucher = pathname === `${basePath}/my-vouchers`;
  const isProfile = pathname === `${basePath}/profile`;

  // Helper tạo class cho mỗi tab
  function tabClass(active) {
    return [
      'flex flex-col items-center justify-center p-2 w-16 rounded-xl transition-colors duration-150',
      active
        ? 'bg-primary/10 text-primary'
        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary',
    ].join(' ');
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-2
                 bg-base-100 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] border-t border-base-200
                 md:hidden"
      aria-label="Điều hướng chính"
    >
      {/* Tab 1: Home */}
      <Link
        to={basePath ? `${basePath}/home` : '/'}
        id="bottom-nav-home"
        className={tabClass(isHome)}
        aria-label="Trang chủ"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill={isHome ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={isHome ? 0 : 1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <span className="text-[10px] mt-0.5 leading-none font-semibold">Home</span>
      </Link>

      {/* Tab 2: Tìm kiếm */}
      <Link
        to="/vouchers"
        id="bottom-nav-search"
        className={tabClass(isSearch)}
        aria-label="Tìm kiếm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <span className="text-[10px] mt-0.5 leading-none font-semibold">Tìm kiếm</span>
      </Link>

      {/* Tab 3: Giỏ hàng (với badge) */}
      <Link
        to={basePath ? `${basePath}/cart` : '/login'}
        id="bottom-nav-cart"
        className={`${tabClass(isCart)} relative`}
        aria-label="Giỏ hàng"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill={isCart ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={isCart ? 0 : 1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {/* Badge số lượng */}
        {cartCount > 0 && (
          <span
            className="absolute top-1 right-2 bg-red-500 text-white text-[10px] font-bold
                       min-w-[16px] h-4 flex items-center justify-center rounded-full
                       px-0.5 shadow-sm border border-base-100 leading-none"
            aria-label={`${cartCount} sản phẩm trong giỏ`}
          >
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
        <span className="text-[10px] mt-0.5 leading-none font-semibold">Giỏ hàng</span>
      </Link>

      {/* Tab 4: Voucher của tôi */}
      <Link
        to={basePath ? `${basePath}/my-vouchers` : '/login'}
        id="bottom-nav-vouchers"
        className={tabClass(isVoucher)}
        aria-label="Voucher của tôi"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill={isVoucher ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={isVoucher ? 0 : 1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
          />
        </svg>
        <span className="text-[10px] mt-0.5 leading-none font-semibold">Voucher</span>
      </Link>

      {/* Tab 5: Cá nhân */}
      <Link
        to={basePath ? `${basePath}/profile` : '/login'}
        id="bottom-nav-profile"
        className={tabClass(isProfile)}
        aria-label="Cá nhân"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill={isProfile ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={isProfile ? 0 : 1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span className="text-[10px] mt-0.5 leading-none font-semibold">Cá nhân</span>
      </Link>
    </nav>
  );
}
