import type { Request, Response } from "express";
import { body, validationResult, matchedData } from "express-validator";
import { updateUserRole } from "../db/queries.ts";

const membershipValidationRules = [
  body("password").trim().notEmpty().withMessage("Membership code is required"),
];

function getMembershipPage(req: Request, res: Response) {
  res.render("membership", { title: "Member", errors: [], data: {} });
}

async function postMembership(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).render("membership", {
      title: "Member",
      errors: errors.array(),
      data: matchedData(req),
    });
    return;
  }
  const { password } = matchedData(req);
  if (password === process.env.MEMBERSHIP_CODE) {
    if (req.user?.role === "admin") {
      return res.status(403).render("membership", {
        title: "Member",
        errors: [
          { msg: "You are already an admin and cannot become a member." },
        ],
        data: matchedData(req),
      });
    }
    await updateUserRole({ userId: req.user!.id, role: "member" });
    res.redirect("/");
  } else {
    res.status(400).render("membership", {
      title: "Member",
      errors: [{ msg: "Invalid membership code" }],
      data: matchedData(req),
    });
  }
}

function getAdminPage(req: Request, res: Response) {
  res.render("membership", { title: "Admin", errors: [], data: {} });
}

async function postAdmin(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).render("membership", {
      title: "Admin",
      errors: errors.array(),
      data: matchedData(req),
    });
    return;
  }
  const { password } = matchedData(req);
  if (password === process.env.ADMIN_CODE) {
    await updateUserRole({ userId: req.user!.id, role: "admin" });
    res.redirect("/");
  } else {
    res.status(400).render("membership", {
      title: "Admin",
      errors: [{ msg: "Invalid admin code" }],
      data: matchedData(req),
    });
  }
}

export default {
  getMembershipPage,
  getAdminPage,
  postMembership,
  postAdmin,
  membershipValidationRules,
};
