import type { Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { ApiError } from "../utils/errors.js";
import { signToken } from "../utils/jwt.js";
import type { AuthedRequest } from "../middleware/auth.js";

const signupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(200),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

function mapUser(row: any) {
  return { id: row.id, name: row.name, email: row.email, createdAt: row.created_at };
}

export async function signup(req: AuthedRequest, res: Response) {
  const body = signupSchema.parse(req.body);

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [body.email]);
  if (existing.rows.length > 0) throw ApiError.conflict("An account with this email already exists");

  const passwordHash = await bcrypt.hash(body.password, 10);
  const { rows } = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING *",
    [body.name, body.email, passwordHash]
  );

  const user = rows[0];
  const token = signToken({ sub: user.id, email: user.email });
  res.status(201).json({ user: mapUser(user), token });
}

export async function login(req: AuthedRequest, res: Response) {
  const body = loginSchema.parse(req.body);

  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [body.email]);
  const user = rows[0];
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const valid = await bcrypt.compare(body.password, user.password_hash);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  const token = signToken({ sub: user.id, email: user.email });
  res.json({ user: mapUser(user), token });
}

export async function me(req: AuthedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
  if (rows.length === 0) throw ApiError.notFound("User not found");
  res.json(mapUser(rows[0]));
}
