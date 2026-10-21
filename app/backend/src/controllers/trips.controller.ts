import type { Response } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { ApiError } from "../utils/errors.js";
import type { AuthedRequest } from "../middleware/auth.js";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date");

const createTripSchema = z.object({
  trailSlug: z.string().trim().min(1),
  hikers: z.number().int().min(1).max(50),
  days: z.number().int().min(1).max(60),
  transport: z.enum(["bus", "train", "van", "own"]),
  foodPerDay: z.number().int().min(0),
  gearPerDay: z.number().int().min(0),
  parkingDays: z.number().int().min(0).default(0),
  // optional so a plan can start undated; a past date is how someone logs a hike they already did
  startDate: date.optional(),
  notes: z.string().trim().max(500).optional(),
});

// "today" in Sri Lanka, so a trip flips from upcoming to ongoing at local midnight, not UTC
export const TODAY_LK = "(now() AT TIME ZONE 'Asia/Colombo')::date";

// upcoming / ongoing / past are worked out from the dates each time, so they can't go stale
export const TRIP_SELECT = `
  SELECT trips.*, trails.slug, trails.name, trails.distance_km, trails.elevation_gain_m,
    CASE
      WHEN trips.status = 'cancelled' THEN 'cancelled'
      WHEN trips.start_date IS NULL THEN 'planning'
      WHEN ${TODAY_LK} < trips.start_date THEN 'upcoming'
      WHEN ${TODAY_LK} <= trips.end_date THEN 'ongoing'
      ELSE 'past'
    END AS phase,
    b.id AS booking_id, b.reference AS booking_reference, b.status AS booking_status, b.total_lkr AS booking_total
  FROM trips
  JOIN trails ON trails.id = trips.trail_id
  LEFT JOIN LATERAL (
    SELECT id, reference, status, total_lkr FROM bookings WHERE trip_id = trips.id ORDER BY created_at DESC LIMIT 1
  ) b ON true`;

export function mapTrip(row: any) {
  return {
    id: row.id,
    trailId: row.trail_id,
    trailSlug: row.slug,
    trailName: row.name,
    distanceKm: Number(row.distance_km),
    elevationGainM: row.elevation_gain_m,
    hikers: row.hikers,
    days: row.days,
    transport: row.transport,
    foodPerDay: row.food_per_day,
    gearPerDay: row.gear_per_day,
    parkingDays: row.parking_days,
    startDate: row.start_date,
    endDate: row.end_date,
    phase: row.phase as "planning" | "upcoming" | "ongoing" | "past" | "cancelled",
    notes: row.notes,
    createdAt: row.created_at,
    booking: row.booking_id
      ? { id: row.booking_id, reference: row.booking_reference, status: row.booking_status, totalLkr: row.booking_total }
      : null,
  };
}

export async function createTrip(req: AuthedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const body = createTripSchema.parse(req.body);

  const { rows: trailRows } = await pool.query("SELECT id FROM trails WHERE slug = $1", [body.trailSlug]);
  if (trailRows.length === 0) throw ApiError.notFound("Trail not found");

  let created;
  try {
    ({ rows: created } = await pool.query(
      `INSERT INTO trips (user_id, trail_id, hikers, days, transport, food_per_day, gear_per_day, parking_days, start_date, end_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::date,$9::date + ($4::int - 1),$10) RETURNING id`,
      [req.user.id, trailRows[0].id, body.hikers, body.days, body.transport, body.foodPerDay, body.gearPerDay, body.parkingDays, body.startDate ?? null, body.notes ?? null]
    ));
  } catch (err: any) {
    if (err.code === "22008" || err.code === "22007") throw ApiError.badRequest("That date isn't valid");
    throw err;
  }

  const { rows } = await pool.query(`${TRIP_SELECT} WHERE trips.id = $1`, [created[0].id]);
  res.status(201).json(mapTrip(rows[0]));
}

export async function listMyTrips(req: AuthedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const { rows } = await pool.query(
    `${TRIP_SELECT} WHERE trips.user_id = $1 ORDER BY trips.start_date DESC NULLS FIRST, trips.created_at DESC`,
    [req.user.id]
  );
  res.json(rows.map(mapTrip));
}

export async function deleteTrip(req: AuthedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const { rows } = await pool.query(
    `SELECT trips.user_id, EXISTS (SELECT 1 FROM bookings WHERE trip_id = trips.id) AS has_booking
     FROM trips WHERE id = $1`,
    [req.params.id]
  );
  if (rows.length === 0) throw ApiError.notFound("Trip not found");
  if (rows[0].user_id !== req.user.id) throw ApiError.forbidden();
  // trips with a booking are part of the customer's history, so they are cancelled via the booking, never deleted
  if (rows[0].has_booking) throw ApiError.conflict("This trip has a booking. Cancel the booking instead of deleting the trip.");

  await pool.query("DELETE FROM trips WHERE id = $1", [req.params.id]);
  res.status(204).send();
}
