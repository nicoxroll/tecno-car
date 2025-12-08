-- Agregar columna timeline_images a la tabla services
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS timeline_images text[] DEFAULT '{}';
