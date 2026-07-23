import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { AppError } from './utils/appError.js';
import authRoutes from './modules/auth/auth.routes.js';
import { swaggerDocs } from './docs/swagger.js';
import categoriesRouter from './modules/categories/categories.routes.js';
import vouchersRouter from './modules/vouchers/vouchers.routes.js';
import cartRouter from './modules/cart/cart.routes.js';
import adminRouter from './modules/admin/admin.routes.js';
import ordersRouter from './modules/orders/orders.routes.js';
import partnersRouter from './modules/partners/partners.routes.js';
import usersRouter from './modules/users/users.routes.js';
import cmsRouter from './modules/cms/cms.routes.js';
import notificationsRouter from './modules/notifications/notifications.routes.js';
import paymentsRouter from './modules/payments/payment.routes.js';
import { customerRefundRouter } from './modules/refunds/refunds.routes.js';
import { customerTicketRouter } from './modules/supportTickets/supportTickets.routes.js';
import { requestContextMiddleware } from './middlewares/requestContext.middleware.js';

const app = express();
const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (env.NODE_ENV === 'production') {
      return origin === env.CLIENT_URL
        ? callback(null, true)
        : callback(new AppError('CORS origin is not allowed', 403, 'CORS_NOT_ALLOWED'));
    }
    return allowedOrigins.includes(origin)
      ? callback(null, true)
      : callback(new AppError('CORS origin is not allowed', 403, 'CORS_NOT_ALLOWED'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(requestContextMiddleware);

app.get('/health', (req, res) => res.json({ success: true, message: 'Voucher API is running' }));
app.get('/health/live', (req, res) => res.json({ success: true, status: 'live' }));
app.get('/health/ready', async (req, res) => {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database readiness timeout')), 2000)),
    ]);
    return res.json({ success: true, status: 'ready' });
  } catch (error) {
    return res.status(503).json({ success: false, status: 'not_ready', code: 'DATABASE_NOT_READY' });
  }
});

app.use('/api-docs', swaggerDocs);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRouter);
app.use('/api/content', cmsRouter);
app.use('/api/vouchers', vouchersRouter);
app.use('/api/customer/cart', cartRouter);
app.use('/api/customer/orders', ordersRouter);
app.use('/api/customer/refunds', customerRefundRouter);
app.use('/api/customer/tickets', customerTicketRouter);
app.use('/api/admin', adminRouter);
app.use('/api/partner', partnersRouter);
app.use('/api/users', usersRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/payments', paymentsRouter);

app.use((req, res, next) => next(new AppError('Endpoint not found', 404, 'ROUTE_NOT_FOUND')));
app.use(errorMiddleware);

export default app;
