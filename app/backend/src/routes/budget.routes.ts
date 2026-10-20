import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createBudgetPlan } from "../controllers/budget.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Keeps one person from burning the shared free AI quota.
const aiLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 15, standardHeaders: true, legacyHeaders: false });

export const budgetRouter = Router();

budgetRouter.post("/plan", requireAuth, aiLimiter, asyncHandler(createBudgetPlan));
