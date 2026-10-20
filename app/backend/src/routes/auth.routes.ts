import { Router } from "express";
import rateLimit from "express-rate-limit";
import { signup, login, me, updateProfile } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRouter = Router();

authRouter.post("/signup", authLimiter, asyncHandler(signup));
authRouter.post("/login", authLimiter, asyncHandler(login));
authRouter.get("/me", requireAuth, asyncHandler(me));
authRouter.patch("/me", requireAuth, asyncHandler(updateProfile));
