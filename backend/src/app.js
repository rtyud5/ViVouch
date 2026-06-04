import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { swaggerDocs } from "./docs/swagger.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ success: true, message: "Voucher API is running" }));

app.use("/api-docs", swaggerDocs);
app.use("/api/auth", authRoutes);

// TODO: mount các module routes khác tại đây

app.use(errorMiddleware);

export default app;
