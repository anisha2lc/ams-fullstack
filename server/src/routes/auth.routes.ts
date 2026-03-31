import { Router } from "express";
import AuthController from "../controller/auth.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validateRequest";
import {
  userLoginSchema,
  userRegistrationSchema,
} from "../schemas/auth.schemas";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  validateRequest(userRegistrationSchema),
  authController.register,
);
router.post("/login", validateRequest(userLoginSchema), authController.login);

router.post("/refresh", authController.refresh);

router.get("/me", verifyJWT, authController.getCurrentUser);

export default router;
