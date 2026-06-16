import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";
import { PublicLayout } from "../layouts/PublicLayout";
import { CustomerLayout } from "../layouts/CustomerLayout";
import { PartnerLayout } from "../layouts/PartnerLayout";
import { AdminLayout } from "../layouts/AdminLayout";

import { HomePage } from "../pages/public/HomePage";
import { LoginPage } from "../pages/public/LoginPage";
import { NotFoundPage } from "../pages/public/NotFoundPage";
import { RegisterPage } from "../pages/public/RegisterPage";
import { VoucherListPage } from "../pages/public/VoucherListPage";
import { VoucherDetailPage } from "../pages/public/VoucherDetailPage";

// Customer
import { MyVouchersPage } from "../pages/customer/MyVouchersPage"
import { ProfilePage } from "../pages/customer/ProfilePage"
import { CartPage } from "../pages/customer/CartPage"

// Partner
import { PartnerDashboardPage } from "../pages/partner/PartnerDashboardPage"
import { CreateVoucherPage } from "../pages/partner/CreateVoucherPage"
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

import { AdminComponentsTest } from "../pages/test/AdminComponentsTest";
import { TestComponentsPage } from "../pages/test/TestComponentsPage";
import VoucherHooksTest from "../pages/test/VoucherHooksTest";
import { CartHooksTestWrapper } from "../pages/test/CartHookTest"

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Test component */}
        <Route path="/test/admin-kit" element={<AdminComponentsTest />} />
        <Route path="/test/fe/task3/week1" element={<TestComponentsPage />} /> 
        <Route path="/test/fe/task2/week2" element={<VoucherHooksTest />} /> 
        <Route path="/test/fe/task3/week2" element={ <CartHooksTestWrapper />} /> 

        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/vouchers" element={<VoucherListPage />} />
          <Route path="/vouchers/:id" element={<VoucherDetailPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer Portal */}
        <Route path="/customer" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["CUSTOMER"]}>
              <CustomerLayout />
            </RoleRoute>
          </ProtectedRoute>
        }>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="my-vouchers" element={<MyVouchersPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Partner Portal */}
        <Route path="/partner" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["PARTNER"]}>
              <PartnerLayout />
            </RoleRoute>
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<PartnerDashboardPage />} />
          <Route path="vouchers/new" element={<CreateVoucherPage />} />
          <Route path="vouchers" element={<PartnerVoucherListPage />} />
          <Route path="validation" element={<RedeemVoucherPage />} />
          <Route path="reports" element={<PartnerReportsPage />} />
          <Route path="profile" element={<PartnerProfilePage />} />
        </Route>

        {/* Admin Portal */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }>
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
