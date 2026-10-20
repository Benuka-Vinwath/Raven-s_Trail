-- Rough per-trail costs in LKR (Sri Lankan resident rates) for the budget planner. Estimates: check before relying on them.
-- Idempotent on purpose: seed.ts re-runs this file after it re-creates the trails.
ALTER TABLE trails
  ADD COLUMN IF NOT EXISTS entry_fee_lkr INT NOT NULL DEFAULT 0,             -- per person
  ADD COLUMN IF NOT EXISTS guide_fee_lkr INT NOT NULL DEFAULT 0,             -- per group, per day (0 = not needed)
  ADD COLUMN IF NOT EXISTS transfer_lkr INT NOT NULL DEFAULT 0,              -- per group, tuk-tuk/jeep to the trailhead and back
  ADD COLUMN IF NOT EXISTS stay_per_night_lkr INT NOT NULL DEFAULT 0,        -- per person, standard guesthouse
  ADD COLUMN IF NOT EXISTS transport_from_colombo_lkr INT NOT NULL DEFAULT 0; -- per person round trip by bus

UPDATE trails t SET
  entry_fee_lkr = v.entry, guide_fee_lkr = v.guide, transfer_lkr = v.transfer,
  stay_per_night_lkr = v.stay, transport_from_colombo_lkr = v.bus
FROM (VALUES
  ('ella-rock',                  0,    0,  800, 3500, 1600),
  ('little-adams-peak',          0,    0,  500, 3000, 1600),
  ('adams-peak',                 0,    0, 3000, 2500, 1400),
  ('worlds-end',               500,    0, 5000, 5000, 1600),
  ('knuckles-range',           300, 4000, 3500, 1500, 1200),
  ('pidurangala-rock',         500,    0,  600, 3500, 1800),
  ('bambarakanda-falls',         0,    0, 4000, 3000, 1500),
  ('riverston-mini-worlds-end',  0,    0, 3000, 2000, 1000),
  ('liptons-seat',               0,    0, 2500, 3500, 1700),
  ('moulawella-peak-sinharaja', 300, 3500, 5000, 4500, 1700),
  ('sigiriya-rock',             50,    0, 1000, 4000, 1800),
  ('mihintale',                  0,    0,  600, 3500, 2000),
  ('dunhinda-falls',            20,    0,  400, 3000, 1700),
  ('namunukula-peak',            0, 3000, 2500, 2500, 1800),
  ('narangala-mountain',         0,    0, 2500, 2500, 1700),
  ('diyaluma-falls',             0,    0, 2000, 3000, 1600),
  ('kirigalpotta',             500, 4000, 5000, 5000, 1600),
  ('totapola-kanda',           500,    0, 3000, 5000, 1500),
  ('bible-rock',                 0, 3000, 2500, 3000, 1000),
  ('lakegala-meemure',         300, 4000, 6000, 2000, 1400),
  ('ravana-ella-cave',           0,    0, 1500, 3500, 1600),
  ('nine-arch-bridge',           0,    0,    0, 3500, 1600),
  ('ambuluwawa-tower',           0,    0,  800, 3000, 1000),
  ('lovers-leap-falls',          0,    0,  500, 5000, 1500),
  ('single-tree-hill',          0,    0,  500, 5000, 1500),
  ('hanthana-range',             0,    0,  800, 3000, 1000),
  ('pekoe-trail-stage-1',        0,    0, 1500, 3000, 1000),
  ('pekoe-trail-stage-13',       0,    0, 2000, 3500, 1700),
  ('hawagala',                   0,    0, 1500, 3000, 1100),
  ('kabaragala',                 0,    0, 1500, 3000, 1000),
  ('rakshagala',                 0,    0, 1500, 3000, 1000),
  ('alagalla',                   0, 2500,  500, 3000,  800),
  ('haritha-kanda',              0,    0, 2000, 3500, 1400),
  ('uthuwankanda',               0,    0,  500, 3000,  500),
  ('yapahuwa-rock',              0,    0,  800, 3000, 1200),
  ('adara-kanda',                0, 3000, 2500, 3000, 1200),
  ('galboda-falls',              0,    0,  600, 3000, 1100),
  ('dambulla-cave-temple',       0,    0,  500, 4000, 1400),
  ('pekoe-trail-stage-9',        0,    0, 2500, 3500, 1400),
  ('pekoe-trail-stage-15',       0,    0,  800, 3500, 1600)
) AS v(slug, entry, guide, transfer, stay, bus)
WHERE t.slug = v.slug;
