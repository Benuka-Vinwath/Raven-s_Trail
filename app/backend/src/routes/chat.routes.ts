import { Router } from "express";
import rateLimit from "express-rate-limit";
import { chat } from "../controllers/chat.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// logged-in users only; the limit protects the shared free quota
const chatLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false });

export const chatRouter = Router();
chatRouter.post("/", requireAuth, chatLimiter, asyncHandler(chat));