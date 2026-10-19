import { Router } from "express";
import { listRecentReviews } from "../controllers/reviews.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const reviewsRouter = Router();

reviewsRouter.get("/", asyncHandler(listRecentReviews));
