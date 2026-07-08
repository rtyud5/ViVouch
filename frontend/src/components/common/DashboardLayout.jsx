import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

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
      <div className="drawer-side z-50 lg:relative lg:overflow-visible">
        <label
          htmlFor={drawerId}
          aria-label="Đóng menu"
          className="drawer-overlay"
          tabIndex={0}
          onClick={closeSidebar}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === 'Escape') && closeSidebar()}
        />

        {/* Spacer that acts as rigid placeholder for the layout grid */}
        {isCollapsible && <div className="hidden lg:block w-[72px] shrink-0"></div>}

        <aside className={`
          min-h-full text-white flex flex-col overflow-hidden
          ${theme.sidebarBg}
          ${isCollapsible
            ? 'w-[260px] lg:w-[72px] lg:hover:w-[260px] transition-[width] duration-300 ease-in-out group/sidebar lg:absolute lg:top-0 lg:left-0 lg:bottom-0 lg:z-[60]'
            : 'w-[260px]'}
        `}>

          {/* Header */}
          <div className={`py-6 ${theme.sidebarHeaderBg || ''} ${isCollapsible ? 'px-4 lg:px-0 lg:flex lg:flex-col lg:items-center lg:hover:items-start lg:group-hover/sidebar:px-5' : 'px-5'} transition-all duration-300`}>
            <div className={`flex items-center gap-3 ${theme.sidebarBrandIconColor}`}>
              <span className="material-symbols-outlined shrink-0 text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {brandIcon}
              </span>
              <h1 className={`text-xl font-bold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isCollapsible ? 'lg:w-0 lg:opacity-0 lg:group-hover/sidebar:w-auto lg:group-hover/sidebar:opacity-100' : ''}`}>
                {brandName}
              </h1>
            </div>
            <p className={`text-[12px] uppercase tracking-widest mt-2 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${theme.sidebarSubtitleColor} ${isCollapsible ? 'lg:h-0 lg:mt-0 lg:opacity-0 lg:group-hover/sidebar:h-auto lg:group-hover/sidebar:mt-2 lg:group-hover/sidebar:opacity-70' : 'opacity-70'}`}>
              {brandSubtitle}
            </p>
          </div>

          {/* Navigation */}
          <ul className={`menu flex-1 gap-1 text-[14px] mt-2 ${isCollapsible ? 'px-2 lg:px-[10px] lg:group-hover/sidebar:px-3' : 'px-3'} transition-all duration-300`}>
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink to={item.path} onClick={closeSidebar}>
                  {({ isActive }) => {
                    const borderClass = isCollapsible ? 'lg:border-l-0 lg:group-hover/sidebar:border-l-4' : 'border-l-4';
                    const activeClasses = `${theme.navItemActiveBg} ${theme.navItemActiveText} ${borderClass} ${theme.navItemActiveBorder} font-bold`;
                    const inactiveClasses = `${theme.navItemText} ${theme.navItemHoverBg} ${theme.navItemHoverText} ${borderClass} border-transparent`;

                    return (
                    <span className={`
                      flex items-center gap-3 py-3 rounded-lg transition-all duration-200 font-medium whitespace-nowrap
                      ${isCollapsible ? 'px-2 lg:px-0 lg:justify-center lg:group-hover/sidebar:justify-start lg:group-hover/sidebar:px-4' : 'px-4'}
                      ${isActive ? activeClasses : inactiveClasses}
                    `}>
                      <span
                        className="material-symbols-outlined shrink-0 text-[20px] w-6 flex justify-center"
                        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {item.icon}
                      </span>
                      <span className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsible ? 'lg:w-0 lg:opacity-0 lg:group-hover/sidebar:w-auto lg:group-hover/sidebar:opacity-100' : ''}`}>
                        {item.label}
                      </span>
                    </span>
                    );
                  }}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Logout */}
          <div className={`mt-auto border-t ${theme.logoutBorder} ${isCollapsible ? 'p-2 lg:px-[10px] lg:py-3 lg:group-hover/sidebar:px-4' : 'p-4'} transition-all duration-300`}>
            <button
              type="button"
              onClick={onLogout}
              className={`btn btn-ghost w-full gap-3 text-[14px] font-medium normal-case flex-nowrap ${isCollapsible ? 'justify-center lg:justify-center lg:group-hover/sidebar:justify-start' : 'justify-start'} ${theme.navItemText} ${theme.logoutHoverBg} ${theme.logoutHoverText}`}
            >
              <span className="material-symbols-outlined shrink-0 text-[20px] w-6 flex justify-center">logout</span>
              <span className={`text-left whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isCollapsible ? 'lg:w-0 lg:opacity-0 lg:group-hover/sidebar:w-auto lg:group-hover/sidebar:opacity-100' : ''}`}>
                Đăng xuất
              </span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

DashboardLayout.propTypes = {
  drawerId: PropTypes.string.isRequired,
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    })
  ).isRequired,
  onLogout: PropTypes.func.isRequired,
  brandName: PropTypes.string.isRequired,
  brandSubtitle: PropTypes.string,
  brandIcon: PropTypes.string,
  theme: PropTypes.shape({
    contentBg: PropTypes.string,
    topbarBg: PropTypes.string,
    topbarBorder: PropTypes.string,
    hamburgerColor: PropTypes.string,
    brandColor: PropTypes.string,
    mobileNavBg: PropTypes.string,
    mobileNavBorder: PropTypes.string,
    mobileNavActiveText: PropTypes.string,
    mobileNavText: PropTypes.string,
    sidebarBg: PropTypes.string,
    sidebarHeaderBg: PropTypes.string,
    sidebarBrandIconColor: PropTypes.string,
    sidebarSubtitleColor: PropTypes.string,
    navItemActiveBg: PropTypes.string,
    navItemActiveText: PropTypes.string,
    navItemActiveBorder: PropTypes.string,
    navItemText: PropTypes.string,
    navItemHoverBg: PropTypes.string,
    navItemHoverText: PropTypes.string,
    logoutBorder: PropTypes.string,
    logoutHoverBg: PropTypes.string,
    logoutHoverText: PropTypes.string,
  }).isRequired,
  customAvatar: PropTypes.node,
  mobileNavFilter: PropTypes.func,
  isCollapsible: PropTypes.bool,
};
