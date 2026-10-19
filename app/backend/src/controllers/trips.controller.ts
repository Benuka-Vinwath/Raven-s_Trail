import type { Response } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { ApiError } from "../utils/errors.js";
import type { AuthedRequest } from "../middleware/auth.js";

const createTripSchema = z.object({
  trailSlug: z.string().trim().min(1),
  hikers: z.number().int().min(1).max(50),
  days: z.number().int().min(1).max(60),
  transport: z.enum(["bus", "train", "van", "own"]),
  foodPerDay: z.number().int().min(0),
  gearPerDay: z.number().int().min(0),
  parkingDays: z.number().int().min(0).default(0),
});

function mapTrip(row: any) {
  return {
    id: row.id,
    trailId: row.trail_id,
    trailSlug: row.slug,
    trailName: row.name,
    hikers: row.hikers,
    days: row.days,
    transport: row.transport,
    foodPerDay: row.food_per_day,
    gearPerDay: row.gear_per_day,
    parkingDays: row.parking_days,
    createdAt: row.created_at,
  };
}

export async function createTrip(req: AuthedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const body = createTripSchema.parse(req.body);

  const { rows: trailRows } = await pool.query("SELECT id FROM trails WHERE slug = $1", [body.trailSlug]);
  if (trailRows.length === 0) throw ApiError.notFound("Trail not found");

  const { rows } = await pool.query(
    `INSERT INTO trips (user_id, trail_id, hikers, days, transport, food_per_day, gear_per_day, parking_days)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [req.user.id, trailRows[0].id, body.hikers, body.days, body.transport, body.foodPerDay, body.gearPerDay, body.parkingDays]
  );

  const { rows: joined } = await pool.query(
    `SELECT trips.*, trails.slug, trails.name FROM trips JOIN trails ON trails.id = trips.trail_id WHERE trips.id = $1`,
    [rows[0].id]
  );

  res.status(201).json(mapTrip(joined[0]));
}

export async function listMyTrips(req: AuthedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const { rows } = await pool.query(
    `SELECT trips.*, trails.slug, trails.name FROM trips
     JOIN trails ON trails.id = trips.trail_id
     WHERE trips.user_id = $1
     ORDER BY trips.created_at DESC`,
    [req.user.id]
  );
  res.json(rows.map(mapTrip));
}

export async function deleteTrip(req: AuthedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const { rows } = await pool.query("SELECT user_id FROM trips WHERE id = $1", [req.params.id]);
  if (rows.length === 0) throw ApiError.notFound("Trip not found");
  if (rows[0].user_id !== req.user.id) throw ApiError.forbidden();

  await pool.query("DELETE FROM trips WHERE id = $1", [req.params.id]);
  res.status(204).send();
}
