import { Router } from "express";
import rateLimit from "express-rate-limit";
import { chat } from "../controllers/chat.controller.js";
import { optionalAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// guests can chat too, so the limit is the protection for the shared free quota
const chatLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false });

export const chatRouter = Router();
chatRouter.post("/", optionalAuth, chatLimiter, asyncHandler(chat));