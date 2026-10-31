import type { Request, Response } from "express";
import { pool } from "../db/pool.js";
import { ApiError } from "../utils/errors.js";
import { validShopSignature } from "../utils/voucher.js";
import { BOOKING_SELECT } from "./bookings.controller.js";

// Public (no login): a shop owner scans the QR code on a customer's voucher and lands here.
// It returns only what the shop needs to hand over gear: no email, only the end of the phone number,
// and, on a per-shop link, only that shop's items.
export async function verifyBooking(req: Request, res: Response) {
  const token = req.params.token;
  if (!/^[0-9a-f]{32}$/.test(token)) throw ApiError.notFound("This voucher isn't valid");

  const shop = typeof req.query.shop === "string" ? req.query.shop : undefined;
  const sig = typeof req.query.s === "string" ? req.query.s : "";
  if (shop !== undefined && !validShopSignature(token, shop, sig)) throw ApiError.forbidden("This voucher link has been altered");

  const { rows } = await pool.query(`${BOOKING_SELECT} WHERE b.verify_token = $1`, [token]);
  if (rows.length === 0) throw ApiError.notFound("This voucher isn't valid");
  const b = rows[0];

  const { rows: allItems } = await pool.query("SELECT * FROM booking_items WHERE booking_id = $1 ORDER BY item_name", [b.id]);
  const items = (shop === undefined ? allItems : allItems.filter((i) => i.shop_name === shop)).map((i) => ({
    shopName: i.shop_name,
    itemName: i.item_name,
    quantity: i.quantity,
    unitPrice: i.unit_price,
    lineTotal: i.unit_price * i.quantity * b.days,
  }));
  if (shop !== undefined && items.length === 0) throw ApiError.notFound("This voucher isn't valid");

  // one word for the shop to act on
  const stage = b.status === "cancelled" ? "cancelled" : b.returned_at ? "returned" : b.picked_up_at ? "collected" : "ready";
  const phone: string = b.customer_phone ?? "";

  res.json({
    reference: b.reference,
    stage,
    expired: stage === "ready" && b.phase === "past", // the dates have passed and the gear was never collected
    notStartedYet: stage === "ready" && b.phase === "upcoming",
    customerFirstName: String(b.customer_name).split(" ")[0],
    phoneEnding: phone.replace(/\D/g, "").slice(-3) || null,
    trailName: b.trail_name,
    startDate: b.start_date,
    endDate: b.end_date,
    days: b.days,
    scope: shop === undefined ? "all" : "shop",
    shopName: shop ?? null,
    items,
    total: items.reduce((sum, i) => sum + i.lineTotal, 0),
    pickedUpAt: b.picked_up_at,
    returnedAt: b.returned_at,
    cancelledAt: b.cancelled_at,
  });
}
