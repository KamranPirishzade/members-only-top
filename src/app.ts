import express from "express";
import path from "node:path";
import signupRouter from "./routers/signupRouter.ts";
import loginRouter from "./routers/loginRouter.ts";
import messageRouter from "./routers/messagesRouter.ts";
import type { Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pool from "./db/pool.ts";
import passport from "passport";
import "./config/passport.ts";

const PgSession = connectPgSimple(session);

const dirname = path.join(import.meta.dirname, "..");

const app = express();

app.set("views", path.join(dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  }),
);
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.canSeeAuthors =
    req.user && (req.user.role === "member" || req.user.role === "admin");
  next();
});

app.use("/", messageRouter);
app.use("/signup", signupRouter);
app.use("/login", loginRouter);
app.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

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
