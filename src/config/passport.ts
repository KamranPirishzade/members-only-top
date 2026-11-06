import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { getUserByUsername, getUserById } from "../db/queries.ts";
import bcrypt from "bcryptjs";

declare module "express-session" {
  interface SessionData {
    messages?: string[];
  }
}

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await getUserByUsername(username);
      if (!user)
        return done(null, false, { message: "Incorrect username or password" });

      const matched = await bcrypt.compare(password, user.password_hash);
      if (!matched)
        return done(null, false, { message: "Incorrect username or password" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await getUserById(id);
    done(null, user ?? false);
  } catch (err) {
    done(err);
  }
});
