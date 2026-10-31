import type { Request, Response } from "express";
import { pool } from "../db/pool.js";

function mapItem(row: any) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    pricePerDay: row.price_per_day,
    available: row.available,
    description: row.description,
    gearType: row.gear_type,
    size: row.size,
  };
}

export async function listGearShops(req: Request, res: Response) {
  const { trail } = req.query;

  const shopsQuery =
    typeof trail === "string" && trail.trim()
      ? {
          text: `
            SELECT DISTINCT gs.* FROM gear_shops gs
            JOIN gear_shop_trails gst ON gst.shop_id = gs.id
            JOIN trails t ON t.id = gst.trail_id
            WHERE t.slug = $1 AND gs.source_url IS NOT NULL
            ORDER BY gs.rating DESC
          `,
          values: [trail.trim()],
        }
      : { text: "SELECT * FROM gear_shops WHERE source_url IS NOT NULL ORDER BY rating DESC", values: [] };

  const { rows: shops } = await pool.query(shopsQuery.text, shopsQuery.values);
  if (shops.length === 0) return res.json([]);

  const shopIds = shops.map((s) => s.id);
  const { rows: items } = await pool.query("SELECT * FROM shop_items WHERE shop_id = ANY($1)", [shopIds]);
  const { rows: nearTrailRows } = await pool.query(
    `SELECT gst.shop_id, t.name AS trail_name
     FROM gear_shop_trails gst JOIN trails t ON t.id = gst.trail_id
     WHERE gst.shop_id = ANY($1)`,
    [shopIds]
  );

  res.json(
    shops.map((shop) => ({
      id: shop.id,
      name: shop.name,
      district: shop.district,
      address: shop.address,
      rating: Number(shop.rating),
      reviewCount: shop.review_count,
      phone: shop.phone,
      website: shop.website,
      note: shop.note,
      sourceUrl: shop.source_url,
      nearTrails: nearTrailRows.filter((r) => r.shop_id === shop.id).map((r) => r.trail_name),
      items: items.filter((i) => i.shop_id === shop.id).map(mapItem),
    }))
  );
}
