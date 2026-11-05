import type { Request, Response } from "express";
import { body, validationResult, matchedData } from "express-validator";
import { createUser } from "../db/queries.ts";
import { isUniqueViolationError } from "../utils.ts";
import bcrypt from "bcryptjs";

const signupValidationRules = [
  body("username")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Username is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password is required and must be at least 8 characters long"),
  body("confirmPassword")
    .isLength({ min: 1 })
    .withMessage("Confirm Password is required")
    .bail()
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  body("name").trim().isLength({ min: 1 }).withMessage("Name is required"),
  body("surname")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Surname is required"),
];

function getSignupPage(req: Request, res: Response) {
  res.render("signup", { title: "Sign Up", errors: [], data: {} });
}

async function postSignup(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).render("signup", {
      title: "Sign Up",
      errors: errors.array(),
      data: matchedData(req),
    });
    return;
  }
  const { username, password, name, surname } = matchedData(req);
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    await createUser({ username, passwordHash, name, surname });
  } catch (error) {
    if (isUniqueViolationError(error)) {
      res.status(400).render("signup", {
        title: "Sign Up",
        errors: [{ msg: "Username already exists" }],
        data: matchedData(req),
      });
      return;
    }
    throw error;
  }
  res.redirect("/log-in");
}

export default { getSignupPage, postSignup, signupValidationRules };
