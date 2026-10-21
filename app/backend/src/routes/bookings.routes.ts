import { Router } from "express";
import { listMyBookings, getBooking, cancelBooking } from "../controllers/bookings.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const bookingsRouter = Router();

bookingsRouter.use(requireAuth);
bookingsRouter.get("/", asyncHandler(listMyBookings));
bookingsRouter.get("/:id", asyncHandler(getBooking));
bookingsRouter.post("/:id/cancel", asyncHandler(cancelBooking));
