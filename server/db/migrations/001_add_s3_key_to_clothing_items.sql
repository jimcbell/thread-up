-- Migration: Add s3_key column to clothing_items table
-- This allows us to generate signed URLs for accessing S3 objects

ALTER TABLE clothing_items
ADD COLUMN IF NOT EXISTS s3_key VARCHAR(500);

-- Index for better query performance
CREATE INDEX IF NOT EXISTS idx_clothing_items_s3_key ON clothing_items(s3_key);
