import { Router } from "express";
import * as usersController from "./users.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyToken);

router.get("/me", usersController.getMe);
router.put("/me", usersController.updateProfile);
router.post("/me/change-password", usersController.changePassword);

export default router;
