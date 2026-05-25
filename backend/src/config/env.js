import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "dev_access_secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret"
};
