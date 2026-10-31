-- What a customer needs after booking: a way to prove it (a secret token behind the QR code), a contact number,
-- and a record of when the gear was collected and returned.
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS verify_token TEXT,
  ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS returned_at TIMESTAMPTZ;

UPDATE bookings SET verify_token = encode(gen_random_bytes(16), 'hex') WHERE verify_token IS NULL;
ALTER TABLE bookings ALTER COLUMN verify_token SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_verify_token ON bookings(verify_token);

-- the shop's address, copied in like the name and phone, so the voucher still shows it if the shop changes later
ALTER TABLE booking_items ADD COLUMN IF NOT EXISTS shop_address TEXT;
