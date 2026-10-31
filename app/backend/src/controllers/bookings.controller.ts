import type { Response } from "express";
import { pool } from "../db/pool.js";
import { ApiError } from "../utils/errors.js";
import { shopSignature } from "../utils/voucher.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { TODAY_LK } from "./trips.controller.js";

// phase is worked out each time: collecting the gear or returning it overrides what the dates say
export const BOOKING_SELECT = `
  SELECT b.*, trails.slug AS trail_slug, trails.name AS trail_name, users.name AS customer_name,
    CASE
      WHEN b.status = 'cancelled' THEN 'cancelled'
      WHEN b.returned_at IS NOT NULL THEN 'past'
      WHEN b.picked_up_at IS NOT NULL THEN 'ongoing'
      WHEN ${TODAY_LK} < b.start_date THEN 'upcoming'
      WHEN ${TODAY_LK} <= b.end_date THEN 'ongoing'
      ELSE 'past'
    END AS phase
  FROM bookings b
  JOIN trails ON trails.id = b.trail_id
  JOIN users ON users.id = b.user_id`;

export function mapBooking(row: any, items: any[]) {
  const mapped = items.map((i) => ({
    shopName: i.shop_name,
    shopPhone: i.shop_phone,
    shopAddress: i.shop_address,
    itemName: i.item_name,
    category: i.category,
    quantity: i.quantity,
    unitPrice: i.unit_price,
    lineTotal: i.unit_price * i.quantity * row.days,
  }));

  // one entry per shop: its voucher link signature and what the customer owes that shop
  const shops = [...new Set(mapped.map((i) => i.shopName))].map((name) => {
    const mine = mapped.filter((i) => i.shopName === name);
    return {
      name,
      phone: mine[0].shopPhone as string | null,
      address: mine[0].shopAddress as string | null,
      signature: shopSignature(row.verify_token, name),
      subtotal: mine.reduce((sum, i) => sum + i.lineTotal, 0),
    };
  });

  return {
    id: row.id,
    reference: row.reference,
    verifyToken: row.verify_token,
    tripId: row.trip_id,
    trailSlug: row.trail_slug,
    trailName: row.trail_name,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    status: row.status as "confirmed" | "cancelled",
    phase: row.phase as "upcoming" | "ongoing" | "past" | "cancelled",
    startDate: row.start_date,
    endDate: row.end_date,
    days: row.days,
    totalLkr: row.total_lkr,
    createdAt: row.created_at,
    cancelledAt: row.cancelled_at,
    pickedUpAt: row.picked_up_at,
    returnedAt: row.returned_at,
    items: mapped,
    shops,
  };
}

async function itemsFor(bookingIds: string[]) {
  const { rows } = await pool.query("SELECT * FROM booking_items WHERE booking_id = ANY($1) ORDER BY shop_name, item_name", [bookingIds]);
  return rows;
}

const UUID = /^[0-9a-f-]{36}$/i;

async function loadOwn(req: AuthedRequest) {
  if (!req.user) throw ApiError.unauthorized();
  if (!UUID.test(req.params.id)) throw ApiError.notFound("Booking not found");
  const { rows } = await pool.query(`${BOOKING_SELECT} WHERE b.id = $1 AND b.user_id = $2`, [req.params.id, req.user.id]);
  if (rows.length === 0) throw ApiError.notFound("Booking not found");
  return rows[0];
}

async function respond(res: Response, id: string) {
  const { rows } = await pool.query(`${BOOKING_SELECT} WHERE b.id = $1`, [id]);
  res.json(mapBooking(rows[0], await itemsFor([id])));
}

export async function listMyBookings(req: AuthedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const { rows } = await pool.query(`${BOOKING_SELECT} WHERE b.user_id = $1 ORDER BY b.start_date DESC, b.created_at DESC`, [req.user.id]);
  const items = await itemsFor(rows.map((r) => r.id));
  res.json(rows.map((r) => mapBooking(r, items.filter((i) => i.booking_id === r.id))));
}

export async function getBooking(req: AuthedRequest, res: Response) {
  const row = await loadOwn(req);
  res.json(mapBooking(row, await itemsFor([row.id])));
}

export async function cancelBooking(req: AuthedRequest, res: Response) {
  const row = await loadOwn(req);
  if (row.status === "cancelled") throw ApiError.conflict("This booking is already cancelled");
  if (row.phase !== "upcoming") throw ApiError.conflict("Only bookings that haven't started can be cancelled");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE bookings SET status = 'cancelled', cancelled_at = now() WHERE id = $1", [row.id]);
    await client.query("UPDATE trips SET status = 'cancelled' WHERE id = $1", [row.trip_id]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
  await respond(res, row.id);
}

// the customer records that the gear is in their hands...
export async function markCollected(req: AuthedRequest, res: Response) {
  const row = await loadOwn(req);
  if (row.status === "cancelled") throw ApiError.conflict("This booking was cancelled");
  if (row.picked_up_at) throw ApiError.conflict("You've already marked this as collected");
  await pool.query("UPDATE bookings SET picked_up_at = now() WHERE id = $1", [row.id]);
  await respond(res, row.id);
}

// ...and later that it's back with the shop
export async function markReturned(req: AuthedRequest, res: Response) {
  const row = await loadOwn(req);
  if (row.status === "cancelled") throw ApiError.conflict("This booking was cancelled");
  if (!row.picked_up_at) throw ApiError.conflict("Mark the gear as collected first");
  if (row.returned_at) throw ApiError.conflict("You've already marked this as returned");
  await pool.query("UPDATE bookings SET returned_at = now() WHERE id = $1", [row.id]);
  await respond(res, row.id);
}
