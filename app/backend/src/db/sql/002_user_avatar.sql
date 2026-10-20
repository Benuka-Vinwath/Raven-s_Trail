-- profile photo stored inline as a small data URL (client resizes to 256px)
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
