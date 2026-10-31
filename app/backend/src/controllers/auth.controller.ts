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

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8).max(200).optional(),
    // null removes the photo
    avatarUrl: z
      .string()
      .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/, "Invalid image")
      .max(300_000, "Image is too large")
      .nullable()
      .optional(),
    // "" clears it; shops call or message this number about pickup, so it has to look real
    phone: z
      .string()
      .trim()
      .refine((p) => p === "" || (/^\+?[0-9 ()-]{9,20}$/.test(p) && p.replace(/\D/g, "").length >= 9), "Enter a phone number the shops can reach")
      .optional(),
  })
  .refine((b) => b.name || b.email || b.newPassword || b.avatarUrl !== undefined || b.phone !== undefined, { message: "Nothing to update" });

function mapUser(row: any) {
  return { id: row.id, name: row.name, email: row.email, phone: row.phone ?? null, createdAt: row.created_at, avatarUrl: row.avatar_url ?? null };
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

export async function updateProfile(req: AuthedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const body = updateProfileSchema.parse(req.body);

  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
  const user = rows[0];
  if (!user) throw ApiError.notFound("User not found");

  const emailChanged = body.email !== undefined && body.email !== user.email;
  if (emailChanged || body.newPassword) {
    const ok = body.currentPassword && (await bcrypt.compare(body.currentPassword, user.password_hash));
    if (!ok) throw ApiError.forbidden("Current password is incorrect");
  }
  if (emailChanged) {
    const taken = await pool.query("SELECT id FROM users WHERE email = $1 AND id <> $2", [body.email, user.id]);
    if (taken.rows.length > 0) throw ApiError.conflict("An account with this email already exists");
  }

  const name = body.name ?? user.name;
  const email = body.email ?? user.email;
  const passwordHash = body.newPassword ? await bcrypt.hash(body.newPassword, 10) : user.password_hash;
  const avatarUrl = body.avatarUrl === undefined ? user.avatar_url : body.avatarUrl;
  const phone = body.phone === undefined ? user.phone : body.phone || null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const updated = await client.query(
      "UPDATE users SET name = $1, email = $2, password_hash = $3, avatar_url = $4, phone = $5 WHERE id = $6 RETURNING *",
      [name, email, passwordHash, avatarUrl, phone, user.id]
    );
    // reviews store the author name as text, so keep it in step with the profile
    await client.query("UPDATE reviews SET author = $1 WHERE user_id = $2", [name, user.id]);
    await client.query("COMMIT");
    res.json(mapUser(updated.rows[0]));
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
