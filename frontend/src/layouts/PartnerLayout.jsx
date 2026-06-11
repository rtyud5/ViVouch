import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { DashboardLayout } from '../components/common/DashboardLayout';

/**
 * PartnerLayout — Layout dành cho Partner Portal
 *
 * Sidebar tím đậm (#3B1F79), text trắng/xám nhạt.
 * Phân biệt rõ ràng với Customer (xanh lá) và Admin (navy/amber).
 */
export function PartnerLayout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { label: 'Tổng quan',       path: '/partner/dashboard',  icon: 'dashboard' },
    { label: 'Voucher của tôi', path: '/partner/vouchers',   icon: 'confirmation_number' },
    { label: 'Xác thực',        path: '/partner/validation', icon: 'verified_user' },
    { label: 'Báo cáo',         path: '/partner/reports',    icon: 'bar_chart' },
    { label: 'Cài đặt',         path: '/partner/profile',    icon: 'settings' },
  ];

  const partnerTheme = {
    contentBg: 'bg-[#F5F3FF]',
    topbarBg: 'bg-[#FAFAFF]',
    topbarBorder: 'border-[#E9E5F5]',
    hamburgerColor: 'text-[#3B1F79]',
    brandColor: 'text-[#3B1F79]',
    
    sidebarBg: 'bg-[#3B1F79]',
    sidebarHeaderBg: 'bg-[#2E1760]',
    sidebarBrandIconColor: 'text-[#C084FC]',
    sidebarSubtitleColor: 'text-[#C4B5FD]',
    
    navItemText: 'text-[#C4B5FD]',
    navItemHoverBg: 'hover:bg-[#4F2D96]',
    navItemHoverText: 'hover:text-[#FFFFFF]',
    navItemActiveBg: 'bg-[rgba(139,92,246,0.18)]',
    navItemActiveText: 'text-[#FFFFFF]',
    navItemActiveBorder: 'border-[#C084FC]',
    
    logoutHoverBg: 'hover:bg-[#EF4444]/10',
    logoutHoverText: 'hover:text-[#FCA5A5]',
    logoutBorder: 'border-[#4F2D96]',
    
    mobileNavBg: 'bg-[#EDE9FE]',
    mobileNavBorder: 'border-[#DDD6FE]',
    mobileNavActiveText: 'text-[#3B1F79]',
    mobileNavText: 'text-[#7C6CA0]'
  };

  const avatarInitial = user?.fullName?.[0]?.toUpperCase() ?? 'P';

  const partnerAvatar = (
    <div className="flex items-center gap-2">
      {user?.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.fullName}
          className="w-8 h-8 rounded-full object-cover"
          style={{ boxShadow: `0 0 0 2px #C084FC40` }}
        />
      ) : (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-[#3B1F79]"
          aria-label={`Avatar của ${user?.fullName}`}
        >
          {avatarInitial}
        </div>
      )}
      <span className="hidden lg:inline text-sm font-semibold text-base-content">
        {user?.fullName}
      </span>
    </div>
  );

  return (
    <DashboardLayout
      drawerId="partner-drawer"
      navItems={navItems}
      onLogout={handleLogout}
      brandName="ViVouch Partner"
      brandSubtitle="Cổng đối tác"
      brandIcon="storefront"
      theme={partnerTheme}
      customAvatar={partnerAvatar}
    />
  );
}
