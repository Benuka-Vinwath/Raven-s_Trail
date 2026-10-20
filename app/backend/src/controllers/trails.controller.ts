import type { Request, Response } from "express";
import { pool } from "../db/pool.js";
import { ApiError } from "../utils/errors.js";

function mapTrail(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    district: row.district,
    region: row.region,
    difficulty: row.difficulty,
    distanceKm: Number(row.distance_km),
    elevationGainM: row.elevation_gain_m,
    peakElevationM: row.peak_elevation_m,
    durationHrs: Number(row.duration_hrs),
    rating: Number(row.rating),
    reviewCount: row.review_count,
    tags: row.tags,
    summary: row.summary,
    description: row.description,
    bestSeason: row.best_season,
    startPoint: [row.start_lat, row.start_lng],
    elevationProfile: row.elevation_profile,
    illustration: row.illustration,
    costs: {
      entryFeeLkr: row.entry_fee_lkr,
      guideFeeLkr: row.guide_fee_lkr,
      transferLkr: row.transfer_lkr,
      stayPerNightLkr: row.stay_per_night_lkr,
      transportFromColomboLkr: row.transport_from_colombo_lkr,
    },
  };
}

export async function listTrails(req: Request, res: Response) {
  const { q, difficulty, district, sort } = req.query;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (typeof q === "string" && q.trim()) {
    params.push(`%${q.trim()}%`);
    conditions.push(`(name ILIKE $${params.length} OR district ILIKE $${params.length} OR $${params.length} = ANY(tags))`);
  }
  if (typeof difficulty === "string" && difficulty.trim()) {
    params.push(difficulty.trim());
    conditions.push(`difficulty = $${params.length}`);
  }
  if (typeof district === "string" && district.trim()) {
    params.push(district.trim());
    conditions.push(`district = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderBy =
    sort === "elevation" ? "peak_elevation_m DESC" : sort === "distance" ? "distance_km ASC" : "rating DESC";

  const { rows } = await pool.query(`SELECT * FROM trails ${where} ORDER BY ${orderBy}`, params);
  res.json(rows.map(mapTrail));
}

export async function getTrailBySlug(req: Request, res: Response) {
  const { rows } = await pool.query("SELECT * FROM trails WHERE slug = $1", [req.params.slug]);
  if (rows.length === 0) throw ApiError.notFound("Trail not found");
  res.json(mapTrail(rows[0]));
}
