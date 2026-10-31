import crypto from "node:crypto";
import type { Response } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { ApiError } from "../utils/errors.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { mapBooking, BOOKING_SELECT } from "./bookings.controller.js";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date");

const putCartSchema = z.object({
  startDate: date.nullable().optional(),
  endDate: date.nullable().optional(),
  items: z.array(z.object({ itemId: z.string().uuid(), quantity: z.number().int().min(1).max(20) })).max(40),
});

const checkoutSchema = z.object({
  hikers: z.number().int().min(1).max(50),
  // shops call or message this number about pickup, so it has to be a real one
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{9,20}$/, "Enter a phone number the shops can reach")
    .refine((p) => p.replace(/\D/g, "").length >= 9, "Enter a phone number the shops can reach"),
});

const MAX_RENTAL_DAYS = 30;

async function trailBySlug(slug: string) {
  const { rows } = await pool.query("SELECT id FROM trails WHERE slug = $1", [slug]);
  if (rows.length === 0) throw ApiError.notFound("Trail not found");
  return rows[0].id as string;
}

function colomboToday(): string {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

function daysBetween(start: string, end: string): number {
  return Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;
}

function makeReference(): string {
  // no 0/O/1/I so it can be read out over the phone
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(6);
  return "RT-" + Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export async function getCart(req: AuthedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const trailId = await trailBySlug(req.params.slug);
  const { rows: carts } = await pool.query("SELECT * FROM carts WHERE user_id = $1 AND trail_id = $2", [req.user.id, trailId]);
  if (carts.length === 0) return res.json({ startDate: null, endDate: null, items: [] });
  const { rows: items } = await pool.query("SELECT item_id, quantity FROM cart_items WHERE cart_id = $1", [carts[0].id]);
  res.json({
    startDate: carts[0].start_date,
    endDate: carts[0].end_date,
    items: items.map((i) => ({ itemId: i.item_id, quantity: i.quantity })),
  });
}

export async function putCart(req: AuthedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const trailId = await trailBySlug(req.params.slug);
  const body = putCartSchema.parse(req.body);

  // only items from shops that serve this trail can be in its cart
  if (body.items.length > 0) {
    const { rows } = await pool.query(
      `SELECT DISTINCT si.id FROM shop_items si
       JOIN gear_shop_trails gst ON gst.shop_id = si.shop_id
       WHERE gst.trail_id = $1 AND si.id = ANY($2)`,
      [trailId, body.items.map((i) => i.itemId)]
    );
    if (rows.length !== new Set(body.items.map((i) => i.itemId)).size) {
      throw ApiError.badRequest("Some items aren't available for this trail");
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO carts (user_id, trail_id, start_date, end_date) VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id, trail_id) DO UPDATE SET start_date = $3, end_date = $4, updated_at = now()
       RETURNING id`,
      [req.user.id, trailId, body.startDate ?? null, body.endDate ?? null]
    );
    await client.query("DELETE FROM cart_items WHERE cart_id = $1", [rows[0].id]);
    for (const item of body.items) {
      await client.query("INSERT INTO cart_items (cart_id, item_id, quantity) VALUES ($1,$2,$3) ON CONFLICT (cart_id, item_id) DO UPDATE SET quantity = $3", [
        rows[0].id,
        item.itemId,
        item.quantity,
      ]);
    }
    await client.query("COMMIT");
  } catch (err: any) {
    await client.query("ROLLBACK");
    if (err.code === "22008" || err.code === "22007") throw ApiError.badRequest("That date isn't valid");
    throw err;
  } finally {
    client.release();
  }
  res.status(204).send();
}

export async function checkoutCart(req: AuthedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const trailId = await trailBySlug(req.params.slug);
  const { hikers, phone } = checkoutSchema.parse(req.body);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // lock the cart row so a double-click can't create two bookings from one cart
    const { rows: carts } = await client.query("SELECT * FROM carts WHERE user_id = $1 AND trail_id = $2 FOR UPDATE", [req.user.id, trailId]);
    const cart = carts[0];
    const { rows: lines } = cart
      ? await client.query(
          `SELECT ci.quantity, si.name AS item_name, si.category, si.price_per_day, si.available,
                  gs.name AS shop_name, gs.phone AS shop_phone, gs.address AS shop_address
           FROM cart_items ci
           JOIN shop_items si ON si.id = ci.item_id
           JOIN gear_shops gs ON gs.id = si.shop_id
           WHERE ci.cart_id = $1`,
          [cart.id]
        )
      : { rows: [] as any[] };
    if (lines.length === 0) throw ApiError.badRequest("Your cart is empty");
    if (!cart.start_date || !cart.end_date) throw ApiError.badRequest("Choose your start and end dates first");

    const start: string = cart.start_date;
    const end: string = cart.end_date;
    const days = daysBetween(start, end);
    if (days < 1) throw ApiError.badRequest("The end date must be on or after the start date");
    if (days > MAX_RENTAL_DAYS) throw ApiError.badRequest(`Rentals are limited to ${MAX_RENTAL_DAYS} days`);
    if (start < colomboToday()) throw ApiError.badRequest("The start date can't be in the past");

    // stock is only checked for items where the shop publishes a count (0 means "confirm with the shop")
    for (const l of lines) {
      if (l.available > 0 && l.quantity > l.available) {
        throw ApiError.conflict(`Only ${l.available} × ${l.item_name} available from ${l.shop_name}`);
      }
    }

    // the total is always worked out here from stored prices, never taken from the browser
    const total = lines.reduce((sum, l) => sum + l.price_per_day * l.quantity * days, 0);

    const { rows: trips } = await client.query(
      `INSERT INTO trips (user_id, trail_id, hikers, days, transport, food_per_day, gear_per_day, parking_days, start_date, end_date)
       VALUES ($1,$2,$3,$4,'bus',0,$5,0,$6,$7) RETURNING id`,
      [req.user.id, trailId, hikers, days, Math.round(total / days), start, end]
    );
    const { rows: bookings } = await client.query(
      `INSERT INTO bookings (reference, verify_token, customer_phone, user_id, trip_id, trail_id, start_date, end_date, days, total_lkr)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [makeReference(), crypto.randomBytes(16).toString("hex"), phone, req.user.id, trips[0].id, trailId, start, end, days, total]
    );
    for (const l of lines) {
      await client.query(
        `INSERT INTO booking_items (booking_id, shop_name, shop_phone, shop_address, item_name, category, quantity, unit_price)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [bookings[0].id, l.shop_name, l.shop_phone, l.shop_address, l.item_name, l.category, l.quantity, l.price_per_day]
      );
    }
    await client.query("DELETE FROM carts WHERE id = $1", [cart.id]);
    await client.query("COMMIT");

    const { rows } = await pool.query(`${BOOKING_SELECT} WHERE b.id = $1`, [bookings[0].id]);
    const { rows: items } = await pool.query("SELECT * FROM booking_items WHERE booking_id = $1", [bookings[0].id]);
    res.status(201).json(mapBooking(rows[0], items));
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
