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
  mobileNavFilter = () => true,
  isCollapsible = false
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
        onChange={(e) => setIsSidebarOpen(e.target.checked)}
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

        <aside className={`min-h-full text-white flex flex-col transition-all duration-300 ease-in-out ${theme.sidebarBg} ${
          isCollapsible ? 'w-[260px] lg:w-[72px] hover:lg:w-[260px] group/sidebar' : 'w-[260px]'
        }`}>
          <div className={`py-8 transition-all duration-300 ${theme.sidebarHeaderBg || ''} ${
            isCollapsible ? 'px-4 lg:px-5 lg:group-hover/sidebar:px-6' : 'px-6'
          }`}>
            <div className={`flex items-center transition-all duration-300 ${
              isCollapsible ? 'justify-start lg:justify-center lg:group-hover/sidebar:justify-start gap-3 lg:gap-0 lg:group-hover/sidebar:gap-3' : 'gap-3'
            } ${theme.sidebarBrandIconColor}`}>
              <span className="material-symbols-outlined text-[28px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                {brandIcon}
              </span>
              <h1 className={`text-xl font-bold tracking-tight transition-all duration-300 whitespace-nowrap ${
                isCollapsible ? 'lg:opacity-0 lg:group-hover/sidebar:opacity-100 lg:w-0 lg:group-hover/sidebar:w-auto lg:overflow-hidden' : ''
              }`}>
                {brandName}
              </h1>
            </div>
            <p className={`text-[12px] uppercase tracking-widest mt-2 font-medium opacity-70 transition-all duration-300 whitespace-nowrap ${theme.sidebarSubtitleColor} ${
              isCollapsible ? 'lg:opacity-0 lg:group-hover/sidebar:opacity-100 lg:h-0 lg:group-hover/sidebar:h-auto lg:overflow-hidden' : ''
            }`}>
              {brandSubtitle}
            </p>
          </div>

          <ul className={`menu flex-1 gap-1 text-[14px] mt-2 transition-all duration-300 ${
            isCollapsible ? 'px-3 lg:px-2 lg:group-hover/sidebar:px-3' : 'px-3'
          }`}>
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink to={item.path} onClick={closeSidebar}>
                  {({ isActive }) => (
                    <span className={`
                      flex items-center rounded-lg transition-all duration-200 font-medium
                      ${isCollapsible 
                        ? 'px-4 py-3 lg:px-3 lg:justify-center lg:group-hover/sidebar:justify-start lg:group-hover/sidebar:px-4 lg:group-hover/sidebar:gap-3 gap-0' 
                        : 'px-4 py-3 gap-3'}
                      ${isActive
                        ? `${theme.navItemActiveBg} ${theme.navItemActiveText} border-l-4 ${theme.navItemActiveBorder} font-bold`
                        : `${theme.navItemText} ${theme.navItemHoverBg} ${theme.navItemHoverText} border-l-4 border-transparent`}
                    `}>
                      <span
                        className="material-symbols-outlined text-[20px] shrink-0"
                        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {item.icon}
                      </span>
                      <span className={`transition-all duration-300 whitespace-nowrap ${
                        isCollapsible ? 'lg:opacity-0 lg:group-hover/sidebar:opacity-100 lg:w-0 lg:group-hover/sidebar:w-auto lg:overflow-hidden' : ''
                      }`}>
                        {item.label}
                      </span>
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className={`mt-auto border-t transition-all duration-300 ${theme.logoutBorder} ${
            isCollapsible ? 'p-4 lg:p-2 lg:group-hover/sidebar:p-4' : 'p-4'
          }`}>
            <button
              type="button"
              onClick={onLogout}
              className={`btn btn-ghost w-full gap-3 text-[14px] font-medium normal-case transition-all duration-300 ${theme.navItemText} ${theme.logoutHoverBg} ${theme.logoutHoverText} ${
                isCollapsible ? 'justify-start lg:justify-center lg:group-hover/sidebar:justify-start lg:px-3' : 'justify-start px-4'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">logout</span>
              <span className={`transition-all duration-300 whitespace-nowrap ${
                isCollapsible ? 'lg:opacity-0 lg:group-hover/sidebar:opacity-100 lg:w-0 lg:group-hover/sidebar:w-auto lg:overflow-hidden' : ''
              }`}>
                Đăng xuất
              </span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
