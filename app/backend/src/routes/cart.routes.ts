import { Router } from "express";
import { getCart, putCart, checkoutCart } from "../controllers/cart.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const cartRouter = Router();

cartRouter.use(requireAuth);
cartRouter.get("/:slug", asyncHandler(getCart));
cartRouter.put("/:slug", asyncHandler(putCart));
cartRouter.post("/:slug/checkout", asyncHandler(checkoutCart));
