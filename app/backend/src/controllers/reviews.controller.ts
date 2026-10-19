import type { Request, Response } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { ApiError } from "../utils/errors.js";
import type { AuthedRequest } from "../middleware/auth.js";

function mapReview(row: any) {
  return {
    id: row.id,
    trailId: row.trail_id,
    author: row.author,
    rating: row.rating,
    date: row.created_at.toISOString().slice(0, 10),
    text: row.body,
    tags: row.tags,
  };
}

function mapReviewWithTrail(row: any) {
  return { ...mapReview(row), trailSlug: row.trail_slug, trailName: row.trail_name };
}

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(1).max(2000),
  tags: z.array(z.string().trim().min(1).max(40)).max(6).optional().default([]),
});

async function getTrailIdBySlug(slug: string): Promise<string> {
  const { rows } = await pool.query("SELECT id FROM trails WHERE slug = $1", [slug]);
  if (rows.length === 0) throw ApiError.notFound("Trail not found");
  return rows[0].id;
}

export async function listRecentReviews(req: Request, res: Response) {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const { rows } = await pool.query(
    `SELECT reviews.*, trails.slug AS trail_slug, trails.name AS trail_name
     FROM reviews JOIN trails ON trails.id = reviews.trail_id
     ORDER BY reviews.created_at DESC
     LIMIT $1`,
    [limit]
  );
  res.json(rows.map(mapReviewWithTrail));
}

export async function listReviewsForTrail(req: AuthedRequest, res: Response) {
  const trailId = await getTrailIdBySlug(req.params.slug);
  const { rows } = await pool.query("SELECT * FROM reviews WHERE trail_id = $1 ORDER BY created_at DESC", [trailId]);
  res.json(rows.map(mapReview));
}

export async function createReviewForTrail(req: AuthedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const trailId = await getTrailIdBySlug(req.params.slug);
  const body = createReviewSchema.parse(req.body);

  const { rows: userRows } = await pool.query("SELECT name FROM users WHERE id = $1", [req.user.id]);
  const author = userRows[0]?.name ?? "Anonymous hiker";

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO reviews (trail_id, user_id, author, rating, body, tags)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [trailId, req.user.id, author, body.rating, body.text, body.tags]
    );
    await client.query(
      `UPDATE trails SET
         review_count = review_count + 1,
         rating = ROUND((((rating * review_count) + $2) / (review_count + 1))::numeric, 2)
       WHERE id = $1`,
      [trailId, body.rating]
    );
    await client.query("COMMIT");
    res.status(201).json(mapReview(rows[0]));
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
