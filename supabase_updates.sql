-- Add fields to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add order field to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;
