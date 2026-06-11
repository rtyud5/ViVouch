import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * PartnerLayout — Layout dành cho Partner Portal
 *
 * Sidebar tím đậm (#3B1F79), text trắng/xám nhạt.
 * Phân biệt rõ ràng với Customer (xanh lá) và Admin (navy/amber).
 *
 * Desktop (lg+): sidebar cố định bên trái 260px, nội dung chiếm phần còn lại.
 * Mobile: sidebar collapse, mở bằng hamburger button; overlay đóng sidebar.
 *
 * Active link: highlight nền tím nhạt hơn + border-left vàng cam.
 */
export function PartnerLayout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  // ── Nav items ──────────────────────────────────────────────────────────────
  // label: tên hiển thị tiếng Việt theo yêu cầu
  // path: map đúng route trong AppRoutes.jsx
  // icon: Material Symbols icon name
  const navItems = [
    { label: 'Tổng quan',       path: '/partner/dashboard',  icon: 'dashboard' },
    { label: 'Voucher của tôi', path: '/partner/vouchers',   icon: 'confirmation_number' },
    { label: 'Xác thực',        path: '/partner/validation', icon: 'verified_user' },
    { label: 'Báo cáo',         path: '/partner/reports',    icon: 'bar_chart' },
    { label: 'Cài đặt',         path: '/partner/profile',    icon: 'settings' },
  ];

  // ── Color tokens ───────────────────────────────────────────────────────────
  // Tập trung ở đây để dễ chỉnh / maintain
  const COLORS = {
    sidebarBg:     '#3B1F79',   // tím đậm chủ đạo
    sidebarDarker: '#2E1760',   // tím tối hơn cho header
    hoverBg:       '#4F2D96',   // tím khi hover
    activeBg:      'rgba(139, 92, 246, 0.18)', // tím nhạt cho active state
    activeBorder:  '#C084FC',   // tím sáng cho border active
    textPrimary:   '#FFFFFF',   // text chính trên sidebar
    textMuted:     '#C4B5FD',   // text phụ / muted (violet-300)
    topbarBg:      '#FAFAFF',   // nền topbar desktop
    contentBg:     '#F5F3FF',   // nền content area (violet rất nhạt)
  };

  // ── Avatar fallback ────────────────────────────────────────────────────────
  const avatarInitial = user?.fullName?.[0]?.toUpperCase() ?? 'P';

  return (
    <div className={`drawer lg:drawer-open min-h-screen font-['Be_Vietnam_Pro'] ${isSidebarOpen ? 'drawer-open' : ''}`}>
      {/* DaisyUI drawer checkbox — state driven bởi React */}
      <input
        id="partner-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isSidebarOpen}
        onChange={() => {}}
        readOnly
      />

      {/* ── drawer-content: topbar + main ───────────────────────────────────── */}
      <div className="drawer-content flex flex-col" style={{ backgroundColor: COLORS.contentBg }}>

        {/* Topbar */}
        <header
          className="navbar sticky top-0 z-30 border-b min-h-14 px-4 lg:px-6"
          style={{ backgroundColor: COLORS.topbarBg, borderColor: '#E9E5F5' }}
        >
          {/* Mobile: hamburger + brand */}
          <div className="navbar-start lg:hidden">
            <button
              type="button"
              className="btn btn-ghost btn-square"
              aria-label="Mở menu"
              title="Mở menu"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="material-symbols-outlined text-[24px]" style={{ color: COLORS.sidebarBg }}>
                menu
              </span>
            </button>
            <span className="font-bold text-lg ml-1" style={{ color: COLORS.sidebarBg }}>
              ViVouch Partner
            </span>
          </div>

          {/* Desktop: search */}
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

          {/* User avatar */}
          <div className="navbar-end">
            <div className="flex items-center gap-2">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                  style={{ boxShadow: `0 0 0 2px ${COLORS.activeBorder}40` }}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: COLORS.sidebarBg }}
                  aria-label={`Avatar của ${user?.fullName}`}
                >
                  {avatarInitial}
                </div>
              )}
              <span className="hidden lg:inline text-sm font-semibold text-base-content">
                {user?.fullName}
              </span>
            </div>
          </div>
        </header>

        {/* Main canvas */}
        <main className="flex-1 p-4 md:p-6 pb-20 lg:pb-6 overflow-y-auto">
          <Outlet />
        </main>

        {/* ── Mobile bottom nav ─────────────────────────────────────────────── */}
        <nav
          className="btm-nav lg:hidden z-40 border-t"
          style={{ backgroundColor: '#EDE9FE', borderColor: '#DDD6FE' }}
        >
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} onClick={closeSidebar}>
              {({ isActive }) => (
                <button
                  type="button"
                  className={isActive ? 'active' : ''}
                  style={{ color: isActive ? COLORS.sidebarBg : '#7C6CA0' }}
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

      {/* ── drawer-side: overlay + sidebar ─────────────────────────────────── */}
      <div className="drawer-side z-50">
        {/* Overlay — click để đóng sidebar trên mobile */}
        <label
          htmlFor="partner-drawer"
          aria-label="Đóng menu"
          className="drawer-overlay"
          onClick={closeSidebar}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === 'Escape') && closeSidebar()}
        />

        {/* Sidebar */}
        <aside
          className="w-[260px] min-h-full text-white flex flex-col"
          style={{ backgroundColor: COLORS.sidebarBg }}
        >

          {/* ── Sidebar header: Logo ─────────────────────────────────────────── */}
          <div className="px-6 py-8" style={{ backgroundColor: COLORS.sidebarDarker }}>
            <div className="flex items-center gap-3" style={{ color: COLORS.activeBorder }}>
              <span
                className="material-symbols-outlined text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                storefront
              </span>
              <h1 className="text-xl font-bold tracking-tight">ViVouch Partner</h1>
            </div>
            <p
              className="text-[12px] uppercase tracking-widest mt-2 font-medium opacity-70"
              style={{ color: COLORS.textMuted }}
            >
              Cổng đối tác
            </p>
          </div>

          {/* ── Sidebar nav — DaisyUI menu ───────────────────────────────────── */}
          <ul className="menu flex-1 px-3 gap-1 text-[14px] mt-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink to={item.path} onClick={closeSidebar}>
                  {({ isActive }) => (
                    <span
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-all duration-200 font-medium
                      `}
                      style={
                        isActive
                          ? {
                              backgroundColor: COLORS.activeBg,
                              color: COLORS.textPrimary,
                              borderLeft: `4px solid ${COLORS.activeBorder}`,
                              fontWeight: 700,
                            }
                          : {
                              color: COLORS.textMuted,
                              borderLeft: '4px solid transparent',
                            }
                      }
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = COLORS.hoverBg;
                          e.currentTarget.style.color = COLORS.textPrimary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = COLORS.textMuted;
                        }
                      }}
                    >
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

          {/* ── Sidebar footer: logout ───────────────────────────────────────── */}
          <div className="mt-auto p-4" style={{ borderTop: `1px solid ${COLORS.hoverBg}` }}>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-ghost w-full justify-start gap-3 text-[14px] font-medium normal-case"
              style={{ color: COLORS.textMuted }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.color = '#FCA5A5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = COLORS.textMuted;
              }}
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
