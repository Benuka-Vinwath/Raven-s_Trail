import type { Response } from "express";
import { pool } from "../db/pool.js";
import { ApiError } from "../utils/errors.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { TODAY_LK } from "./trips.controller.js";

export const BOOKING_SELECT = `
  SELECT b.*, trails.slug AS trail_slug, trails.name AS trail_name,
    CASE
      WHEN b.status = 'cancelled' THEN 'cancelled'
      WHEN ${TODAY_LK} < b.start_date THEN 'upcoming'
      WHEN ${TODAY_LK} <= b.end_date THEN 'ongoing'
      ELSE 'past'
    END AS phase
  FROM bookings b JOIN trails ON trails.id = b.trail_id`;

export function mapBooking(row: any, items: any[]) {
  return {
    id: row.id,
    reference: row.reference,
    tripId: row.trip_id,
    trailSlug: row.trail_slug,
    trailName: row.trail_name,
    status: row.status as "confirmed" | "cancelled",
    phase: row.phase as "upcoming" | "ongoing" | "past" | "cancelled",
    startDate: row.start_date,
    endDate: row.end_date,
    days: row.days,
    totalLkr: row.total_lkr,
    createdAt: row.created_at,
    cancelledAt: row.cancelled_at,
    items: items.map((i) => ({
      shopName: i.shop_name,
      shopPhone: i.shop_phone,
      itemName: i.item_name,
      category: i.category,
      quantity: i.quantity,
      unitPrice: i.unit_price,
      lineTotal: i.unit_price * i.quantity * row.days,
    })),
  };
}

async function itemsFor(bookingIds: string[]) {
  const { rows } = await pool.query("SELECT * FROM booking_items WHERE booking_id = ANY($1) ORDER BY shop_name, item_name", [bookingIds]);
  return rows;
}

export async function listMyBookings(req: AuthedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const { rows } = await pool.query(`${BOOKING_SELECT} WHERE b.user_id = $1 ORDER BY b.start_date DESC, b.created_at DESC`, [req.user.id]);
  const items = await itemsFor(rows.map((r) => r.id));
  res.json(rows.map((r) => mapBooking(r, items.filter((i) => i.booking_id === r.id))));
}

export async function getBooking(req: AuthedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) throw ApiError.notFound("Booking not found");
  const { rows } = await pool.query(`${BOOKING_SELECT} WHERE b.id = $1 AND b.user_id = $2`, [req.params.id, req.user.id]);
  if (rows.length === 0) throw ApiError.notFound("Booking not found");
  res.json(mapBooking(rows[0], await itemsFor([rows[0].id])));
}

export async function cancelBooking(req: AuthedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) throw ApiError.notFound("Booking not found");
  const { rows } = await pool.query(`${BOOKING_SELECT} WHERE b.id = $1 AND b.user_id = $2`, [req.params.id, req.user.id]);
  if (rows.length === 0) throw ApiError.notFound("Booking not found");
  if (rows[0].status === "cancelled") throw ApiError.conflict("This booking is already cancelled");
  if (rows[0].phase !== "upcoming") throw ApiError.conflict("Only bookings that haven't started can be cancelled");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE bookings SET status = 'cancelled', cancelled_at = now() WHERE id = $1", [rows[0].id]);
    await client.query("UPDATE trips SET status = 'cancelled' WHERE id = $1", [rows[0].trip_id]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  const { rows: updated } = await pool.query(`${BOOKING_SELECT} WHERE b.id = $1`, [rows[0].id]);
  res.json(mapBooking(updated[0], await itemsFor([rows[0].id])));
}
