import express from "express";
import path from "node:path";
import signupRouter from "./routers/signupRouter.ts";
import type { Request, Response, NextFunction } from "express";

const dirname = path.join(import.meta.dirname, "..");

const app = express();

app.set("views", path.join(dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use("/signup", signupRouter);

app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).send("Something went wrong");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if (err) {
    throw err;
  }
  console.log(`App is running on http://localhost:${PORT}`);
});
