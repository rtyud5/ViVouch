import ordersService from "./orders.service.js";
import { checkoutSchema } from "./orders.validator.js";
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
    const order = await ordersService.buyNow(userId, parsedData.items);

    return res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      data: order
    });
  } catch (err) {
    // Bắt và xử lý lỗi business logic từ service
    if (
      err.message === "EMPTY_ITEMS" ||
      err.message.startsWith("INSUFFICIENT_STOCK:") ||
      err.message.startsWith("VOUCHER_UNAVAILABLE:")
    ) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    // Ném các lỗi khác lên cho global error handler
    throw err;
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

  try {
    const order = await ordersService.checkoutFromCart(userId);

    return res.status(201).json({
      success: true,
      message: "Thanh toán từ giỏ hàng thành công",
      data: order
    });
  } catch (err) {
    // Bắt và xử lý lỗi business logic từ service
    if (
      err.message === "EMPTY_CART" ||
      err.message.startsWith("INSUFFICIENT_STOCK:") ||
      err.message.startsWith("VOUCHER_UNAVAILABLE:")
    ) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    // Ném các lỗi khác lên cho global error handler
    throw err;
  }
});
