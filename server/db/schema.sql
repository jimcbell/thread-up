-- Virtual Wardrobe Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  picture TEXT,
  google_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'uploading',
  -- Status: uploading, processing, ready_for_review, completed, error
  image_count INTEGER NOT NULL,
  processed_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Upload images table
CREATE TABLE IF NOT EXISTS upload_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  s3_key VARCHAR(500) NOT NULL,
  s3_url TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'uploaded',
  -- Status: uploaded, processing, analyzed, error
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Clothing items table
CREATE TABLE IF NOT EXISTS clothing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  upload_image_id UUID REFERENCES upload_images(id) ON DELETE SET NULL,
  s3_key VARCHAR(500),
  s3_url TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  -- Category: top, bottom, dress, shoes, outerwear
  colors JSONB NOT NULL,
  -- Array of color names
  pattern VARCHAR(50) NOT NULL,
  -- Pattern: solid, striped, floral, plaid, printed, other
  formality_level VARCHAR(50) NOT NULL,
  -- Formality: casual, business_casual, formal
  status VARCHAR(50) NOT NULL DEFAULT 'pending_review',
  -- Status: pending_review, approved, rejected
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Outfits table
CREATE TABLE IF NOT EXISTS outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  occasion VARCHAR(50) NOT NULL,
  -- Occasion: casual_friday, date_night, business_meeting, weekend_casual
  item_ids JSONB NOT NULL,
  -- {"top": "uuid", "bottom": "uuid", "shoes": "uuid", "dress": "uuid"}
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_uploads_user_status ON uploads(user_id, status);
CREATE INDEX IF NOT EXISTS idx_uploads_status ON uploads(status);
CREATE INDEX IF NOT EXISTS idx_upload_images_upload ON upload_images(upload_id);
CREATE INDEX IF NOT EXISTS idx_clothing_items_user_status ON clothing_items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_clothing_items_category ON clothing_items(category);
CREATE INDEX IF NOT EXISTS idx_clothing_items_formality ON clothing_items(formality_level);
CREATE INDEX IF NOT EXISTS idx_outfits_user ON outfits(user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_uploads_updated_at BEFORE UPDATE ON uploads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_upload_images_updated_at BEFORE UPDATE ON upload_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clothing_items_updated_at BEFORE UPDATE ON clothing_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
