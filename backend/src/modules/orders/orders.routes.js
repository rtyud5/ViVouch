import { Router } from "express";
import * as ordersController from "./orders.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

const router = Router();

// Tất cả endpoints order đều yêu cầu xác thực và quyền CUSTOMER
router.use(verifyToken);
router.use(requireRole("CUSTOMER"));

/**
 * @swagger
 * /api/customer/orders:
 *   get:
 *     summary: Lấy danh sách đơn hàng
 *     description: Lấy danh sách đơn hàng của CUSTOMER hiện tại. Yêu cầu JWT Access Token.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/", ordersController.getUserOrders);

/**
 * @swagger
 * /api/customer/orders/voucher-codes:
 *   get:
 *     summary: Lấy danh sách mã voucher
 *     description: Lấy danh sách mã voucher đã mua của CUSTOMER hiện tại. Yêu cầu JWT Access Token.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/voucher-codes", ordersController.getUserVoucherCodes);

/**
 * @swagger
 * /api/customer/orders/checkout:
 *   post:
 *     summary: Mua ngay (Buy Now)
 *     description: Tạo đơn hàng trực tiếp từ danh sách voucher truyền lên. Yêu cầu JWT Access Token hợp lệ của CUSTOMER.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         schema:
 *           type: string
 *           minLength: 8
 *           maxLength: 128
 *         description: Khoá duy nhất cho một lần checkout; gửi lại cùng khoá sẽ nhận lại đơn cũ.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - qty
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID của voucher
 *                     qty:
 *                       type: integer
 *                       description: Số lượng mua
 *                       default: 1
 *     responses:
 *       201:
 *         description: Tạo đơn hàng thành công
 *       200:
 *         description: Trả lại kết quả đơn hàng đã tạo với cùng Idempotency-Key
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc hết hàng
 *       401:
 *         description: Chưa xác thực
 */
router.post("/checkout", ordersController.buyNow);

/**
 * @swagger
 * /api/customer/orders/cart/checkout:
 *   post:
 *     summary: Thanh toán từ giỏ hàng
 *     description: Tạo đơn hàng tự động bằng cách lấy toàn bộ sản phẩm đang có trong giỏ hàng hiện tại của CUSTOMER, sau đó clear giỏ hàng. Yêu cầu JWT Access Token hợp lệ.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         schema:
 *           type: string
 *           minLength: 8
 *           maxLength: 128
 *         description: Khoá duy nhất cho một lần checkout; gửi lại cùng khoá sẽ nhận lại đơn cũ.
 *     responses:
 *       201:
 *         description: Thanh toán từ giỏ hàng thành công
 *       200:
 *         description: Trả lại kết quả đơn hàng đã tạo với cùng Idempotency-Key
 *       400:
 *         description: Giỏ hàng rỗng hoặc hết hàng
 *       401:
 *         description: Chưa xác thực
 */
router.post("/cart/checkout", ordersController.checkoutFromCart);

export default router;
