import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * AdminLayout - Blueprint for ViVouch Admin Management Portal
 * Follows Material Design tokens (Navy/Amber) and custom structure
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
    <div className="min-h-screen bg-[#f8f9ff] flex font-['Be_Vietnam_Pro']">
      {/* Mobile Sidebar Overlay */}
      <button
        type="button"
        aria-label="Đóng menu"
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={closeSidebar}
      />

      {/* Sidebar - Desktop & Mobile Overlay */}
      <aside 
        className={`fixed left-0 top-0 h-screen w-[260px] bg-[#213145] text-white z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="px-6 py-8">
          <div className="flex items-center gap-3 text-[#ffddb8]">
            <span className="material-symbols-outlined text-[28px] fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>
              admin_panel_settings
            </span>
            <h1 className="text-xl font-bold tracking-tight">ViVouch Admin</h1>
          </div>
          <p className="text-[#bec6e0] text-[12px] uppercase tracking-widest mt-2 font-medium opacity-70">
            Hệ thống quản trị
          </p>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
            >
              {({ isActive }) => (
                <div className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-[14px] font-medium
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
                  <span>{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-auto p-4 border-t border-[#2d3f55]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#bec6e0] hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200 text-[14px] font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-[260px] min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 bg-[#f8f9ff] border-b border-[#dce9ff] flex items-center justify-between px-4 lg:px-6">
          {/* Mobile: Hamburger + Brand */}
          <div className="flex items-center gap-3 lg:hidden">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 text-[#213145] hover:bg-[#eff4ff] rounded transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <span className="font-bold text-[#213145] text-lg">ViVouch Admin</span>
          </div>

          {/* Desktop: Search */}
          <div className="hidden lg:flex items-center relative">
            <span className="material-symbols-outlined absolute left-3 text-[#565e74] text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm..."
              className="bg-white border border-[#d8c3ad] rounded px-3 py-1.5 pl-10 text-[14px] w-64 focus:border-[#f59e0b] focus:outline-none focus:ring-1 focus:ring-[#f59e0b]/20 transition-all"
            />
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="h-8 w-8 rounded-full bg-[#d3e4fe] border border-[#dce9ff] overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#f59e0b]/30 transition-all">
              <img 
                src="https://ui-avatars.com/api/?name=Admin&background=855300&color=fff" 
                alt="Admin" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Main Canvas */}
        <main className="flex-1 p-4 md:p-6 pb-20 lg:pb-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#d3e4fe] border-t border-[#d8c3ad] h-16 px-2 pb-safe flex items-center justify-around">
        {navItems.filter(item => item.path !== '/admin/users').map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all
              ${isActive ? 'text-[#855300] font-bold' : 'text-[#534434]'}
            `}
          >
            {({ isActive }) => (
              <>
                <span 
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] whitespace-nowrap">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
