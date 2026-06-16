import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { DashboardLayout } from '../components/common/DashboardLayout';

/**
 * AdminLayout - Blueprint for ViVouch Admin Management Portal
 * Follows Material Design tokens (Navy/Amber) with DaisyUI components
 */
export function AdminLayout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { label: 'Tổng quan', path: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Người dùng', path: '/admin/users', icon: 'group' },
    { label: 'Đối tác', path: '/admin/partners', icon: 'handshake' },
    { label: 'Voucher', path: '/admin/vouchers', icon: 'confirmation_number' },
    { label: 'Đơn hàng', path: '/admin/orders', icon: 'shopping_cart' },
    // { label: 'Nội dung', path: '/admin/content', icon: 'article' },
    { label: 'Nhật ký', path: '/admin/audit', icon: 'history' },
    // { label: 'Cài đặt', path: '/admin/settings', icon: 'settings' },
  ];

  const adminTheme = {
    contentBg: 'bg-[#f8f9ff]',
    topbarBg: 'bg-[#f8f9ff]',
    topbarBorder: 'border-[#dce9ff]',
    hamburgerColor: 'text-[#213145]',
    brandColor: 'text-[#213145]',
    
    sidebarBg: 'bg-[#213145]',
    sidebarHeaderBg: '',
    sidebarBrandIconColor: 'text-[#ffddb8]',
    sidebarSubtitleColor: 'text-[#bec6e0]',
    
    navItemText: 'text-[#bec6e0]',
    navItemHoverBg: 'hover:bg-[#2d3f55]',
    navItemHoverText: 'hover:text-white',
    navItemActiveBg: 'bg-[#2d3f55]/50',
    navItemActiveText: 'text-white',
    navItemActiveBorder: 'border-[#f59e0b]',
    
    logoutHoverBg: 'hover:bg-red-500/10',
    logoutHoverText: 'hover:text-red-400',
    logoutBorder: 'border-[#2d3f55]',
    
    mobileNavBg: 'bg-[#d3e4fe]',
    mobileNavBorder: 'border-[#d8c3ad]',
    mobileNavActiveText: 'text-[#855300]',
    mobileNavText: 'text-[#534434]'
  };

  const adminAvatar = (
    <div className="avatar">
      <div className="w-8 rounded-full ring ring-[#f59e0b]/30 ring-offset-base-100 ring-offset-1 cursor-pointer">
        <img
          src="https://ui-avatars.com/api/?name=Admin&background=855300&color=fff"
          alt="Admin"
        />
      </div>
    </div>
  );

  return (
    <DashboardLayout
      drawerId="admin-drawer"
      navItems={navItems}
      onLogout={handleLogout}
      brandName="ViVouch Admin"
      brandSubtitle="Hệ thống quản trị"
      brandIcon="admin_panel_settings"
      theme={adminTheme}
      customAvatar={adminAvatar}
      mobileNavFilter={(item) => item.path !== '/admin/users'}
    />
  );
}
