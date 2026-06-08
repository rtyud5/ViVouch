import { Router } from "express";
import * as cartController from "./cart.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = Router();

// Áp dụng verifyToken cho tất cả các endpoint của giỏ hàng
router.use(verifyToken);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Lấy chi tiết giỏ hàng của người dùng hiện tại
 *     description: Trả về chi tiết giỏ hàng và danh sách các voucher đang có cùng với các số liệu cartTotal được tính toán tự động. Yêu cầu JWT Access Token hợp lệ.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin giỏ hàng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Lấy thông tin giỏ hàng thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: cart-uuid-123456
 *                     userId:
 *                       type: string
 *                       example: user-uuid-999999
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: cart-item-uuid-001
 *                           cartId:
 *                             type: string
 *                             example: cart-uuid-123456
 *                           voucherId:
 *                             type: string
 *                             example: e9f735f1-39c4-4e31-8db2-df66b72a6b25
 *                           qty:
 *                             type: integer
 *                             example: 2
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2026-06-08T10:16:52.000Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2026-06-08T10:16:52.000Z"
 *                           voucher:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: e9f735f1-39c4-4e31-8db2-df66b72a6b25
 *                               title:
 *                                 type: string
 *                                 example: Highlands Coffee Voucher 50k
 *                               imageUrl:
 *                                 type: string
 *                                 example: https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500
 *                               originalPrice:
 *                                 type: number
 *                                 example: 50000
 *                               salePrice:
 *                                 type: number
 *                                 example: 40000
 *                               status:
 *                                 type: string
 *                                 example: ON_SALE
 *                     cartTotal:
 *                       type: object
 *                       properties:
 *                         totalUniqueItems:
 *                           type: integer
 *                           example: 2
 *                         totalQty:
 *                           type: integer
 *                           example: 3
 *                         totalOriginalAmount:
 *                           type: number
 *                           example: 200000
 *                         totalAmount:
 *                           type: number
 *                           example: 170000
 *                         totalSavings:
 *                           type: number
 *                           example: 30000
 *       401:
 *         description: Chưa xác thực, token không hợp lệ hoặc hết hạn
 *       500:
 *         description: Lỗi hệ thống nội bộ
 */
router.get("/", cartController.getCart);

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Thêm voucher vào giỏ hàng
 *     description: Cho phép thêm voucher vào giỏ hàng. Nếu voucher đã tồn tại trong giỏ thì số lượng sẽ được cộng dồn. Yêu cầu JWT Access Token hợp lệ.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - voucherId
 *             properties:
 *               voucherId:
 *                 type: string
 *                 format: uuid
 *                 example: d2e3f4a5-6789-0abc-def1-234567890abc
 *                 description: ID của voucher muốn thêm
 *               qty:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 example: 1
 *                 description: Số lượng muốn thêm
 *     responses:
 *       200:
 *         description: Thêm voucher vào giỏ hàng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Thêm voucher vào giỏ hàng thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     cartTotal:
 *                       type: object
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       401:
 *         description: Chưa xác thực
 */
router.post("/items", cartController.addItem);

/**
 * @swagger
 * /api/cart/items/{id}:
 *   put:
 *     summary: Cập nhật số lượng của voucher trong giỏ hàng
 *     description: Cập nhật trực tiếp số lượng của một dòng sản phẩm trong giỏ hàng. Yêu cầu JWT Access Token hợp lệ.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của dòng sản phẩm trong giỏ hàng (cartItemId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qty
 *             properties:
 *               qty:
 *                 type: integer
 *                 minimum: 1
 *                 example: 5
 *                 description: Số lượng mới của sản phẩm
 *     responses:
 *       200:
 *         description: Cập nhật số lượng thành công
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ hoặc số lượng nhỏ hơn 1
 *       401:
 *         description: Chưa xác thực
 *       404:
 *         description: Không tìm thấy sản phẩm trong giỏ hàng
 */
router.put("/items/:id", cartController.updateQty);

/**
 * @swagger
 * /api/cart/items/{id}:
 *   delete:
 *     summary: Xóa voucher khỏi giỏ hàng
 *     description: Xóa hoàn toàn một dòng sản phẩm ra khỏi giỏ hàng. Yêu cầu JWT Access Token hợp lệ.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của dòng sản phẩm trong giỏ hàng (cartItemId)
 *     responses:
 *       200:
 *         description: Xóa voucher khỏi giỏ hàng thành công
 *       401:
 *         description: Chưa xác thực
 *       404:
 *         description: Không tìm thấy sản phẩm trong giỏ hàng
 */
router.delete("/items/:id", cartController.removeItem);

export default router;
