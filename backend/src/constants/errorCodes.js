/**
 * Centralized error code vocabulary for ViVouch API.
 *
 * Rule: Frontend maps by `code`, NOT by `message`.
 * Every AppError thrown must use a code from this file.
 *
 * Groups:
 *   AUTH_*       — authentication / session
 *   ACCOUNT_*    — account status
 *   FORBIDDEN    — authorization (role / ownership)
 *   VALIDATION_* — input / Zod
 *   VOUCHER_*    — voucher lifecycle
 *   CART_*       — cart operations
 *   CHECKOUT_*   — order / checkout
 *   ORDER_*      — order queries
 *   PARTNER_*    — partner operations
 *   BRANCH_*     — branch operations
 *   REVIEW_*     — review operations
 *   DUPLICATE_*  — uniqueness conflicts
 *   NOT_FOUND    — generic resource not found
 *   INTERNAL_*   — server errors
 */
export const ERROR_CODES = {
  // ── Authentication & Session ──────────────────────
  UNAUTHORIZED: "UNAUTHORIZED",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_TOKEN: "INVALID_TOKEN",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",

  // ── Account Status ────────────────────────────────
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",

  // ── Authorization ─────────────────────────────────
  FORBIDDEN: "FORBIDDEN",

  // ── Validation / Input ────────────────────────────
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // ── Voucher Lifecycle ─────────────────────────────
  VOUCHER_NOT_FOUND: "VOUCHER_NOT_FOUND",
  VOUCHER_NOT_ON_SALE: "VOUCHER_NOT_ON_SALE",
  VOUCHER_OUT_OF_STOCK: "VOUCHER_OUT_OF_STOCK",
  VOUCHER_EXPIRED: "VOUCHER_EXPIRED",
  VOUCHER_ALREADY_USED: "VOUCHER_ALREADY_USED",
  VOUCHER_UNAVAILABLE: "VOUCHER_UNAVAILABLE",
  VOUCHER_NOT_YET_ON_SALE: "VOUCHER_NOT_YET_ON_SALE",
  VOUCHER_SALE_EXPIRED: "VOUCHER_SALE_EXPIRED",
  INVALID_SALE_PERIOD: "INVALID_SALE_PERIOD",
  INVALID_USE_PERIOD: "INVALID_USE_PERIOD",
  INVALID_PRICE: "INVALID_PRICE",
  INVALID_TOTAL_QTY: "INVALID_TOTAL_QTY",
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",
  INVALID_TRANSITION: "INVALID_TRANSITION",
  SALE_PERIOD_EXPIRED: "SALE_PERIOD_EXPIRED",

  // ── Voucher Code (Redeem) ─────────────────────────
  VOUCHER_CODE_NOT_FOUND: "VOUCHER_CODE_NOT_FOUND",
  VOUCHER_CODE_USED: "VOUCHER_CODE_USED",
  VOUCHER_CODE_EXPIRED: "VOUCHER_CODE_EXPIRED",
  VOUCHER_CODE_CANCELLED: "VOUCHER_CODE_CANCELLED",
  VOUCHER_CODE_LOCKED: "VOUCHER_CODE_LOCKED",
  INVALID_VOUCHER_CODE: "INVALID_VOUCHER_CODE",
  INVALID_BRANCH_SCOPE: "INVALID_BRANCH_SCOPE",
  INVALID_PARTNER_SCOPE: "INVALID_PARTNER_SCOPE",

  // ── Cart ──────────────────────────────────────────
  CART_ITEM_NOT_FOUND: "CART_ITEM_NOT_FOUND",

  // ── Checkout / Order ──────────────────────────────
  CHECKOUT_FAILED: "CHECKOUT_FAILED",
  EMPTY_CART: "EMPTY_CART",
  INVALID_IDEMPOTENCY_KEY: "INVALID_IDEMPOTENCY_KEY",
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",

  // ── Partner ───────────────────────────────────────
  PARTNER_NOT_FOUND: "PARTNER_NOT_FOUND",
  PARTNER_NOT_ACTIVE: "PARTNER_NOT_ACTIVE",
  SELF_ACTION: "SELF_ACTION",
  INVALID_STATUS: "INVALID_STATUS",
  MISSING_REASON: "MISSING_REASON",

  // ── Branch ────────────────────────────────────────
  BRANCH_NOT_FOUND: "BRANCH_NOT_FOUND",
  BRANCH_IN_USE: "BRANCH_IN_USE",

  // ── User ──────────────────────────────────────────
  USER_NOT_FOUND: "USER_NOT_FOUND",
  INVALID_CURRENT_PASSWORD: "INVALID_CURRENT_PASSWORD",

  // ── Review ────────────────────────────────────────
  REVIEW_ALREADY_EXISTS: "REVIEW_ALREADY_EXISTS",
  VOUCHER_NOT_USED: "VOUCHER_NOT_USED",

  // ── Duplicate / Conflict ──────────────────────────
  EMAIL_EXISTS: "EMAIL_EXISTS",
  PHONE_EXISTS: "PHONE_EXISTS",
  DUPLICATE_RESOURCE: "DUPLICATE_RESOURCE",
  RESOURCE_IN_USE: "RESOURCE_IN_USE",

  // ── Generic ───────────────────────────────────────
  NOT_FOUND: "NOT_FOUND",
  QUERY_ERROR: "QUERY_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  REQUEST_ERROR: "REQUEST_ERROR",
  CORS_NOT_ALLOWED: "CORS_NOT_ALLOWED",
  RATE_LIMITED: "RATE_LIMITED",
};
