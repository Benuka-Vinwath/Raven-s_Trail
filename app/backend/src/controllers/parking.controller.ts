import type { Request, Response } from "express";
import { pool } from "../db/pool.js";

function mapParking(row: any) {
  return {
    id: row.id,
    name: row.name,
    district: row.district,
    nearTrail: row.trail_name,
    coords: [row.lat, row.lng],
    pricePerDay: row.price_per_day,
    capacity: row.capacity,
    secured: row.secured,
    surface: row.surface,
  };
}

export async function listParking(req: Request, res: Response) {
  const { trail } = req.query;

  const conditions = ["1 = 1"];
  const params: unknown[] = [];
  if (typeof trail === "string" && trail.trim()) {
    params.push(trail.trim());
    conditions.push(`t.slug = $${params.length}`);
  }

  const { rows } = await pool.query(
    `SELECT p.*, t.name AS trail_name FROM parking_spots p
     JOIN trails t ON t.id = p.trail_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY p.price_per_day ASC`,
    params
  );

  res.json(rows.map(mapParking));
}
