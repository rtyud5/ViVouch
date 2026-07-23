# ViVouch — Discount Voucher E-Commerce Platform

Final project for E-Commerce course · FIT HCMUS · 2026

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + JavaScript |
| UI | TailwindCSS + DaisyUI |
| State / Data fetching | Zustand + TanStack Query |
| Backend | Node.js + Express.js + JavaScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt + email OTP (SMTP) |
| Validation | Zod |
| Voucher code | nanoid |
| Payment | ViVouch demo wallet + payOS hosted VietQR |
| Logging | Pino + request correlation + `audit_logs` table |
| Testing | Vitest + Supertest |
| API Docs | Swagger / OpenAPI |
| Deploy | Vercel (FE) + Render (BE) + Supabase (DB) |

---

## Prerequisites

Make sure the following are installed before getting started:

- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com)

---

## Installation & Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/<your-org>/ViVouch.git
cd ViVouch
```

### 2. Start the database

```bash
docker compose up -d
```

Verify the database is running:

```bash
docker compose ps
# vivouch_db   running   0.0.0.0:5432->5432/tcp
```

### 3. Set up Backend

```bash
cd backend
copy .env.example .env      # Windows
# cp .env.example .env      # macOS / Linux
npm ci
```

### 4. Set up Frontend

```bash
cd ../frontend
copy .env.example .env      # Windows
# cp .env.example .env      # macOS / Linux
npm ci
```

### 5. Migrate database & Seed data

```bash
cd ../backend
npx prisma migrate deploy
npm run prisma:seed
```

After seeding completes you should see:

```
🎉 Seed completed!
  Admin:     admin@vivouch.com    / Admin@123
  Partner:   haidilao@vivouch.com / Partner@123
  Customer:  customer1@test.com   / Test@123
```

### 6. Run the servers

Open **2 separate terminals**:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → http://localhost:5000
```

```bash
# Terminal 2 — Frontend
cd frontend
npm run dev
# → http://localhost:5173
```

### 7. Verify

| URL | Expected result |
|---|---|
| http://localhost:5000/health/live | `{"success":true,"status":"live"}` |
| http://localhost:5000/health/ready | readiness including PostgreSQL |
| http://localhost:5173 | React app is running |
| http://localhost:5555 | Prisma Studio (run `npx prisma studio`) |

---

## Environment Variables

### `backend/.env`

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/voucher_platform
JWT_ACCESS_SECRET=vivouch_access_secret_2026
JWT_REFRESH_SECRET=replace_with_a_long_random_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10

EMAIL_VERIFICATION_REQUIRED=true
EMAIL_DELIVERY_MODE=SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_REQUIRE_TLS=true
SMTP_USER=your-user
SMTP_PASSWORD=your-app-password
MAIL_FROM_ADDRESS=no-reply@example.com
OTP_PEPPER=replace_with_a_long_random_otp_pepper

# Optional real demo payment: set all three together
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
```

### `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## W6-W7 Marketplace Demo+ Features

- Customer and Partner registration with real SMTP OTP.
- Partner Owner and branch-scoped Staff accounts.
- ViVouch demo wallet and payOS VietQR hosted checkout.
- Full-order refund workflow, support tickets, in-app notifications, and transactional email outbox.
- Idempotent checkout, duplicate-webhook protection, branch-scoped redeem, request IDs, reconciliation jobs, CI, Sonar workflow, and backup/restore runbooks.

Detailed setup and state rules: [docs/11_w6_w7_marketplace](docs/11_w6_w7_marketplace/README.md).

---

## Scripts

### Backend

```bash
npm run dev           # Run dev server with nodemon
npm run start         # Run production
npm run prisma:migrate # Run migrations
npm run prisma:seed   # Seed sample data
npm run test          # Run tests
```

### Frontend

```bash
npm run dev     # Run dev server
npm run build   # Build for production
npm run test    # Run tests
```

---

## Project Structure

```
ViVouch/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema (14 models)
│   │   └── seed.js            # Sample data
│   └── src/
│       ├── modules/           # Business modules (auth, vouchers, orders...)
│       ├── middlewares/       # JWT auth, error handler, rate limit
│       ├── config/            # env, logger
│       └── utils/             # generateVoucherCode, stateMachine
├── frontend/
│   └── src/
│       ├── pages/             # Customer / Partner / Admin / Public
│       ├── components/        # Shared components
│       ├── features/          # Feature-based modules
│       ├── stores/            # Zustand stores
│       ├── routes/            # AppRoutes, ProtectedRoute, RoleRoute
│       └── services/          # apiClient (Axios)
├── agent-docs/                # Technical documentation for developers
├── docs/                      # Academic documents (BRD, ERD, Use Case...)
├── docker-compose.yml
└── README.md
```

---

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@vivouch.com | Admin@123 |
| Partner | haidilao@vivouch.com | Partner@123 |
| Partner | zenspa@vivouch.com | Partner@123 |
| Partner | gotravel@vivouch.com | Partner@123 |
| Customer | customer1@test.com | Test@123 |
| Customer | customer2@test.com | Test@123 |
| Customer | customer3@test.com | Test@123 |

---

## Git Workflow

```
main                        ← production-ready, receives merges from feature branches
feature/T1.4-auth-api       ← each task = its own branch
```

**Process:**

1. Get assigned a task, create a branch from `main`: `git checkout -b feature/T1.4-auth-api`
2. Code and commit frequently on your own branch
3. Push branch and open a Pull Request into `main`
4. PR is automatically reviewed by **Gemini Bot**, **CodeRabbit**, and **SonarQube**
5. Self-review code based on bot feedback and push fixes as needed
6. Optionally request a team member review if needed
7. Merge into `main` once all bot checks pass

---

## Troubleshooting

**`Cannot find module 'autoprefixer'`**
```bash
cd frontend && npm install -D @tailwindcss/postcss autoprefixer postcss
```

**`P1001: Can't reach database`**
```bash
docker compose up -d
```

**`P1012: datasource url not supported`** — Wrong Prisma version, downgrade:
```bash
cd backend && npm install prisma@5 @prisma/client@5
```

**Port 5432 is already in use** — Change port in `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"
```
Then update `DATABASE_URL` to `...@localhost:5433/...`