import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Router } from "express";
import { env } from "../config/env.js";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ViVouch API Docs",
      version: "1.0.0",
      description: "Tài liệu API cho Hệ thống Sàn giao dịch Voucher ViVouch (Dành cho Sinh viên)",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT || 5000}`,
        description: "Môi trường Phát triển (Development Server)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Nhập token JWT dạng: Bearer <token>",
        },
      },
      schemas: {
        UserResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", example: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" },
            email: { type: "string", format: "email", example: "customer@example.com" },
            fullName: { type: "string", example: "Nguyễn Văn A" },
            phone: { type: "string", nullable: true, example: "0901234567" },
            role: { type: "string", enum: ["CUSTOMER", "PARTNER", "ADMIN"], example: "CUSTOMER" },
            status: { type: "string", enum: ["ACTIVE", "LOCKED"], example: "ACTIVE" },
            createdAt: { type: "string", format: "date-time", example: "2026-06-03T12:00:00.000Z" },
            updatedAt: { type: "string", format: "date-time", example: "2026-06-03T12:30:00.000Z" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Thông điệp lỗi chi tiết" },
            errors: {
              type: "array",
              items: { type: "object" },
              description: "Danh sách lỗi chi tiết nếu có (ví dụ: lỗi validation Zod)",
            },
          },
        },
      },
    },
  },
  apis: ["./src/modules/**/*.js", "./src/docs/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

const router = Router();
router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export { router as swaggerDocs, swaggerSpec };
