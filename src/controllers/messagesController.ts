import type { Request, Response } from "express";
import { getMessages, createMessage } from "../db/queries.ts";
import { body, validationResult, matchedData } from "express-validator";

const newMessageValidationRules = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ max: 1000 })
    .withMessage("Content must be at most 1000 characters"),
];

async function getMessagesPage(req: Request, res: Response) {
  const messages = await getMessages();
  res.render("index", { messages: messages });
}
function getNewMessagePage(req: Request, res: Response) {
  res.render("newMessage", { errors: [], data: {} });
}

async function postNewMessage(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).render("newMessage", {
      errors: errors.array(),
      data: req.body,
    });
    return;
  }
  const { title, content } = matchedData(req);
  await createMessage({ userId: req.user!.id, title, content });
  res.redirect("/");
}

export default {
  getMessagesPage,
  getNewMessagePage,
  postNewMessage,
  newMessageValidationRules,
};
