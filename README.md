# ViVouch — Hệ thống TMĐT Bán Voucher Giảm Giá

Đồ án cuối kỳ môn Thương mại Điện tử · FIT HCMUS · 2026

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | React 18 + Vite + JavaScript |
| UI | TailwindCSS + DaisyUI |
| State / Data fetching | Zustand + TanStack Query |
| Backend | Node.js + Express.js + JavaScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Voucher code | nanoid |
| Logging | Pino + bảng `audit_logs` |
| Testing | Vitest + Supertest |
| API Docs | Swagger / OpenAPI |
| Deploy | Vercel (FE) + Render (BE) + Supabase (DB) |

---

## Yêu cầu

Cài sẵn trên máy trước khi bắt đầu:

- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com)

---

## Cài đặt & Chạy local

### 1. Clone repo

```bash
git clone https://github.com/<your-org>/ViVouch.git
cd ViVouch
```

### 2. Khởi động database

```bash
docker compose up -d
```

Kiểm tra database đang chạy:

```bash
docker compose ps
# vivouch_db   running   0.0.0.0:5432->5432/tcp
```

### 3. Cài đặt Backend

```bash
cd backend
copy .env.example .env      # Windows
# cp .env.example .env      # macOS / Linux
npm install
```

### 4. Cài đặt Frontend

```bash
cd ../frontend
copy .env.example .env      # Windows
# cp .env.example .env      # macOS / Linux
npm install
```

### 5. Migrate database & Seed data

```bash
cd ../backend
npx prisma migrate dev
npm run prisma:seed
```

Sau khi seed xong sẽ thấy:

```
🎉 Seed hoàn thành!
  Admin:     admin@vivouch.com    / Admin@123
  Partner:   haidilao@vivouch.com / Partner@123
  Customer:  customer1@test.com   / Test@123
```

### 6. Chạy server

Mở **2 terminal riêng biệt**:

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

### 7. Kiểm tra

| URL | Kết quả mong đợi |
|---|---|
| http://localhost:5000/health | `{"success":true,"message":"OK"}` |
| http://localhost:5173 | React app chạy |
| http://localhost:5555 | Prisma Studio (chạy `npx prisma studio`) |

---

## Biến môi trường

### `backend/.env`

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/voucher_platform
JWT_ACCESS_SECRET=vivouch_access_secret_2026
JWT_REFRESH_SECRET=vivouch_refresh_secret_2026
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

### `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Scripts

### Backend

```bash
npm run dev           # Chạy dev server với nodemon
npm run start         # Chạy production
npm run prisma:migrate # Chạy migration
npm run prisma:seed   # Seed dữ liệu mẫu
npm run test          # Chạy test
```

### Frontend

```bash
npm run dev     # Chạy dev server
npm run build   # Build production
npm run test    # Chạy test
```

---

## Cấu trúc thư mục

```
ViVouch/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema (14 models)
│   │   └── seed.js            # Dữ liệu mẫu
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
├── agent-docs/                # Tài liệu kỹ thuật cho dev
├── docs/                      # Tài liệu học thuật (BRD, ERD, Use Case...)
├── docker-compose.yml
└── README.md
```

---

## Tài khoản test

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
main         ← stable, chỉ merge từ develop khi demo
develop      ← integration branch
feature/T1.4-auth-api   ← mỗi task = 1 branch
```

**Quy trình:**

1. Tạo branch từ `develop`: `git checkout -b feature/T1.4-auth-api`
2. Code, commit thường xuyên
3. Push và tạo Pull Request vào `develop`
4. Cần ít nhất 1 người review trước khi merge
5. Merge `develop` vào `main` chỉ khi stable

---

## Xử lý sự cố thường gặp

**`Cannot find module 'autoprefixer'`**
```bash
cd frontend && npm install -D @tailwindcss/postcss autoprefixer postcss
```

**`P1001: Can't reach database`**
```bash
docker compose up -d
```

**`P1012: datasource url not supported`** — Prisma version sai, downgrade:
```bash
cd backend && npm install prisma@5 @prisma/client@5
```

**Port 5432 bị chiếm** — Đổi port trong `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"
```
Cập nhật `DATABASE_URL` thành `...@localhost:5433/...`