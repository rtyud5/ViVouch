import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { GlobalErrorBoundary } from "../components/common/GlobalErrorBoundary";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";
import { PublicLayout } from "../layouts/PublicLayout";
import { CustomerLayout } from "../layouts/CustomerLayout";
import { PartnerLayout } from "../layouts/PartnerLayout";
import { AdminLayout } from "../layouts/AdminLayout";

const lazyNamed = (loader, exportName) => React.lazy(() => loader().then((module) => ({ default: module[exportName] })));

const HomePage = lazyNamed(() => import("../pages/public/HomePage"), "HomePage");
const LoginPage = lazyNamed(() => import("../pages/public/LoginPage"), "LoginPage");
const NotFoundPage = lazyNamed(() => import("../pages/public/NotFoundPage"), "NotFoundPage");
const RegisterPage = lazyNamed(() => import("../pages/public/RegisterPage"), "RegisterPage");
const ForgotPasswordPage = lazyNamed(() => import("../pages/public/ForgotPasswordPage"), "ForgotPasswordPage");
const VoucherListPage = lazyNamed(() => import("../pages/public/VoucherListPage"), "VoucherListPage");
const VoucherDetailPage = lazyNamed(() => import("../pages/public/VoucherDetailPage"), "VoucherDetailPage");

const MyVouchersPage = lazyNamed(() => import("../pages/customer/MyVouchersPage"), "MyVouchersPage");
const ProfilePage = lazyNamed(() => import("../pages/customer/ProfilePage"), "ProfilePage");
const CartPage = lazyNamed(() => import("../pages/customer/CartPage"), "CartPage");
const CustomerOrdersPage = lazyNamed(() => import("../pages/customer/OrdersPage"), "OrdersPage");
const CheckoutPage = lazyNamed(() => import("../pages/customer/CheckoutPage"), "CheckoutPage");
const OrderSuccessPage = lazyNamed(() => import("../pages/customer/OrderSuccessPage"), "OrderSuccessPage");

const PartnerDashboardPage = lazyNamed(() => import("../pages/partner/PartnerDashboardPage"), "PartnerDashboardPage");
const CreateVoucherPage = lazyNamed(() => import("../pages/partner/CreateVoucherPage"), "CreateVoucherPage");
const PartnerVoucherListPage = lazyNamed(() => import("../pages/partner/PartnerVoucherListPage"), "PartnerVoucherListPage");
const PartnerReportsPage = lazyNamed(() => import("../pages/partner/PartnerReportsPage"), "PartnerReportsPage");
const PartnerProfilePage = lazyNamed(() => import("../pages/partner/PartnerProfilePage"), "PartnerProfilePage");
const RedeemVoucherPage = lazyNamed(() => import("../pages/partner/RedeemVoucherPage"), "RedeemVoucherPage");
const BranchesPage = lazyNamed(() => import("../pages/partner/BranchesPage"), "BranchesPage");

const AdminDashboardPage = React.lazy(() => import("../pages/admin/AdminDashboardPage"));
const UsersPage = React.lazy(() => import("../pages/admin/UsersPage"));
const PartnersPage = React.lazy(() => import("../pages/admin/PartnersPage"));
const VoucherApprovalsPage = React.lazy(() => import("../pages/admin/VoucherApprovalsPage"));
const OrdersPage = React.lazy(() => import("../pages/admin/OrdersPage"));
const AuditLogsPage = React.lazy(() => import("../pages/admin/AuditLogsPage"));
const CmsPagesPage = lazyNamed(() => import("../pages/admin/CmsPagesPage"), "CmsPagesPage");

let AdminComponentsTest, TestComponentsPage, VoucherHooksTest, CartHooksTestWrapper;

if (import.meta.env.DEV) {
  AdminComponentsTest = React.lazy(() => import("../pages/test/AdminComponentsTest").then(m => ({ default: m.AdminComponentsTest })));
  TestComponentsPage = React.lazy(() => import("../pages/test/TestComponentsPage").then(m => ({ default: m.TestComponentsPage })));
  VoucherHooksTest = React.lazy(() => import("../pages/test/VoucherHooksTest"));
  CartHooksTestWrapper = React.lazy(() => import("../pages/test/CartHookTest").then(m => ({ default: m.CartHooksTestWrapper })));
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <GlobalErrorBoundary>
      <Suspense fallback={<div className="min-h-screen grid place-items-center"><span className="loading loading-spinner loading-lg" /></div>}>
      <Routes>

        {/* Test component */}
        {import.meta.env.DEV && (
          <Route element={<Suspense fallback={<div>Loading test suite...</div>}><Outlet /></Suspense>}>
            <Route path="/test/admin-kit" element={<AdminComponentsTest />} />
            <Route path="/test/fe/task3/week1" element={<TestComponentsPage />} /> 
            <Route path="/test/fe/task2/week2" element={<VoucherHooksTest />} /> 
            <Route path="/test/fe/task3/week2" element={ <CartHooksTestWrapper />} /> 
          </Route>
        )}

        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/vouchers" element={<VoucherListPage />} />
          <Route path="/vouchers/:id" element={<VoucherDetailPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["CUSTOMER"]}>
                <CheckoutPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

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
          <Route path="orders" element={<CustomerOrdersPage />} />
          <Route path="order-success" element={<OrderSuccessPage />} />
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
          <Route path="vouchers/:id/edit" element={<CreateVoucherPage />} />
          <Route path="vouchers" element={<PartnerVoucherListPage />} />
          <Route path="validation" element={<RedeemVoucherPage />} />
          <Route path="branches" element={<BranchesPage />} />
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
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="vouchers" element={<VoucherApprovalsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="audit" element={<AuditLogsPage />} />
          <Route path="content" element={<CmsPagesPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
      </GlobalErrorBoundary>
    </BrowserRouter>
  );
}
