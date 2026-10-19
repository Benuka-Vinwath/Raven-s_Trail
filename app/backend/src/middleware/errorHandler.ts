import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/errors.js";
import { isProd } from "../config/env.js";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Validation failed", details: err.flatten() });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error", details: isProd ? undefined : String(err) });
}
