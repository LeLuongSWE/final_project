-- ==========================================
-- ADD IMAGE_DATA COLUMN TO PRODUCTS TABLE
-- Lưu ảnh dạng binary (Base64) vào database
-- ==========================================

-- Add image_data column to store Base64 encoded image
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_data TEXT;

-- Verify the column was added
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'image_data';
