import { Outlet, useLocation } from "react-router-dom";
import { PublicNavbar } from "../components/common/PublicNavbar";

/**
 * PublicLayout
 *
 * Trang /vouchers dùng header riêng (back + search) theo mockup —
 * không hiển thị PublicNavbar để tránh 2 search bar.
 */
export function PublicLayout() {
  const { pathname } = useLocation();
  const isVoucherListPage = pathname === "/vouchers";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isVoucherListPage && <PublicNavbar />}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
