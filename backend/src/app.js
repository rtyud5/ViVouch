import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { swaggerDocs } from "./docs/swagger.js";
import categoriesRouter from './modules/categories/categories.routes.js';
import vouchersRouter from './modules/vouchers/vouchers.routes.js';
import cartRouter from './modules/cart/cart.routes.js';
import adminRouter from './modules/admin/admin.routes.js';
import ordersRouter from './modules/orders/orders.routes.js';
import partnersRouter from './modules/partners/partners.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ success: true, message: "Voucher API is running" }));

app.use("/api-docs", swaggerDocs);
app.use("/api/auth", authRoutes);
app.use('/api/categories', categoriesRouter);
app.use('/api/vouchers', vouchersRouter);
app.use('/api/customer/cart', cartRouter);
app.use('/api/customer/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/partner', partnersRouter);

app.use(errorMiddleware);

export default app;
