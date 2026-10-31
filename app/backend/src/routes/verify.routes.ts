import { Router } from "express";
import rateLimit from "express-rate-limit";
import { verifyBooking } from "../controllers/verify.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// public endpoint, so it is rate limited against anyone trying tokens at random
const verifyLimiter = rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false });

export const verifyRouter = Router();
verifyRouter.get("/:token", verifyLimiter, asyncHandler(verifyBooking));
