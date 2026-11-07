import { Router } from "express";
import messageController from "../controllers/messagesController.ts";
import authController from "../controllers/authController.ts";

const messageRouter = Router();

messageRouter.get("/", messageController.getMessagesPage);

messageRouter.get(
  "/messages/new",
  authController.requireLogin,
  messageController.getNewMessagePage,
);

messageRouter.post(
  "/messages/new",
  authController.requireLogin,
  messageController.newMessageValidationRules,
  messageController.postNewMessage,
);


export default messageRouter;
