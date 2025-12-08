-- Add platform column to gallery_posts table
ALTER TABLE gallery_posts ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'instagram';
