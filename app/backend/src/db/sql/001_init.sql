CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  region TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'moderate', 'hard')),
  distance_km NUMERIC NOT NULL,
  elevation_gain_m INTEGER NOT NULL,
  peak_elevation_m INTEGER NOT NULL,
  duration_hrs NUMERIC NOT NULL,
  rating NUMERIC NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}',
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  best_season TEXT NOT NULL,
  start_lat DOUBLE PRECISION NOT NULL,
  start_lng DOUBLE PRECISION NOT NULL,
  elevation_profile INTEGER[] NOT NULL DEFAULT '{}',
  illustration TEXT NOT NULL CHECK (illustration IN ('dawn', 'misty', 'midday', 'dusk'))
);

CREATE TABLE IF NOT EXISTS gear_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  address TEXT NOT NULL,
  rating NUMERIC NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS gear_shop_trails (
  shop_id UUID NOT NULL REFERENCES gear_shops(id) ON DELETE CASCADE,
  trail_id UUID NOT NULL REFERENCES trails(id) ON DELETE CASCADE,
  PRIMARY KEY (shop_id, trail_id)
);

CREATE TABLE IF NOT EXISTS shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES gear_shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Shelter', 'Pack', 'Cook', 'Safety', 'Sleep')),
  price_per_day INTEGER NOT NULL,
  available INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS parking_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  trail_id UUID NOT NULL REFERENCES trails(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  price_per_day INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  secured BOOLEAN NOT NULL DEFAULT false,
  surface TEXT NOT NULL CHECK (surface IN ('Paved', 'Gravel', 'Grass'))
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id UUID NOT NULL REFERENCES trails(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trail_id UUID NOT NULL REFERENCES trails(id) ON DELETE CASCADE,
  hikers INTEGER NOT NULL DEFAULT 1,
  days INTEGER NOT NULL DEFAULT 1,
  transport TEXT NOT NULL,
  food_per_day INTEGER NOT NULL DEFAULT 0,
  gear_per_day INTEGER NOT NULL DEFAULT 0,
  parking_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trails_district ON trails(district);
CREATE INDEX IF NOT EXISTS idx_trails_difficulty ON trails(difficulty);
CREATE INDEX IF NOT EXISTS idx_reviews_trail ON reviews(trail_id);
CREATE INDEX IF NOT EXISTS idx_parking_trail ON parking_spots(trail_id);
CREATE INDEX IF NOT EXISTS idx_shop_items_shop ON shop_items(shop_id);
CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
