import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/errors.js";

export interface AuthedRequest extends Request {
  user?: { id: string; email: string };
}

export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Missing bearer token"));
  }

  try {
    const payload = verifyToken(header.slice("Bearer ".length));
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = verifyToken(header.slice("Bearer ".length));
      req.user = { id: payload.sub, email: payload.email };
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}
