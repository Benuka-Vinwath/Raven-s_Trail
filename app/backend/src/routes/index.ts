import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { trailsRouter } from "./trails.routes.js";
import { gearShopsRouter } from "./gearShops.routes.js";
import { parkingRouter } from "./parking.routes.js";
import { reviewsRouter } from "./reviews.routes.js";
import { tripsRouter } from "./trips.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.json({ status: "ok" }));

apiRouter.use("/auth", authRouter);
apiRouter.use("/trails", trailsRouter);
apiRouter.use("/gear-shops", gearShopsRouter);
apiRouter.use("/parking", parkingRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/trips", tripsRouter);
