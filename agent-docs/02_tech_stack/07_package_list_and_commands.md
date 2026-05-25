# Package List and Commands

## 1. Frontend packages

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom @tanstack/react-query zustand axios
npm install react-hook-form zod @hookform/resolvers
npm install qrcode.react recharts
npm install -D tailwindcss postcss autoprefixer daisyui
npx tailwindcss init -p
```

## 2. Backend packages

```bash
mkdir backend
cd backend
npm init -y
npm install express cors helmet dotenv bcrypt jsonwebtoken zod
npm install @prisma/client nanoid pino pino-http express-rate-limit
npm install swagger-ui-express swagger-jsdoc
npm install -D nodemon prisma vitest supertest
npx prisma init
```

## 3. Optional Redis packages

```bash
npm install ioredis rate-limit-redis
```

## 4. Backend scripts

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "seed": "node prisma/seed.js"
  }
}
```

## 5. Frontend scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## 6. Development commands

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Database:

```bash
cd backend
npx prisma migrate dev --name init
npm run seed
npx prisma studio
```

## 7. Verification commands

```bash
curl http://localhost:5000/health
curl http://localhost:5000/api-docs
npm test
```
