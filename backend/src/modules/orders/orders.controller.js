import ordersService from "./orders.service.js";
import { checkoutSchema, cartCheckoutSchema } from "./orders.validator.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

/**
 * Mua ngay (Buy Now)
 */
export const buyNow = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    const error = new Error("Chưa xác thực người dùng");
    error.statusCode = 401;
    throw error;
  }

  // Validate request body qua Zod
  const parsedData = checkoutSchema.parse(req.body);

  try {
    const { items, ...checkoutData } = parsedData;
    const result = await ordersService.buyNow(userId, items, checkoutData);

    return res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      data: result
    });
  } catch (err) {
    // Bắt và xử lý lỗi business logic từ service
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * Thanh toán từ giỏ hàng (Checkout from Cart)
 */
export const checkoutFromCart = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    const error = new Error("Chưa xác thực người dùng");
    error.statusCode = 401;
    throw error;
  }

  // Validate request body qua Zod
  const checkoutData = cartCheckoutSchema.parse(req.body);

  try {
    const result = await ordersService.checkoutFromCart(userId, checkoutData);

    return res.status(201).json({
      success: true,
      message: "Thanh toán từ giỏ hàng thành công",
      data: result
    });
  } catch (err) {
    // Bắt và xử lý lỗi business logic từ service
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * Lấy danh sách đơn hàng của user
 */
export const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    const error = new Error("Chưa xác thực người dùng");
    error.statusCode = 401;
    throw error;
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
    const error = new Error("Chưa xác thực người dùng");
    error.statusCode = 401;
    throw error;
  }

  const codes = await ordersService.getUserVoucherCodes(userId);

  return res.status(200).json({
    success: true,
    message: "Lấy danh sách mã voucher thành công",
    data: codes
  });
});
