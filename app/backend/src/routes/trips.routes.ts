import { Router } from "express";
import { createTrip, listMyTrips, deleteTrip } from "../controllers/trips.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const tripsRouter = Router();

tripsRouter.use(requireAuth);
tripsRouter.get("/", asyncHandler(listMyTrips));
tripsRouter.post("/", asyncHandler(createTrip));
tripsRouter.delete("/:id", asyncHandler(deleteTrip));
