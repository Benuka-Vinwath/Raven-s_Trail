-- A standard type and size per item, so the kit builder can match "tent for 4" to any shop's tent.
ALTER TABLE shop_items
  ADD COLUMN IF NOT EXISTS gear_type TEXT,
  ADD COLUMN IF NOT EXISTS size INTEGER; -- tent capacity (people) or backpack litres, when the item name says so
