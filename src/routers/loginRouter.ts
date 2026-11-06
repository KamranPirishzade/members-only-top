import { Router } from "express";
import authController from "../controllers/authController.ts";
import passport from "passport";

const loginRouter = Router();

loginRouter.get("/", authController.getLoginPage);
loginRouter.post(
  "/",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureMessage: true,
  }),
);

export default loginRouter;
