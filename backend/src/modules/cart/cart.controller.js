import * as cartService from "./cart.service.js";
import { addItemSchema, updateQtySchema } from "./cart.validator.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

/**
 * Lấy giỏ hàng của người dùng hiện tại
 */
export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    const error = new Error("Chưa xác thực người dùng");
    error.statusCode = 401;
    throw error;
  }

  const cart = await cartService.getCart(userId);

  return res.status(200).json({
    success: true,
    message: "Lấy thông tin giỏ hàng thành công",
    data: cart
  });
});

/**
 * Thêm sản phẩm vào giỏ hàng
 */
export const addItem = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    const error = new Error("Chưa xác thực người dùng");
    error.statusCode = 401;
    throw error;
  }

  // Validate request body qua Zod
  const parsedData = addItemSchema.parse(req.body);

  const cart = await cartService.addItem(userId, parsedData);

  return res.status(200).json({
    success: true,
    message: "Thêm voucher vào giỏ hàng thành công",
    data: cart
  });
});

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */
export const updateQty = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { id: cartItemId } = req.params;

  if (!userId) {
    const error = new Error("Chưa xác thực người dùng");
    error.statusCode = 401;
    throw error;
  }

  // Validate request body qua Zod
  const parsedData = updateQtySchema.parse(req.body);

  const cart = await cartService.updateQty(userId, cartItemId, parsedData.qty);

  return res.status(200).json({
    success: true,
    message: "Cập nhật số lượng thành công",
    data: cart
  });
});

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
export const removeItem = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { id: cartItemId } = req.params;

  if (!userId) {
    const error = new Error("Chưa xác thực người dùng");
    error.statusCode = 401;
    throw error;
  }

  const cart = await cartService.removeItem(userId, cartItemId);

  return res.status(200).json({
    success: true,
    message: "Xóa voucher khỏi giỏ hàng thành công",
    data: cart
  });
});
