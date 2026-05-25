# Frontend

React 18 + Vite + JavaScript frontend.

Responsibilities:

- Public voucher catalog
- Customer pages: cart, checkout, orders, my vouchers
- Partner portal: profile, branches, voucher management, redeem voucher
- Admin dashboard: users, partners, voucher approvals, orders, audit logs

Main frontend patterns:

- React Router v6 for routing and role guards
- TanStack Query for server-state fetching/caching
- Zustand for small client state such as auth user, role, sidebar
- React Hook Form + Zod for form validation
- DaisyUI for cards, tables, badges, modals, buttons
