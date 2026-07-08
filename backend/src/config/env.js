import dotenv from "dotenv";

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

if (!isProduction) {
  dotenv.config();
}

const getEnv = (name, fallback) => {
  const value = process.env[name];
  if (value !== undefined && value !== "") return value;
  return fallback;
};

const requiredInProduction = [
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "CLIENT_URL"
];

if (isProduction) {
  const missing = requiredInProduction.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`
    );
  }
}

export const env = {
  NODE_ENV,
  PORT: Number(process.env.PORT || 5000),
  CLIENT_URL: getEnv("CLIENT_URL", "http://localhost:5173"),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET", "dev_access_secret"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET", "dev_refresh_secret"),
  ACCESS_TOKEN_EXPIRES_IN: getEnv("ACCESS_TOKEN_EXPIRES_IN", "15m"),
  REFRESH_TOKEN_EXPIRES_IN: getEnv("REFRESH_TOKEN_EXPIRES_IN", "7d"),
  BCRYPT_SALT_ROUNDS: getEnv("BCRYPT_SALT_ROUNDS", "10")
};
