import { Outlet } from "react-router-dom";
import { PublicNavbar } from "../components/common/PublicNavbar";

/**
 * PublicLayout
 *
 * Layout chung cho tất cả trang public:
 *  ┌──────────────────────┐
 *  │  PublicNavbar (sticky)│
 *  ├──────────────────────┤
 *  │  <Outlet /> — page   │
 *  └──────────────────────┘
 */
export function PublicLayout() {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

