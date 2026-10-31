import crypto from "node:crypto";
import { env } from "../config/env.js";

// A per-shop voucher link is the booking's secret token plus a signature over (token, shop name).
// The signature means a shop can only be shown its own items, and nobody can edit "shop=" in the link to peek at another shop's.
export function shopSignature(token: string, shopName: string): string {
  return crypto.createHmac("sha256", env.jwtSecret).update(`${token}|${shopName}`).digest("hex").slice(0, 24);
}

export function validShopSignature(token: string, shopName: string, signature: string): boolean {
  const expected = Buffer.from(shopSignature(token, shopName));
  const given = Buffer.from(signature);
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}
