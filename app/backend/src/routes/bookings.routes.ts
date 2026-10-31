import { Router } from "express";
import { listMyBookings, getBooking, cancelBooking, markCollected, markReturned } from "../controllers/bookings.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const bookingsRouter = Router();

bookingsRouter.use(requireAuth);
bookingsRouter.get("/", asyncHandler(listMyBookings));
bookingsRouter.get("/:id", asyncHandler(getBooking));
bookingsRouter.post("/:id/cancel", asyncHandler(cancelBooking));
bookingsRouter.post("/:id/collected", asyncHandler(markCollected));
bookingsRouter.post("/:id/returned", asyncHandler(markReturned));
