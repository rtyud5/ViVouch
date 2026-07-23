import ordersService from "./orders.service.js";
import { randomUUID } from "node:crypto";
import { checkoutSchema, cartCheckoutSchema } from "./orders.validator.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";

function getIdempotencyKey(req) {
  if (req.idempotencyKey) return req.idempotencyKey;
  const value = req.get("Idempotency-Key");
  if (!value) return randomUUID();

  const key = value.trim();
  if (key.length < 8 || key.length > 128) {
    throw new AppError(
      "Idempotency-Key phải có độ dài từ 8 đến 128 ký tự",
      400,
      "INVALID_IDEMPOTENCY_KEY",
    );
  }
  return key;
}

/**
 * Mua ngay (Buy Now)
 */
export const buyNow = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError("Chưa xác thực người dùng", 401, "UNAUTHORIZED");
  }

  // Validate request body qua Zod
  const parsedData = checkoutSchema.parse(req.body);

  const { items, ...checkoutData } = parsedData;
  const result = await ordersService.buyNow(userId, items, {
    ...checkoutData,
    idempotencyKey: getIdempotencyKey(req),
  });

  return res.status(result.idempotentReplay ? 200 : 201).json({
    success: true,
    message: "Tạo đơn hàng thành công",
    data: result
  });
});

/**
 * Thanh toán từ giỏ hàng (Checkout from Cart)
 */
export const checkoutFromCart = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError("Chưa xác thực người dùng", 401, "UNAUTHORIZED");
  }

  // Validate request body qua Zod
  const checkoutData = cartCheckoutSchema.parse(req.body);

  const result = await ordersService.checkoutFromCart(userId, {
    ...checkoutData,
    idempotencyKey: getIdempotencyKey(req),
  });

  return res.status(result.idempotentReplay ? 200 : 201).json({
    success: true,
    message: result.paymentStatus === "PAID" ? "Thanh toán thành công" : "Đã tạo yêu cầu thanh toán",
    data: result
  });
});

/**
 * Lấy danh sách đơn hàng của user
 */
export const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError("Chưa xác thực người dùng", 401, "UNAUTHORIZED");
  }

  const orders = await ordersService.getUserOrders(userId);

  return res.status(200).json({
    success: true,
    message: "Lấy danh sách đơn hàng thành công",
    data: orders
  });
});

/**
 * Lấy danh sách mã voucher đã mua của user
 */
export const getUserVoucherCodes = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError("Chưa xác thực người dùng", 401, "UNAUTHORIZED");
  }

  const codes = await ordersService.getUserVoucherCodes(userId);

  return res.status(200).json({
    success: true,
    message: "Lấy danh sách mã voucher thành công",
    data: codes
  });
});
