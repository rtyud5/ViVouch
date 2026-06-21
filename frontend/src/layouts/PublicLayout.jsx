import { Outlet, useLocation } from "react-router-dom";
import { PublicNavbar } from "../components/common/PublicNavbar";
import { BottomNav } from "../components/common/BottomNav";
import { useAuthStore } from "../stores/authStore";
import { useCart } from "../features/cart/hooks/useCart";

/**
 * PublicLayout
 *
 * Layout dành cho trang công khai (chưa đăng nhập).
 * - Desktop: hiển thị PublicNavbar trên cùng, ẩn BottomNav.
 * - Mobile : hiển thị BottomNav phía dưới với 5 icon.
 *
 * Trang /vouchers dùng header riêng (back + search) theo mockup —
 * không hiển thị PublicNavbar để tránh 2 search bar.
 */
export function PublicLayout() {
  const { pathname } = useLocation();
  const isVoucherListPage = pathname === "/vouchers";
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const isCustomer = isAuthenticated && user?.role === "customer";

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Desktop Navbar — ẩn trên trang danh sách voucher */}
      {!isVoucherListPage && <PublicNavbar />}

      {/* Nội dung trang */}
      <div className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </div>

      {/* Bottom Navigation — chỉ hiển thị trên mobile */}
      {isCustomer ? (
        <AuthenticatedBottomNav />
      ) : (
        <BottomNav cartCount={0} basePath="" />
      )}
    </div>
  );
}

function AuthenticatedBottomNav() {
  const { cartCount } = useCart();
  return <BottomNav cartCount={cartCount} basePath="/customer" />;
}
