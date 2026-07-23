import React, { Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { GlobalErrorBoundary } from '../components/common/GlobalErrorBoundary';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { PartnerOwnerRoute } from './PartnerOwnerRoute';
import { PublicLayout } from '../layouts/PublicLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { PartnerLayout } from '../layouts/PartnerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { useAuthStore } from '../stores/authStore';
import { getRoleLandingPath } from '../utils/roleLanding';

const lazyNamed = (loader, exportName) => React.lazy(() => loader().then((module) => ({ default: module[exportName] })));

const HomePage = lazyNamed(() => import('../pages/public/HomePage'), 'HomePage');
const LoginPage = lazyNamed(() => import('../pages/public/LoginPage'), 'LoginPage');
const NotFoundPage = lazyNamed(() => import('../pages/public/NotFoundPage'), 'NotFoundPage');
const RegisterPage = lazyNamed(() => import('../pages/public/RegisterPage'), 'RegisterPage');
const VerifyEmailPage = lazyNamed(() => import('../pages/public/VerifyEmailPage'), 'VerifyEmailPage');
const PartnerRegisterPage = lazyNamed(() => import('../pages/public/PartnerRegisterPage'), 'PartnerRegisterPage');
const StaffSetupPage = lazyNamed(() => import('../pages/public/StaffSetupPage'), 'StaffSetupPage');
const ForgotPasswordPage = lazyNamed(() => import('../pages/public/ForgotPasswordPage'), 'ForgotPasswordPage');
const VoucherListPage = lazyNamed(() => import('../pages/public/VoucherListPage'), 'VoucherListPage');
const VoucherDetailPage = lazyNamed(() => import('../pages/public/VoucherDetailPage'), 'VoucherDetailPage');

const MyVouchersPage = lazyNamed(() => import('../pages/customer/MyVouchersPage'), 'MyVouchersPage');
const ProfilePage = lazyNamed(() => import('../pages/customer/ProfilePage'), 'ProfilePage');
const CartPage = lazyNamed(() => import('../pages/customer/CartPage'), 'CartPage');
const CustomerOrdersPage = lazyNamed(() => import('../pages/customer/OrdersPage'), 'OrdersPage');
const CheckoutPage = lazyNamed(() => import('../pages/customer/CheckoutPage'), 'CheckoutPage');
const OrderSuccessPage = lazyNamed(() => import('../pages/customer/OrderSuccessPage'), 'OrderSuccessPage');
const PaymentResultPage = lazyNamed(() => import('../pages/customer/PaymentResultPage'), 'PaymentResultPage');
const CustomerRefundsPage = lazyNamed(() => import('../pages/customer/RefundsPage'), 'RefundsPage');
const CustomerTicketsPage = lazyNamed(() => import('../pages/customer/SupportTicketsPage'), 'SupportTicketsPage');
const NotificationsPage = lazyNamed(() => import('../pages/shared/NotificationsPage'), 'NotificationsPage');

const PartnerDashboardPage = lazyNamed(() => import('../pages/partner/PartnerDashboardPage'), 'PartnerDashboardPage');
const CreateVoucherPage = lazyNamed(() => import('../pages/partner/CreateVoucherPage'), 'CreateVoucherPage');
const PartnerVoucherListPage = lazyNamed(() => import('../pages/partner/PartnerVoucherListPage'), 'PartnerVoucherListPage');
const PartnerReportsPage = lazyNamed(() => import('../pages/partner/PartnerReportsPage'), 'PartnerReportsPage');
const PartnerProfilePage = lazyNamed(() => import('../pages/partner/PartnerProfilePage'), 'PartnerProfilePage');
const RedeemVoucherPage = lazyNamed(() => import('../pages/partner/RedeemVoucherPage'), 'RedeemVoucherPage');
const BranchesPage = lazyNamed(() => import('../pages/partner/BranchesPage'), 'BranchesPage');
const StaffManagementPage = lazyNamed(() => import('../pages/partner/StaffManagementPage'), 'StaffManagementPage');
const StaffRedeemHistoryPage = lazyNamed(() => import('../pages/partner/StaffRedeemHistoryPage'), 'StaffRedeemHistoryPage');

const AdminDashboardPage = React.lazy(() => import('../pages/admin/AdminDashboardPage'));
const UsersPage = React.lazy(() => import('../pages/admin/UsersPage'));
const PartnersPage = React.lazy(() => import('../pages/admin/PartnersPage'));
const VoucherApprovalsPage = React.lazy(() => import('../pages/admin/VoucherApprovalsPage'));
const OrdersPage = React.lazy(() => import('../pages/admin/OrdersPage'));
const AuditLogsPage = React.lazy(() => import('../pages/admin/AuditLogsPage'));
const CmsPagesPage = lazyNamed(() => import('../pages/admin/CmsPagesPage'), 'CmsPagesPage');
const AdminRefundsPage = React.lazy(() => import('../pages/admin/RefundsPage'));
const AdminTicketsPage = React.lazy(() => import('../pages/admin/SupportTicketsPage'));

let AdminComponentsTest;
let TestComponentsPage;
let VoucherHooksTest;
let CartHooksTestWrapper;

if (import.meta.env.DEV) {
  AdminComponentsTest = React.lazy(() => import('../pages/test/AdminComponentsTest').then((module) => ({ default: module.AdminComponentsTest })));
  TestComponentsPage = React.lazy(() => import('../pages/test/TestComponentsPage').then((module) => ({ default: module.TestComponentsPage })));
  VoucherHooksTest = React.lazy(() => import('../pages/test/VoucherHooksTest'));
  CartHooksTestWrapper = React.lazy(() => import('../pages/test/CartHookTest').then((module) => ({ default: module.CartHooksTestWrapper })));
}


function PartnerLandingRedirect() {
  const user = useAuthStore((state) => state.user);
  return <Navigate to={getRoleLandingPath(user)} replace />;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <GlobalErrorBoundary>
        <Suspense fallback={<div className="min-h-screen grid place-items-center"><span className="loading loading-spinner loading-lg" /></div>}>
          <Routes>
            {import.meta.env.DEV && (
              <Route element={<Suspense fallback={<div>Loading test suite...</div>}><Outlet /></Suspense>}>
                <Route path="/test/admin-kit" element={<AdminComponentsTest />} />
                <Route path="/test/fe/task3/week1" element={<TestComponentsPage />} />
                <Route path="/test/fe/task2/week2" element={<VoucherHooksTest />} />
                <Route path="/test/fe/task3/week2" element={<CartHooksTestWrapper />} />
              </Route>
            )}

            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/vouchers" element={<VoucherListPage />} />
              <Route path="/vouchers/:id" element={<VoucherDetailPage />} />
            </Route>

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/partner/apply" element={<PartnerRegisterPage />} />
            <Route path="/staff/setup" element={<StaffSetupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/checkout" element={<ProtectedRoute><RoleRoute allowedRoles={['CUSTOMER']}><CheckoutPage /></RoleRoute></ProtectedRoute>} />

            <Route path="/customer" element={<ProtectedRoute><RoleRoute allowedRoles={['CUSTOMER']}><CustomerLayout /></RoleRoute></ProtectedRoute>}>
              <Route index element={<HomePage />} />
              <Route path="home" element={<HomePage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="my-vouchers" element={<MyVouchersPage />} />
              <Route path="orders" element={<CustomerOrdersPage />} />
              <Route path="order-success" element={<OrderSuccessPage />} />
              <Route path="payment-result" element={<PaymentResultPage />} />
              <Route path="refunds" element={<CustomerRefundsPage />} />
              <Route path="support" element={<CustomerTicketsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route path="/partner" element={<ProtectedRoute><RoleRoute allowedRoles={['PARTNER']}><PartnerLayout /></RoleRoute></ProtectedRoute>}>
              <Route index element={<PartnerLandingRedirect />} />
              <Route element={<PartnerOwnerRoute />}>
                <Route path="dashboard" element={<PartnerDashboardPage />} />
                <Route path="vouchers/new" element={<CreateVoucherPage />} />
                <Route path="vouchers/:id/edit" element={<CreateVoucherPage />} />
                <Route path="vouchers" element={<PartnerVoucherListPage />} />
                <Route path="branches" element={<BranchesPage />} />
                <Route path="staff" element={<StaffManagementPage />} />
                <Route path="reports" element={<PartnerReportsPage />} />
              </Route>
              <Route path="validation" element={<RedeemVoucherPage />} />
              <Route path="redeem-history" element={<StaffRedeemHistoryPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<PartnerProfilePage />} />
            </Route>

            <Route path="/admin" element={<ProtectedRoute><RoleRoute allowedRoles={['ADMIN']}><AdminLayout /></RoleRoute></ProtectedRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="partners" element={<PartnersPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="vouchers" element={<VoucherApprovalsPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="refunds" element={<AdminRefundsPage />} />
              <Route path="tickets" element={<AdminTicketsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
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
