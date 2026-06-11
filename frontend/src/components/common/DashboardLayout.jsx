import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';

/**
 * Shared Dashboard Layout component to eliminate duplicate code
 * between AdminLayout and PartnerLayout.
 */
export function DashboardLayout({
  drawerId,
  navItems,
  onLogout,
  brandName,
  brandSubtitle,
  brandIcon,
  theme,
  customAvatar,
  mobileNavFilter = () => true
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className={`drawer lg:drawer-open min-h-screen font-['Be_Vietnam_Pro'] ${isSidebarOpen ? 'drawer-open' : ''}`}>
      <input
        id={drawerId}
        type="checkbox"
        className="drawer-toggle"
        checked={isSidebarOpen}
        readOnly
      />

      {/* ── drawer-content ── */}
      <div className={`drawer-content flex flex-col ${theme.contentBg}`}>
        <header className={`navbar sticky top-0 z-30 border-b min-h-14 px-4 lg:px-6 ${theme.topbarBg} ${theme.topbarBorder}`}>
          <div className="navbar-start lg:hidden">
            <button
              type="button"
              className="btn btn-ghost btn-square"
              aria-label="Mở menu"
              title="Mở menu"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className={`material-symbols-outlined text-[24px] ${theme.hamburgerColor}`}>menu</span>
            </button>
            <span className={`font-bold text-lg ml-1 ${theme.brandColor}`}>{brandName}</span>
          </div>

          <div className="navbar-start hidden lg:flex">
            <label className="input input-bordered flex items-center gap-2 w-64 h-9 text-[14px]">
              <span className="material-symbols-outlined text-[18px] text-[#565e74]">search</span>
              <input type="text" placeholder="Tìm kiếm..." aria-label="Tìm kiếm" className="grow bg-transparent outline-none" />
            </label>
          </div>

          <div className="navbar-end">
            {customAvatar}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 pb-20 lg:pb-6 overflow-y-auto">
          <Outlet />
        </main>

        <nav className={`btm-nav lg:hidden z-40 border-t ${theme.mobileNavBg} ${theme.mobileNavBorder}`}>
          {navItems.filter(mobileNavFilter).map((item) => (
            <NavLink key={item.path} to={item.path} onClick={closeSidebar}>
              {({ isActive }) => (
                <button
                  type="button"
                  className={isActive ? `active ${theme.mobileNavActiveText}` : theme.mobileNavText}
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

      {/* ── drawer-side ── */}
      <div className="drawer-side z-50">
        <label
          htmlFor={drawerId}
          aria-label="Đóng menu"
          className="drawer-overlay"
          tabIndex={0}
          onClick={closeSidebar}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === 'Escape') && closeSidebar()}
        />

        <aside className={`w-[260px] min-h-full text-white flex flex-col ${theme.sidebarBg}`}>
          <div className={`px-6 py-8 ${theme.sidebarHeaderBg || ''}`}>
            <div className={`flex items-center gap-3 ${theme.sidebarBrandIconColor}`}>
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {brandIcon}
              </span>
              <h1 className="text-xl font-bold tracking-tight">{brandName}</h1>
            </div>
            <p className={`text-[12px] uppercase tracking-widest mt-2 font-medium opacity-70 ${theme.sidebarSubtitleColor}`}>
              {brandSubtitle}
            </p>
          </div>

          <ul className="menu flex-1 px-3 gap-1 text-[14px] mt-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink to={item.path} onClick={closeSidebar}>
                  {({ isActive }) => (
                    <span className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                      ${isActive
                        ? `${theme.navItemActiveBg} ${theme.navItemActiveText} border-l-4 ${theme.navItemActiveBorder} font-bold`
                        : `${theme.navItemText} ${theme.navItemHoverBg} ${theme.navItemHoverText} border-l-4 border-transparent`}
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

          <div className={`mt-auto p-4 border-t ${theme.logoutBorder}`}>
            <button
              type="button"
              onClick={onLogout}
              className={`btn btn-ghost w-full justify-start gap-3 text-[14px] font-medium normal-case ${theme.navItemText} ${theme.logoutHoverBg} ${theme.logoutHoverText}`}
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
