import { Router } from "express";
import authController from "../controllers/authController.ts";

const authRouter = Router();

authRouter.get("/", authController.getSignupPage);
authRouter.post(
  "/",
  authController.signupValidationRules,
  authController.postSignup,
);

export default authRouter;
