# Deployment, Environment, and Operations

## 1. Deployment architecture

```text
Vercel frontend
  -> Render backend
  -> Supabase PostgreSQL
```

Optional:

```text
Render backend -> Upstash Redis
```

## 2. Frontend deploy
Vercel settings:

```text
Root directory: frontend
Build command: npm run build
Output directory: dist
Environment: VITE_API_BASE_URL=https://your-render-api.onrender.com/api
```

## 3. Backend deploy
Render settings:

```text
Root directory: backend
Build command: npm install && npx prisma generate
Start command: npm start
```

Environment variables:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=...
JWT_ACCESS_SECRET=...
JWT_ACCESS_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=10
CLIENT_URL=https://your-vercel-app.vercel.app
```

## 4. Database deploy
Use Supabase PostgreSQL.

Steps:

1. Create Supabase project.
2. Copy connection string.
3. Set `DATABASE_URL` in backend.
4. Run migrations.
5. Run seed.

## 5. CORS
Backend CORS must allow:

```text
http://localhost:5173
https://your-vercel-domain.vercel.app
```

## 6. Production safety

- Do not expose stack trace.
- Do not log passwords/tokens.
- Use HTTPS URLs.
- Keep `.env` out of Git.
- Use `.env.example` for documentation.

## 7. Demo operations checklist

Before presentation:

- Open frontend link.
- Open backend `/health`.
- Open `/api-docs`.
- Confirm database has seed data.
- Test admin login.
- Test partner login.
- Test customer login.
- Prepare voucher code for redeem demo.
- Keep Render backend awake.
