import { Router } from "express";
import * as ordersController from "./orders.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { checkoutRateLimiter } from "../../middlewares/rateLimit.middleware.js";
import { captureIdempotencyKey } from "../../middlewares/idempotency.middleware.js";

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
router.post("/checkout", checkoutRateLimiter, captureIdempotencyKey, ordersController.buyNow);

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
router.post("/cart/checkout", checkoutRateLimiter, captureIdempotencyKey, ordersController.checkoutFromCart);

/**
 * @swagger
 * /api/customer/orders/{orderId}/cancel:
 *   post:
 *     summary: Hủy đơn hàng đang chờ thanh toán
 *     description: Hủy đơn hàng đang ở trạng thái PENDING_PAYMENT và trả lại tồn kho. Yêu cầu JWT Access Token hợp lệ.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hủy thành công
 *       400:
 *         description: Không thể hủy
 *       404:
 *         description: Không tìm thấy
 */
router.post("/:orderId/cancel", ordersController.cancelOrder);

/**
 * @swagger
 * /api/customer/orders/{orderId}/mock-pay:
 *   post:
 *     summary: Giả lập thanh toán thành công (Chỉ dành cho DEV)
 *     description: Mô phỏng việc payOS gọi webhook báo thanh toán thành công.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post("/:orderId/mock-pay", ordersController.mockPayOrder);

/**
 * @swagger
 * /api/customer/orders/{orderId}/sync-payos:
 *   post:
 *     summary: Đồng bộ trạng thái thanh toán từ payOS
 *     description: Lấy trạng thái mới nhất từ payOS bằng API để cập nhật đơn hàng, dùng cho trường hợp webhook không tới được máy.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post("/:orderId/sync-payos", ordersController.syncPayosOrder);

export default router;
