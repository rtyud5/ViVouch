# Frontend Route Map

| Area | Routes | Guard |
|---|---|---|
| Public | `/`, `/vouchers`, `/vouchers/:id`, `/login`, `/register`, `/forgot-password` | None |
| Customer | `/checkout`, `/customer/home`, `/cart`, `/my-vouchers`, `/orders`, `/order-success`, `/profile` | Auth + CUSTOMER |
| Partner | `/partner/dashboard`, `/vouchers`, `/vouchers/new`, `/vouchers/:id/edit`, `/branches`, `/validation`, `/reports`, `/profile` | Auth + PARTNER |
| Admin | `/admin/dashboard`, `/users`, `/partners`, `/vouchers`, `/orders`, `/content`, `/audit` | Auth + ADMIN |

Unknown paths render the Not Found page. Authenticated users who request an unauthorized portal are stopped by `RoleRoute`; backend RBAC remains authoritative.

All page modules are route-lazy-loaded through `AppRoutes`. A shared Suspense fallback provides a stable loading state and keeps the production entry chunk below the bundle warning threshold.

Mobile portal navigation uses compact bottom navigation where appropriate; desktop uses portal-specific headers/sidebars.
