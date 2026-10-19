import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env, isProd } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(isProd ? "combined" : "dev"));

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
