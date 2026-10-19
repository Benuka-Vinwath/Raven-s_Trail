import { Router } from "express";
import { listParking } from "../controllers/parking.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const parkingRouter = Router();

parkingRouter.get("/", asyncHandler(listParking));
