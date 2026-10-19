import { Router } from "express";
import { listGearShops } from "../controllers/gearShops.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const gearShopsRouter = Router();

gearShopsRouter.get("/", asyncHandler(listGearShops));
