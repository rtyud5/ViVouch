import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * AdminLayout - Blueprint for ViVouch Admin Management Portal
 * Follows Material Design tokens (Navy/Amber) with DaisyUI components
 */
export function AdminLayout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Người dùng', path: '/admin/users', icon: 'group' },
    { label: 'Đối tác', path: '/admin/partners', icon: 'handshake' },
    { label: 'Voucher', path: '/admin/vouchers', icon: 'confirmation_number' },
    { label: 'Đơn hàng', path: '/admin/orders', icon: 'shopping_cart' },
    { label: 'Nhật ký', path: '/admin/audit', icon: 'history' },
  ];

  return (
    // DaisyUI drawer: lg:drawer-open keeps sidebar visible on desktop;
    // drawer-open is toggled by isSidebarOpen on mobile.
    <div className={`drawer lg:drawer-open min-h-screen font-['Be_Vietnam_Pro'] ${isSidebarOpen ? 'drawer-open' : ''}`}>
      {/* Controlled checkbox required by DaisyUI drawer; state driven by React */}
      <input
        id="admin-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isSidebarOpen}
        onChange={() => {}}
        readOnly
      />

      {/* ── drawer-content: topbar + main canvas + mobile bottom nav ── */}
      <div className="drawer-content flex flex-col bg-[#f8f9ff]">

        {/* Topbar — DaisyUI navbar */}
        <header className="navbar sticky top-0 z-30 bg-[#f8f9ff] border-b border-[#dce9ff] min-h-14 px-4 lg:px-6">

          {/* Mobile: hamburger trigger (label opens drawer) + brand */}
          <div className="navbar-start lg:hidden">
            <button
              type="button"
              className="btn btn-ghost btn-square"
              aria-label="Mở menu"
              title="Mở menu"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="material-symbols-outlined text-[24px] text-[#213145]">menu</span>
            </button>
            <span className="font-bold text-[#213145] text-lg ml-1">ViVouch Admin</span>
          </div>

          {/* Desktop: search input — DaisyUI input */}
          <div className="navbar-start hidden lg:flex">
            <label className="input input-bordered flex items-center gap-2 w-64 h-9 text-[14px]">
              <span className="material-symbols-outlined text-[18px] text-[#565e74]">search</span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                aria-label="Tìm kiếm"
                className="grow bg-transparent outline-none"
              />
            </label>
          </div>

          {/* User avatar — DaisyUI avatar */}
          <div className="navbar-end">
            <div className="avatar">
              <div className="w-8 rounded-full ring ring-[#f59e0b]/30 ring-offset-base-100 ring-offset-1 cursor-pointer">
                <img
                  src="https://ui-avatars.com/api/?name=Admin&background=855300&color=fff"
                  alt="Admin"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main canvas */}
        <main className="flex-1 p-4 md:p-6 pb-20 lg:pb-6 overflow-y-auto">
          <Outlet />
        </main>

        {/* Mobile bottom navigation — DaisyUI btm-nav */}
        <nav className="btm-nav lg:hidden bg-[#d3e4fe] border-t border-[#d8c3ad] z-40">
          {navItems.filter((item) => item.path !== '/admin/users').map((item) => (
            <NavLink key={item.path} to={item.path}>
              {({ isActive }) => (
                <button
                  type="button"
                  className={isActive ? 'active text-[#855300]' : 'text-[#534434]'}
                >
                  <span
                    className="material-symbols-outlined text-[24px]"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span className="btm-nav-label text-[10px] whitespace-nowrap">{item.label}</span>
                </button>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ── drawer-side: overlay + sidebar ── */}
      <div className="drawer-side z-50">
        {/* DaisyUI overlay — clicking it closes the drawer */}
        <label
          htmlFor="admin-drawer"
          aria-label="Đóng menu"
          className="drawer-overlay"
          onClick={closeSidebar}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === 'Escape') && closeSidebar()}
        />

        {/* Sidebar */}
        <aside className="w-[260px] min-h-full bg-[#213145] text-white flex flex-col">

          {/* Sidebar header */}
          <div className="px-6 py-8">
            <div className="flex items-center gap-3 text-[#ffddb8]">
              <span
                className="material-symbols-outlined text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                admin_panel_settings
              </span>
              <h1 className="text-xl font-bold tracking-tight">ViVouch Admin</h1>
            </div>
            <p className="text-[#bec6e0] text-[12px] uppercase tracking-widest mt-2 font-medium opacity-70">
              Hệ thống quản trị
            </p>
          </div>

          {/* Sidebar nav — DaisyUI menu */}
          <ul className="menu flex-1 px-3 gap-1 text-[14px]">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink to={item.path} onClick={closeSidebar}>
                  {({ isActive }) => (
                    <span className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                      ${isActive
                        ? 'bg-[#2d3f55]/50 text-white border-l-4 border-[#f59e0b] font-bold'
                        : 'text-[#bec6e0] hover:bg-[#2d3f55] hover:text-white'}
                    `}>
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Sidebar footer — DaisyUI btn */}
          <div className="mt-auto p-4 border-t border-[#2d3f55]">
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-ghost w-full justify-start gap-3 text-[#bec6e0] hover:bg-red-500/10 hover:text-red-400 text-[14px] font-medium normal-case"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Đăng xuất
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
