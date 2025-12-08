ALTER TABLE public.services ADD COLUMN IF NOT EXISTS timeline jsonb DEFAULT '[]';
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS video_url text;
