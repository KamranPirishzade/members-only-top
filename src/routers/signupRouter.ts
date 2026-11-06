import { Router } from "express";
import authController from "../controllers/authController.ts";

const signupRouter = Router();

signupRouter.get("/", authController.getSignupPage);
signupRouter.post(
  "/",
  authController.signupValidationRules,
  authController.postSignup,
);

export default signupRouter;
