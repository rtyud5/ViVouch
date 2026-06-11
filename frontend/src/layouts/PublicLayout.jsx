import { Outlet, useLocation } from "react-router-dom";
import { PublicNavbar } from "../components/common/PublicNavbar";
import { BottomNav } from "../components/common/BottomNav";

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

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Desktop Navbar — ẩn trên trang danh sách voucher */}
      {!isVoucherListPage && <PublicNavbar />}

      {/* Nội dung trang */}
      <div className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </div>

      {/* Bottom Navigation — chỉ hiển thị trên mobile */}
      {/* basePath rỗng = public routes; giỏ hàng / voucher / profile sẽ redirect sang /login */}
      <BottomNav cartCount={0} basePath="" />
    </div>
  );
}
