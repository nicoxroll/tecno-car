ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';
