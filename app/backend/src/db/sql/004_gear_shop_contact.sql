-- Real shops need contact details and a source; source_url also marks which rows are real (vs. placeholder seed shops).
ALTER TABLE gear_shops
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS note TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT;
