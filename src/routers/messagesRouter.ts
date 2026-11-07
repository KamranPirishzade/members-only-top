import { Router } from "express";
import { getMessages } from "../db/queries.ts";

const messageRouter = Router();

messageRouter.get("/", async (req, res) => {
  const messages = await getMessages();
  res.render("index", { messages });
});

export default messageRouter;
