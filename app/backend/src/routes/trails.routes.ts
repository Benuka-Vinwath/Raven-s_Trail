import { Router } from "express";
import { listTrails, getTrailBySlug } from "../controllers/trails.controller.js";
import { listReviewsForTrail, createReviewForTrail } from "../controllers/reviews.controller.js";
import { getKit } from "../controllers/kit.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const trailsRouter = Router();

trailsRouter.get("/", asyncHandler(listTrails));
trailsRouter.get("/:slug", asyncHandler(getTrailBySlug));
trailsRouter.get("/:slug/kit", asyncHandler(getKit));
trailsRouter.get("/:slug/reviews", asyncHandler(listReviewsForTrail));
trailsRouter.post("/:slug/reviews", requireAuth, asyncHandler(createReviewForTrail));
