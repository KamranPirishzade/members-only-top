import { Router } from "express";
import authController from "../controllers/authController.ts";
import membershipController from "../controllers/membershipController.ts";

const membershipRouter = Router();

membershipRouter.use(authController.requireLogin);

membershipRouter.get("/join", membershipController.getMembershipPage);
membershipRouter.post(
  "/join",
  membershipController.membershipValidationRules,
  membershipController.postMembership,
);

membershipRouter.get("/admin", membershipController.getAdminPage);
membershipRouter.post(
  "/admin",
  membershipController.membershipValidationRules,
  membershipController.postAdmin,
);

export default membershipRouter;
