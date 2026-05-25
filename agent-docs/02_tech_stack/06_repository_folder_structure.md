# Repository Folder Structure

## 1. Recommended monorepo structure

```text
voucher-ecommerce/
  README.md
  AGENTS.md
  package.json                 # optional root scripts
  docs/
  frontend/
  backend/
  deliverables/
```

## 2. Frontend structure

```text
frontend/
  package.json
  index.html
  vite.config.js
  .env.example
  src/
    main.jsx
    App.jsx
    assets/
    components/
      common/
      voucher/
      cart/
      dashboard/
      forms/
    layouts/
      PublicLayout.jsx
      CustomerLayout.jsx
      PartnerLayout.jsx
      AdminLayout.jsx
    pages/
      public/
        HomePage.jsx
        VoucherListPage.jsx
        VoucherDetailPage.jsx
        LoginPage.jsx
        RegisterPage.jsx
      customer/
        CartPage.jsx
        CheckoutPage.jsx
        OrdersPage.jsx
        MyVouchersPage.jsx
        ProfilePage.jsx
      partner/
        PartnerDashboardPage.jsx
        PartnerProfilePage.jsx
        BranchesPage.jsx
        PartnerVouchersPage.jsx
        VoucherCreatePage.jsx
        RedeemPage.jsx
        PartnerReportsPage.jsx
      admin/
        AdminDashboardPage.jsx
        UsersPage.jsx
        PartnersPage.jsx
        AdminVouchersPage.jsx
        OrdersPage.jsx
        CategoriesPage.jsx
        BannersPage.jsx
        AuditLogsPage.jsx
    routes/
      AppRoutes.jsx
      ProtectedRoute.jsx
      RoleRoute.jsx
    services/
      apiClient.js
      authApi.js
      voucherApi.js
      cartApi.js
      orderApi.js
      partnerApi.js
      adminApi.js
      reportApi.js
    stores/
      authStore.js
      uiStore.js
    hooks/
    utils/
    styles/
      index.css
```

## 3. Backend structure

```text
backend/
  package.json
  .env.example
  prisma/
    schema.prisma
    seed.js
    migrations/
  src/
    app.js
    server.js
    config/
      env.js
      prisma.js
      logger.js
    middlewares/
      auth.middleware.js
      role.middleware.js
      validate.middleware.js
      error.middleware.js
      rateLimit.middleware.js
    modules/
      auth/
        auth.routes.js
        auth.controller.js
        auth.service.js
        auth.validator.js
      users/
      partners/
      branches/
      vouchers/
      cart/
      orders/
      payments/
      voucherCodes/
      reviews/
      admin/
      reports/
      auditLogs/
      cms/
    utils/
      appError.js
      response.js
      generateVoucherCode.js
      stateMachine.js
      date.js
    docs/
      swagger.js
    tests/
      auth.test.js
      voucher.test.js
      checkout.test.js
      redeem.test.js
```

## 4. Documentation structure

```text
docs/
  requirements/
  architecture/
  api/
  testing/
  demo/
```

## 5. Git branches

```text
main
develop
feature/auth-rbac
feature/prisma-schema
feature/partner-voucher
feature/admin-approval
feature/customer-checkout
feature/partner-redeem
feature/dashboard-reports
feature/tests-swagger
```
