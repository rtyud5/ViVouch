# Project Folder Tree

```text
voucher_platform_project_skeleton/
├── .cursor/
│   └── rules/
│       ├── backend.mdc
│       ├── frontend.mdc
│       └── project.mdc
├── .github/
│   ├── workflows/
│   │   └── ci.yml
│   ├── copilot-instructions.md
│   └── PULL_REQUEST_TEMPLATE.md
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   │   └── text.txt
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js
│   │   │   ├── logger.js
│   │   │   ├── prisma.js
│   │   │   └── swagger.js
│   │   ├── constants/
│   │   │   ├── auditActions.js
│   │   │   ├── errorCodes.js
│   │   │   ├── roles.js
│   │   │   └── statuses.js
│   │   ├── jobs/
│   │   │   └── text.txt
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   ├── idempotency.middleware.js
│   │   │   ├── rateLimit.middleware.js
│   │   │   ├── role.middleware.js
│   │   │   └── validate.middleware.js
│   │   ├── modules/
│   │   │   ├── admin/
│   │   │   │   ├── admin.controller.js
│   │   │   │   ├── admin.routes.js
│   │   │   │   ├── admin.service.js
│   │   │   │   └── admin.validator.js
│   │   │   ├── auditLogs/
│   │   │   │   ├── auditLog.routes.js
│   │   │   │   └── auditLog.service.js
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.service.js
│   │   │   │   └── auth.validator.js
│   │   │   ├── branches/
│   │   │   │   ├── branches.controller.js
│   │   │   │   ├── branches.routes.js
│   │   │   │   ├── branches.service.js
│   │   │   │   └── branches.validator.js
│   │   │   ├── cart/
│   │   │   │   ├── cart.controller.js
│   │   │   │   ├── cart.routes.js
│   │   │   │   ├── cart.service.js
│   │   │   │   └── cart.validator.js
│   │   │   ├── categories/
│   │   │   │   ├── categories.controller.js
│   │   │   │   ├── categories.routes.js
│   │   │   │   ├── categories.service.js
│   │   │   │   └── categories.validator.js
│   │   │   ├── orders/
│   │   │   │   ├── orders.controller.js
│   │   │   │   ├── orders.routes.js
│   │   │   │   ├── orders.service.js
│   │   │   │   └── orders.validator.js
│   │   │   ├── partners/
│   │   │   │   ├── partners.controller.js
│   │   │   │   ├── partners.routes.js
│   │   │   │   ├── partners.service.js
│   │   │   │   └── partners.validator.js
│   │   │   ├── payments/
│   │   │   │   └── payment.service.js
│   │   │   ├── reports/
│   │   │   │   ├── reports.controller.js
│   │   │   │   ├── reports.routes.js
│   │   │   │   ├── reports.service.js
│   │   │   │   └── reports.validator.js
│   │   │   ├── reviews/
│   │   │   │   ├── reviews.controller.js
│   │   │   │   ├── reviews.routes.js
│   │   │   │   ├── reviews.service.js
│   │   │   │   └── reviews.validator.js
│   │   │   ├── users/
│   │   │   │   ├── users.controller.js
│   │   │   │   ├── users.routes.js
│   │   │   │   ├── users.service.js
│   │   │   │   └── users.validator.js
│   │   │   ├── voucherCodes/
│   │   │   │   ├── voucherCodes.controller.js
│   │   │   │   ├── voucherCodes.routes.js
│   │   │   │   ├── voucherCodes.service.js
│   │   │   │   └── voucherCodes.validator.js
│   │   │   └── vouchers/
│   │   │       ├── vouchers.controller.js
│   │   │       ├── vouchers.routes.js
│   │   │       ├── vouchers.service.js
│   │   │       └── vouchers.validator.js
│   │   ├── utils/
│   │   │   ├── appError.js
│   │   │   ├── asyncHandler.js
│   │   │   ├── date.js
│   │   │   ├── generateVoucherCode.js
│   │   │   ├── response.js
│   │   │   └── stateMachine.js
│   │   ├── app.js
│   │   └── server.js
│   ├── swagger/
│   │   └── openapi.yaml
│   ├── tests/
│   │   ├── admin-dashboard.test.js
│   │   ├── auth.test.js
│   │   ├── checkout.test.js
│   │   ├── redeem.test.js
│   │   └── voucher-approval.test.js
│   ├── uploads/
│   │   └── text.txt
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── database/
│   ├── erd/
│   │   └── text.txt
│   ├── exports/
│   │   └── text.txt
│   ├── seed-data/
│   │   ├── sample-users.json
│   │   └── sample-vouchers.json
│   └── README.md
├── deployment/
│   ├── docker-compose.yml
│   ├── README.md
│   ├── render.yaml
│   └── vercel.json
├── docs/
│   ├── 01_project_requirements/
│   │   ├── 01_brd_summary.md
│   │   ├── 02_roles_and_permissions.md
│   │   ├── 03_business_rules.md
│   │   └── 04_acceptance_criteria.md
│   ├── 02_system_analysis/
│   │   ├── 01_use_case_diagram.md
│   │   ├── 02_use_case_specs.md
│   │   └── 03_activity_diagrams.md
│   ├── 03_database_design/
│   │   ├── 01_erd.md
│   │   └── 02_data_dictionary.md
│   ├── 04_architecture_design/
│   │   ├── 01_architecture_overview.md
│   │   ├── 02_design_patterns.md
│   │   ├── 03_consistency_locking_cache.md
│   │   └── 04_security.md
│   ├── 05_api_design/
│   │   ├── 01_api_overview.md
│   │   └── 02_api_docs_plan.md
│   ├── 06_frontend_design/
│   │   ├── 01_ui_routes.md
│   │   └── 02_ui_components.md
│   ├── 07_testing/
│   │   └── 01_test_plan.md
│   ├── 08_deployment/
│   │   └── 01_deployment_plan.md
│   ├── 09_demo/
│   │   └── 01_demo_script.md
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── providers/
│   │   │       └── QueryProvider.jsx
│   │   ├── assets/
│   │   │   ├── icons/
│   │   │   │   └── text.txt
│   │   │   └── images/
│   │   │       └── text.txt
│   │   ├── components/
│   │   │   ├── cart/
│   │   │   │   └── CartItem.jsx
│   │   │   ├── common/
│   │   │   │   ├── ConfirmModal.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   ├── SearchInput.jsx
│   │   │   │   └── StatusBadge.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── ChartCard.jsx
│   │   │   │   └── StatCard.jsx
│   │   │   ├── forms/
│   │   │   │   ├── SelectInput.jsx
│   │   │   │   └── TextInput.jsx
│   │   │   └── voucher/
│   │   │       ├── VoucherCard.jsx
│   │   │       ├── VoucherFilter.jsx
│   │   │       └── VoucherStatusBadge.jsx
│   │   ├── features/
│   │   │   ├── admin/
│   │   │   │   ├── api/
│   │   │   │   │   └── text.txt
│   │   │   │   └── components/
│   │   │   │       └── text.txt
│   │   │   ├── auth/
│   │   │   │   ├── api/
│   │   │   │   │   └── text.txt
│   │   │   │   ├── components/
│   │   │   │   │   └── text.txt
│   │   │   │   └── hooks/
│   │   │   │       └── text.txt
│   │   │   ├── cart/
│   │   │   │   ├── api/
│   │   │   │   │   └── text.txt
│   │   │   │   └── components/
│   │   │   │       └── text.txt
│   │   │   ├── orders/
│   │   │   │   ├── api/
│   │   │   │   │   └── text.txt
│   │   │   │   └── components/
│   │   │   │       └── text.txt
│   │   │   ├── partner/
│   │   │   │   ├── api/
│   │   │   │   │   └── text.txt
│   │   │   │   └── components/
│   │   │   │       └── text.txt
│   │   │   └── vouchers/
│   │   │       ├── api/
│   │   │       │   └── text.txt
│   │   │       ├── components/
│   │   │       │   └── text.txt
│   │   │       └── hooks/
│   │   │           └── text.txt
│   │   ├── hooks/
│   │   │   └── text.txt
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── CustomerLayout.jsx
│   │   │   ├── PartnerLayout.jsx
│   │   │   └── PublicLayout.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboardPage.jsx
│   │   │   │   ├── AuditLogsPage.jsx
│   │   │   │   ├── CategoriesPage.jsx
│   │   │   │   ├── CmsPagesPage.jsx
│   │   │   │   ├── OrdersPage.jsx
│   │   │   │   ├── PartnersPage.jsx
│   │   │   │   ├── UsersPage.jsx
│   │   │   │   └── VoucherApprovalsPage.jsx
│   │   │   ├── customer/
│   │   │   │   ├── CartPage.jsx
│   │   │   │   ├── CheckoutPage.jsx
│   │   │   │   ├── MyVouchersPage.jsx
│   │   │   │   ├── OrdersPage.jsx
│   │   │   │   └── ProfilePage.jsx
│   │   │   ├── partner/
│   │   │   │   ├── BranchesPage.jsx
│   │   │   │   ├── CreateVoucherPage.jsx
│   │   │   │   ├── PartnerDashboardPage.jsx
│   │   │   │   ├── PartnerProfilePage.jsx
│   │   │   │   ├── PartnerReportsPage.jsx
│   │   │   │   ├── PartnerVoucherListPage.jsx
│   │   │   │   └── RedeemVoucherPage.jsx
│   │   │   └── public/
│   │   │       ├── HomePage.jsx
│   │   │       ├── LoginPage.jsx
│   │   │       ├── NotFoundPage.jsx
│   │   │       ├── RegisterPage.jsx
│   │   │       ├── VoucherDetailPage.jsx
│   │   │       └── VoucherListPage.jsx
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── RoleRoute.jsx
│   │   ├── services/
│   │   │   └── apiClient.js
│   │   ├── stores/
│   │   │   ├── authStore.js
│   │   │   └── uiStore.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── tests/
│   │   │   └── text.txt
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── formatCurrency.js
│   │   │   └── formatDate.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── README.md
│   └── tailwind.config.js
├── scripts/
│   ├── README.md
│   ├── reset-db.sh
│   └── setup-local.sh
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── CONTRIBUTING.md
├── GEMINI.md
├── LICENSE.txt
├── opencode.json
├── README.md
└── TREE.md
```
