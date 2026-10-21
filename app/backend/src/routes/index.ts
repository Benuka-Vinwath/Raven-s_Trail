import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { trailsRouter } from "./trails.routes.js";
import { gearShopsRouter } from "./gearShops.routes.js";
import { parkingRouter } from "./parking.routes.js";
import { reviewsRouter } from "./reviews.routes.js";
import { budgetRouter } from "./budget.routes.js";
import { chatRouter } from "./chat.routes.js";
import { cartRouter } from "./cart.routes.js";
import { bookingsRouter } from "./bookings.routes.js";
import { tripsRouter } from "./trips.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.json({ status: "ok" }));

apiRouter.use("/auth", authRouter);
apiRouter.use("/trails", trailsRouter);
apiRouter.use("/gear-shops", gearShopsRouter);
apiRouter.use("/parking", parkingRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/trips", tripsRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/bookings", bookingsRouter);
apiRouter.use("/budget", budgetRouter);
apiRouter.use("/chat", chatRouter);
