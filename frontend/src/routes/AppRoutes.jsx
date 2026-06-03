import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { CustomerLayout } from "../layouts/CustomerLayout";
import { PartnerLayout } from "../layouts/PartnerLayout";
import { AdminLayout } from "../layouts/AdminLayout";

import { HomePage } from "../pages/public/HomePage";
import { LoginPage } from "../pages/public/LoginPage";
import { NotFoundPage } from "../pages/public/NotFoundPage";
import { RegisterPage } from "../pages/public/RegisterPage";

// Customer
import { MyVouchersPage } from "../pages/customer/MyVouchersPage"
import { ProfilePage } from "../pages/customer/ProfilePage"
import { CartPage } from "../pages/customer/CartPage"

// Partner
import { PartnerDashboardPage } from "../pages/partner/PartnerDashboardPage"
import { PartnerVoucherListPage } from "../pages/partner/PartnerVoucherListPage"
import { PartnerReportsPage } from "../pages/partner/PartnerReportsPage"
import { PartnerProfilePage } from "../pages/partner/PartnerProfilePage"
import { RedeemVoucherPage } from "../pages/partner/RedeemVoucherPage"

// Admin
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage"; 
import { UsersPage } from "../pages/admin/UsersPage"
import { PartnersPage } from "../pages/admin/PartnersPage"
import { VoucherApprovalsPage } from "../pages/admin/VoucherApprovalsPage"
import { OrdersPage } from "../pages/admin/OrdersPage"
import { AuditLogsPage } from "../pages/admin/AuditLogsPage"

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Customer Portal */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="my-vouchers" element={<MyVouchersPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Partner Portal */}
        <Route path="/partner" element={<PartnerLayout />}>
          <Route path="dashboard" element={<PartnerDashboardPage />} />
          <Route path="vouchers" element={<PartnerVoucherListPage />} />
          <Route path="validation" element={<RedeemVoucherPage />} />
          <Route path="reports" element={<PartnerReportsPage />} />
          <Route path="profile" element={<PartnerProfilePage />} />
        </Route>

        {/* Admin Portal */}
        <Route path="/admin" element={<AdminLayout />}>    
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="vouchers" element={<VoucherApprovalsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="audit" element={<AuditLogsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
