-- ==============================================================================
-- PERFORMANCE IMPROVEMENTS & LINKEDIN SUPPORT
-- ==============================================================================
-- Generated: 2025-11-23
-- Description: Add LinkedIn platform support and performance indexes

-- ==========================================
-- 1. ADD LINKEDIN TO SOCIAL MEDIA PLATFORMS
-- ==========================================

-- Drop the old constraint
ALTER TABLE customer_social_media
  DROP CONSTRAINT IF EXISTS customer_social_media_platform_check;

-- Add new constraint with LinkedIn
ALTER TABLE customer_social_media
  ADD CONSTRAINT customer_social_media_platform_check
  CHECK (platform IN ('facebook', 'instagram', 'tiktok', 'youtube', 'linkedin'));

-- ==========================================
-- 2. ADD PERFORMANCE INDEXES
-- ==========================================

-- Customers table - improve search and filtering performance
CREATE INDEX IF NOT EXISTS idx_customers_store_name ON customers(store_name);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_city ON customers(city);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- Customer tags - improve join performance
CREATE INDEX IF NOT EXISTS idx_customer_tags_customer_id ON customer_tags(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_tags_tag_id ON customer_tags(tag_id);

-- Customer contacts - improve join performance
CREATE INDEX IF NOT EXISTS idx_customer_contacts_customer_id ON customer_contacts(customer_id);

-- Customer social media - improve join performance
CREATE INDEX IF NOT EXISTS idx_customer_social_media_customer_id ON customer_social_media(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_social_media_platform ON customer_social_media(platform);

-- ==========================================
-- 3. COMMENTS
-- ==========================================

COMMENT ON CONSTRAINT customer_social_media_platform_check ON customer_social_media
  IS 'Supported social media platforms: facebook, instagram, tiktok, youtube, linkedin';
