import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut, ReceiptText, HandCoins, Headset, Bell } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useCart } from '../features/cart/hooks/useCart';
import { BottomNav } from '../components/common/BottomNav';
import { logoutSession } from '../features/auth/api/auth.api';

export function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const queryClient = useQueryClient();
  const { cartCount } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/vouchers?q=${encodeURIComponent(q)}`);
    }
  }

  async function handleLogout() {
    try {
      await logoutSession(refreshToken);
    } finally {
      clearAuth();
      queryClient.clear();
      navigate('/login', { replace: true });
    }
  }

  const avatarInitial = user?.fullName?.[0]?.toUpperCase() ?? 'U';

  function navLinkClass(path) {
    const isActive = currentPath === path;
    return [
      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200',
      isActive ? 'bg-primary/10 text-primary' : 'text-base-content/70 hover:text-primary hover:bg-base-200',
    ].join(' ');
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <header className="sticky top-0 z-50 bg-base-100 border-b border-base-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 flex items-center h-16 gap-3">
          <Link
            to="/customer/home"
            className="flex items-center gap-2 shrink-0"
            aria-label="ViVouch - Trang chủ"
          >
            <img src="/vivouch_logo_icon.png" alt="ViVouch" className="w-8 h-8 rounded-lg" />
            <span className="text-2xl font-extrabold text-primary tracking-tight">ViVouch</span>
          </Link>

          <form
            onSubmit={handleSearchSubmit}
            className={`transition-all duration-300 ease-in-out flex items-center ${
              isSearchExpanded ? 'flex-1 max-w-xl' : 'w-10 md:w-48'
            }`}
            role="search"
          >
            <label
              className={`input input-bordered flex items-center gap-2 w-full rounded-full bg-base-100 transition-all duration-200 cursor-pointer ${
                isSearchExpanded ? 'px-4 shadow-sm border-primary' : 'px-3 hover:bg-base-200'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-base-content/60 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <input
                type="search"
                className={`grow bg-transparent outline-none text-sm ${
                  !isSearchExpanded ? 'hidden md:block w-full cursor-pointer' : 'w-full'
                }`}
                placeholder="Tìm kiếm voucher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchExpanded(true)}
                onBlur={() => {
                  if (!searchQuery.trim()) {
                    setIsSearchExpanded(false);
                  }
                }}
                aria-label="Tìm kiếm voucher"
              />
            </label>
          </form>

          {!isSearchExpanded && <div className="flex-1" />}

          <nav className="hidden md:flex items-center gap-1 shrink-0" aria-label="Menu khách hàng">
            <Link
              to="/customer/cart"
              id="customer-nav-cart"
              className={`${navLinkClass('/customer/cart')} relative`}
              title="Giỏ hàng"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className={isSearchExpanded ? 'hidden' : 'inline'}>Giỏ hàng</span>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-0.5 shadow border border-base-100"
                  aria-label={`${cartCount} sản phẩm`}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            <Link
              to="/customer/my-vouchers"
              id="customer-nav-vouchers"
              className={navLinkClass('/customer/my-vouchers')}
              title="Voucher"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span className={isSearchExpanded ? 'hidden' : 'inline'}>Voucher</span>
            </Link>

            <Link to="/customer/orders" className={navLinkClass('/customer/orders')} title="Đơn hàng">
              <ReceiptText className="h-5 w-5 shrink-0" />
              <span className={isSearchExpanded ? 'hidden' : 'inline'}>Đơn hàng</span>
            </Link>

            <Link to="/customer/refunds" className={navLinkClass('/customer/refunds')} title="Hoàn tiền">
              <HandCoins className="h-5 w-5 shrink-0" />
              <span className={isSearchExpanded ? 'hidden' : 'inline'}>Hoàn tiền</span>
            </Link>

            <Link to="/customer/support" className={navLinkClass('/customer/support')} title="Hỗ trợ">
              <Headset className="h-5 w-5 shrink-0" />
              <span className={isSearchExpanded ? 'hidden' : 'inline'}>Hỗ trợ</span>
            </Link>

            <Link to="/customer/notifications" className={navLinkClass('/customer/notifications')} title="Thông báo">
              <Bell className="h-5 w-5 shrink-0" />
              <span className={isSearchExpanded ? 'hidden' : 'inline'}>Thông báo</span>
            </Link>

            <Link
              to="/customer/profile"
              id="customer-nav-profile"
              className={navLinkClass('/customer/profile')}
              title="Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className={isSearchExpanded ? 'hidden' : 'inline'}>Profile</span>
            </Link>
          </nav>

          <div className="hidden md:block h-6 w-px bg-base-200" />

          <div className="flex items-center gap-2 shrink-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold shrink-0 ring-2 ring-primary/20"
                aria-label={`Avatar của ${user?.fullName}`}
              >
                {avatarInitial}
              </div>
            )}
            <span className="hidden lg:inline text-sm font-semibold text-base-content">
              {user?.fullName}
            </span>
          </div>

          <button
            id="customer-logout-btn"
            onClick={handleLogout}
            className="btn btn-ghost btn-sm text-base-content/60 hover:text-error flex items-center gap-1.5"
            aria-label="Đăng xuất"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-grow pb-16 md:pb-0">
        <Outlet />
      </main>

      <BottomNav cartCount={cartCount} basePath="/customer" />
    </div>
  );
}
