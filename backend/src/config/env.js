import dotenv from 'dotenv';

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

if (!isProduction) dotenv.config();

const getEnv = (name, fallback) => {
  const value = process.env[name];
  return value !== undefined && value !== '' ? value : fallback;
};

const getBoolean = (name, fallback = false) => {
  const value = process.env[name];
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const getNumber = (name, fallback) => {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
};

const CLIENT_URL = getEnv('CLIENT_URL', 'http://localhost:5173');
const EMAIL_VERIFICATION_REQUIRED = getBoolean('EMAIL_VERIFICATION_REQUIRED', NODE_ENV !== 'test');
const EMAIL_DELIVERY_MODE = getEnv('EMAIL_DELIVERY_MODE', NODE_ENV === 'test' ? 'TEST' : 'SMTP').toUpperCase();

const requiredInProduction = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'CLIENT_URL'];
if (isProduction && EMAIL_VERIFICATION_REQUIRED) requiredInProduction.push('OTP_PEPPER');
if (isProduction && EMAIL_DELIVERY_MODE === 'SMTP') {
  requiredInProduction.push('SMTP_HOST', 'MAIL_FROM_ADDRESS');
}

if (isProduction) {
  const missing = requiredInProduction.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }
}

if (!['SMTP', 'TEST', 'LOG'].includes(EMAIL_DELIVERY_MODE)) {
  throw new Error('EMAIL_DELIVERY_MODE must be SMTP, TEST or LOG');
}

const payOsCredentials = ['PAYOS_CLIENT_ID', 'PAYOS_API_KEY', 'PAYOS_CHECKSUM_KEY'];
const configuredPayOsCredentials = payOsCredentials.filter((name) => Boolean(process.env[name]));
if (configuredPayOsCredentials.length > 0 && configuredPayOsCredentials.length !== payOsCredentials.length) {
  throw new Error('PAYOS_CLIENT_ID, PAYOS_API_KEY and PAYOS_CHECKSUM_KEY must be configured together');
}

export const env = {
  NODE_ENV,
  PORT: getNumber('PORT', 5000),
  CLIENT_URL,
  PUBLIC_API_URL: getEnv('PUBLIC_API_URL', 'http://localhost:5000'),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ACCESS_SECRET: getEnv('JWT_ACCESS_SECRET', 'dev_access_secret'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET', 'dev_refresh_secret'),
  ACCESS_TOKEN_EXPIRES_IN: getEnv('ACCESS_TOKEN_EXPIRES_IN', '15m'),
  REFRESH_TOKEN_EXPIRES_IN: getEnv('REFRESH_TOKEN_EXPIRES_IN', '7d'),
  BCRYPT_SALT_ROUNDS: getNumber('BCRYPT_SALT_ROUNDS', 10),

  EMAIL_VERIFICATION_REQUIRED,
  EMAIL_DELIVERY_MODE,
  SMTP_HOST: getEnv('SMTP_HOST', ''),
  SMTP_PORT: getNumber('SMTP_PORT', 587),
  SMTP_SECURE: getBoolean('SMTP_SECURE', false),
  SMTP_REQUIRE_TLS: getBoolean('SMTP_REQUIRE_TLS', true),
  SMTP_EHLO_HOST: getEnv('SMTP_EHLO_HOST', 'localhost'),
  SMTP_USER: getEnv('SMTP_USER', ''),
  SMTP_PASSWORD: getEnv('SMTP_PASSWORD', ''),
  MAIL_FROM_NAME: getEnv('MAIL_FROM_NAME', 'ViVouch'),
  MAIL_FROM_ADDRESS: getEnv('MAIL_FROM_ADDRESS', 'no-reply@vivouch.local'),
  OTP_PEPPER: getEnv('OTP_PEPPER', 'dev-only-otp-pepper-change-me'),
  OTP_EXPIRES_MINUTES: getNumber('OTP_EXPIRES_MINUTES', 5),
  OTP_RESEND_SECONDS: getNumber('OTP_RESEND_SECONDS', 60),
  OTP_MAX_ATTEMPTS: getNumber('OTP_MAX_ATTEMPTS', 5),

  PAYOS_API_BASE_URL: getEnv('PAYOS_API_BASE_URL', 'https://api-merchant.payos.vn'),
  PAYOS_CLIENT_ID: getEnv('PAYOS_CLIENT_ID', ''),
  PAYOS_API_KEY: getEnv('PAYOS_API_KEY', ''),
  PAYOS_CHECKSUM_KEY: getEnv('PAYOS_CHECKSUM_KEY', ''),
  PAYOS_RETURN_URL: getEnv('PAYOS_RETURN_URL', `${CLIENT_URL}/customer/payment-result`),
  PAYOS_CANCEL_URL: getEnv('PAYOS_CANCEL_URL', `${CLIENT_URL}/customer/payment-result`),
  PAYOS_LINK_EXPIRES_MINUTES: getNumber('PAYOS_LINK_EXPIRES_MINUTES', 15),

  DEMO_WALLET_INITIAL_BALANCE: getNumber('DEMO_WALLET_INITIAL_BALANCE', 1_000_000),
  PLATFORM_COMMISSION_RATE: getNumber('PLATFORM_COMMISSION_RATE', 10),
  ENABLE_VOUCHER_RECONCILIATION_JOB: getBoolean('ENABLE_VOUCHER_RECONCILIATION_JOB', NODE_ENV !== 'test'),
  RECONCILIATION_INTERVAL_MS: getNumber('RECONCILIATION_INTERVAL_MS', 60_000),
  ENABLE_EMAIL_WORKER: getBoolean('ENABLE_EMAIL_WORKER', NODE_ENV !== 'test'),
  EMAIL_WORKER_INTERVAL_MS: getNumber('EMAIL_WORKER_INTERVAL_MS', 60_000),
};

if (env.OTP_EXPIRES_MINUTES <= 0 || env.OTP_RESEND_SECONDS < 0 || env.OTP_MAX_ATTEMPTS <= 0) {
  throw new Error('OTP timing and attempt settings must be positive');
}
if (env.PLATFORM_COMMISSION_RATE < 0 || env.PLATFORM_COMMISSION_RATE > 100) {
  throw new Error('PLATFORM_COMMISSION_RATE must be between 0 and 100');
}
