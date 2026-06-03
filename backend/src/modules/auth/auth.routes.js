import { Router } from "express";
import * as authController from "./auth.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { ROLES } from "../../constants/roles.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", verifyToken, authController.getMe);
router.post("/logout", authController.logout);

// Route test cho Role Guard
router.get("/admin-only", verifyToken, requireRole(ROLES.ADMIN), (req, res) => {
  res.json({ success: true, message: "Welcome Admin" });
});

export default router;
