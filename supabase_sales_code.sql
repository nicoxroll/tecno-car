-- Add code column to sales table for unique order identification
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS code text;

-- Optional: Add a unique constraint to ensure codes are unique
-- ALTER TABLE public.sales ADD CONSTRAINT sales_code_key UNIQUE (code);
