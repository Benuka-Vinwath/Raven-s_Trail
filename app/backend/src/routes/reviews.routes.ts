import { Router } from "express";
import { listMyReviews, listRecentReviews } from "../controllers/reviews.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const reviewsRouter = Router();

reviewsRouter.get("/", asyncHandler(listRecentReviews));
reviewsRouter.get("/mine", requireAuth, asyncHandler(listMyReviews));
