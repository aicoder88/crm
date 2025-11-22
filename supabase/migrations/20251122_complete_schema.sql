-- ==============================================================================
-- PURRIFY CRM - UNIFIED DATABASE SCHEMA
-- ==============================================================================
-- Generated: 2025-11-22
-- Version: 1.0
-- Description: Consolidated schema including all phases (I-IX)
--
-- IMPORTANT: This is the canonical schema file. Do not use individual phase files.
-- All CREATE statements include IF NOT EXISTS for idempotency.
--
-- Phases included:
--   - Base Schema: Core tables,  indexes, and RLS policies
--   - Phase V: Invoicing & Stripe Integration
--   - Phase VI: Shipping & Order Fulfillment
--   - Phase VII: Analytics & Reporting (Views & Materialized Views)
--   - Phase VIII: Email Integration & Automation
--   - Phase IX: Settings & Administration
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- CORE TABLES
-- ==========================================

-- Tags table (centralized tag management)
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#8B5CF6', -- Purple default
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers (main customer/pet store records)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Basic Info
  store_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  owner_manager_name TEXT,
  type TEXT CHECK (type IN ('B2B', 'B2C', 'Affiliate')) DEFAULT 'B2B',
  status TEXT CHECK (status IN ('Qualified', 'Interested', 'Not Qualified', 'Not Interested', 'Dog Store')) DEFAULT 'Qualified',
  notes TEXT,
  
  -- Location
  province TEXT,
  city TEXT,
  street TEXT,
  postal_code TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  
  -- Additional
  website TEXT,
  stripe_customer_id TEXT UNIQUE,
  
  -- Indexes
  CONSTRAINT customers_store_name_check CHECK (char_length(store_name) > 0)
);

-- Customer-Tags many-to-many relationship
CREATE TABLE IF NOT EXISTS customer_tags (
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (customer_id, tag_id)
);

-- Customer contacts (multiple contacts per customer)
CREATE TABLE IF NOT EXISTS customer_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer addresses
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('physical', 'billing', 'shipping')) NOT NULL,
  street TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Canada',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social media profiles
CREATE TABLE IF NOT EXISTS customer_social_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  platform TEXT CHECK (platform IN ('facebook', 'instagram', 'tiktok', 'youtube')) NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer timeline (activity feed with structured fields)
CREATE TABLE IF NOT EXISTS customer_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('call', 'email', 'note', 'invoice', 'shipment', 'deal')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID, -- For multi-user support later
  
  -- Call-specific indexed fields
  call_duration_minutes INTEGER,
  call_outcome TEXT,
  call_follow_up_date DATE,
  
  -- Email-specific indexed fields
  email_subject TEXT,
  email_opened BOOLEAN DEFAULT false,
  email_thread_id TEXT,
  
  -- Deal-specific indexed fields
  deal_stage TEXT,
  deal_value DECIMAL(10, 2),
  
  -- Note-specific indexed field
  note_category TEXT,
  
  -- Flexible JSONB for additional data
  data JSONB
);

-- ==========================================
-- COMMUNICATION TABLES
-- ==========================================

-- Calls
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER,
  notes TEXT,
  outcome TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('call', 'email', 'follow_up', 'other')) DEFAULT 'other',
  title TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Emails (for Gmail integration - Phase 7)
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  thread_id TEXT,
  subject TEXT,
  snippet TEXT,
  sent_date TIMESTAMPTZ,
  opened BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SALES TABLES
-- ==========================================

-- Deal stages
CREATE TABLE IF NOT EXISTS deal_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  order_index INTEGER NOT NULL,
  win_probability INTEGER CHECK (win_probability BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default Purrify pipeline stages
INSERT INTO deal_stages (name, order_index, win_probability) VALUES
  ('Cold Outreach Sent', 1, 10),
  ('Reply/Interest', 2, 25),
  ('Sample Sent', 3, 40),
  ('Follow-up Call Scheduled', 4, 60),
  ('Negotiating Terms', 5, 80),
  ('Closed Won', 6, 100),
  ('Closed Lost', 7, 0)
ON CONFLICT (name) DO NOTHING;

-- Deals
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  value DECIMAL(10, 2),
  stage TEXT NOT NULL REFERENCES deal_stages(name),
  probability INTEGER CHECK (probability BETWEEN 0 AND 100),
  expected_close_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- ==========================================
-- FINANCIAL TABLES
-- ==========================================

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
  due_date DATE,
  sent_date TIMESTAMPTZ,
  paid_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice items
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  product_sku TEXT,
  description TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SHIPPING TABLES
-- ==========================================

-- Shipments
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  carrier TEXT DEFAULT 'NetParcel',
  tracking_number TEXT,
  status TEXT,
  shipped_date TIMESTAMPTZ,
  delivered_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipping events (tracking updates)
CREATE TABLE IF NOT EXISTS shipping_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_email ON customer_contacts(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_type_status ON customers(type, status);
CREATE INDEX IF NOT EXISTS idx_customers_postal_code ON customers(postal_code);
CREATE INDEX IF NOT EXISTS idx_customers_province ON customers(province);

-- Timeline
CREATE INDEX IF NOT EXISTS idx_timeline_customer ON customer_timeline(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_type ON customer_timeline(type);
CREATE INDEX IF NOT EXISTS idx_timeline_follow_up ON customer_timeline(call_follow_up_date) WHERE call_follow_up_date IS NOT NULL;

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_tasks_customer ON tasks(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Deals
CREATE INDEX IF NOT EXISTS idx_deals_customer ON deals(customer_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close ON deals(expected_close_date);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_customer_status ON invoices(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_id ON invoices(stripe_invoice_id);

-- Shipments
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);


-- ==============================================================================
-- PHASE 5: INVOICING (phase-5-invoicing.sql)
-- ==============================================================================

-- Phase V: Invoicing & Stripe Integration Migration
-- Run this in Supabase SQL Editor

-- ==========================================
-- PRODUCTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  unit_price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'CAD',
  active BOOLEAN DEFAULT true,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT products_sku_check CHECK (char_length(sku) > 0),
  CONSTRAINT products_name_check CHECK (char_length(name) > 0),
  CONSTRAINT products_unit_price_check CHECK (unit_price >= 0)
);

-- Index for active products lookup
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- ==========================================
-- UPDATE INVOICES TABLE
-- ==========================================

-- Add new columns to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number TEXT UNIQUE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shipping DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'CAD';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;

-- Make stripe_invoice_id nullable (for drafts)
ALTER TABLE invoices ALTER COLUMN stripe_invoice_id DROP NOT NULL;

-- Add constraint for invoice_number format
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoices_invoice_number_format'
  ) THEN
    ALTER TABLE invoices ADD CONSTRAINT invoices_invoice_number_format 
      CHECK (invoice_number ~ '^INV-[0-9]{4}-[0-9]{3,}$');
  END IF;
END $$;

-- Add index for invoice number lookups
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Function to generate next invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  last_number INTEGER;
  new_number TEXT;
BEGIN
  current_year := TO_CHAR(NOW(), 'YYYY');
  
  -- Get the last invoice number for this year
  SELECT COALESCE(
    MAX(CAST(SPLIT_PART(invoice_number, '-', 3) AS INTEGER)),
    0
  ) INTO last_number
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || current_year || '-%';
  
  -- Generate new number with padding
  new_number := 'INV-' || current_year || '-' || LPAD((last_number + 1)::TEXT, 3, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Trigger to auto-update updated_at on products
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- SEED DATA (Optional - Sample Products)
-- ==========================================

INSERT INTO products (sku, name, description, unit_price) VALUES
  ('PURR-10LB', 'Purrify Odor Control - 10lb', 'Premium cat litter odor eliminator, 10lb container', 29.99),
  ('PURR-25LB', 'Purrify Odor Control - 25lb', 'Premium cat litter odor eliminator, 25lb bulk container', 64.99),
  ('PURR-SAMPLE', 'Purrify Sample Pack', 'Trial size sample pack for new customers', 9.99),
  ('SHIPPING-STD', 'Standard Shipping', 'Standard ground shipping within Canada', 15.00),
  ('SHIPPING-EXP', 'Express Shipping', 'Expedited shipping within Canada', 35.00)
ON CONFLICT (sku) DO NOTHING;


-- ==============================================================================
-- PHASE 6: SHIPPING (phase-6-shipping.sql)
-- ==============================================================================

-- Phase VI: Shipping & Order Fulfillment Migration
-- Run this in your Supabase SQL Editor

-- ==========================================
-- ENUMS
-- ==========================================

-- Create shipment status enum for type safety
DO $$ BEGIN
  CREATE TYPE shipment_status AS ENUM (
    'pending',
    'label_created',
    'picked_up',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'exception',
    'cancelled',
    'returned'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- ALTER EXISTING TABLES
-- ==========================================

-- Update shipments table with additional fields
ALTER TABLE shipments
  -- Add status enum (convert existing TEXT to ENUM)
  ALTER COLUMN status TYPE shipment_status USING status::shipment_status,
  
  -- Set default status
  ALTER COLUMN status SET DEFAULT 'pending',
  
  -- Add new columns
  ADD COLUMN IF NOT EXISTS order_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE,
  ADD COLUMN IF NOT EXISTS actual_weight DECIMAL(10, 2), -- in lbs
  ADD COLUMN IF NOT EXISTS billed_weight DECIMAL(10, 2), -- in lbs (dimensional weight)
  ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS label_url TEXT,
  ADD COLUMN IF NOT EXISTS package_count INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS dimensions_length DECIMAL(10, 2), -- inches
  ADD COLUMN IF NOT EXISTS dimensions_width DECIMAL(10, 2), -- inches
  ADD COLUMN IF NOT EXISTS dimensions_height DECIMAL(10, 2), -- inches
  ADD COLUMN IF NOT EXISTS service_level VARCHAR(100), -- e.g., "Ground", "Express"
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update invoices table to support order tracking
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS order_number VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50) UNIQUE;

-- Add invoice number constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoices_invoice_number_check'
  ) THEN
    ALTER TABLE invoices
      ADD CONSTRAINT invoices_invoice_number_check CHECK (invoice_number IS NOT NULL);
  END IF;
END $$;

-- ==========================================
-- UPDATE INDEXES
-- ==========================================

-- Add index for order number lookups
CREATE INDEX IF NOT EXISTS idx_invoices_order_number ON invoices(order_number);
CREATE INDEX IF NOT EXISTS idx_shipments_order_number ON shipments(order_number);

-- Add index for shipment status queries
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);

-- Add index for delivery date tracking
CREATE INDEX IF NOT EXISTS idx_shipments_delivery_date ON shipments(estimated_delivery_date);

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_month TEXT;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYMM');
  
  SELECT 'ORD-' || year_month || '-' || LPAD(COALESCE(MAX(
    CAST(SUBSTRING(order_number FROM '\d+$') AS INTEGER)
  ), 0)::TEXT + 1, 4, '0')
  INTO new_number
  FROM invoices
  WHERE order_number LIKE 'ORD-' || year_month || '-%';
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update shipment status in timeline
CREATE OR REPLACE FUNCTION update_timeline_on_shipment_delivery()
RETURNS TRIGGER AS $$
BEGIN
  -- When shipment is delivered, add to customer timeline
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    INSERT INTO customer_timeline (customer_id, type, data)
    VALUES (
      NEW.customer_id,
      'shipment',
      jsonb_build_object(
        'shipment_id', NEW.id,
        'tracking_number', NEW.tracking_number,
        'carrier', NEW.carrier,
        'status', 'delivered',
        'delivered_date', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timeline updates
DROP TRIGGER IF EXISTS trigger_shipment_delivery ON shipments;
CREATE TRIGGER trigger_shipment_delivery
  AFTER UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_timeline_on_shipment_delivery();

-- ==========================================
-- SEED DATA (Optional - for testing)
-- ==========================================

-- Update existing shipments to have pending status if null
UPDATE shipments SET status = 'pending' WHERE status IS NULL;

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON COLUMN shipments.order_number IS 'Reference order number for tracking';
COMMENT ON COLUMN shipments.billed_weight IS 'Dimensional weight used for billing (may differ from actual)';
COMMENT ON COLUMN shipments.label_url IS 'URL to download shipping label PDF from NetParcel';
COMMENT ON COLUMN shipments.service_level IS 'Shipping service type (Ground, Express, etc.)';
COMMENT ON COLUMN shipments.estimated_delivery_date IS 'Expected delivery date from carrier';

COMMENT ON FUNCTION generate_order_number() IS 'Generates sequential order numbers in format ORD-YYMM-0001';
COMMENT ON FUNCTION update_timeline_on_shipment_delivery() IS 'Automatically adds shipment delivery events to customer timeline';


-- ==============================================================================
-- PHASE 7: ANALYTICS (phase-7-analytics.sql)
-- ==============================================================================

-- Phase VII: Analytics & Reporting
-- Database views and indexes for optimized analytics queries

-- ==========================================
-- MATERIALIZED VIEWS
-- ==========================================

-- Monthly revenue aggregation (refreshed daily via cron)
CREATE MATERIALIZED VIEW IF NOT EXISTS monthly_revenue AS
SELECT 
  DATE_TRUNC('month', paid_date) as month,
  COUNT(*) as invoice_count,
  SUM(total) as total_revenue,
  SUM(tax) as total_tax,
  SUM(subtotal) as subtotal,
  AVG(total) as avg_order_value
FROM invoices
WHERE status = 'paid' AND paid_date IS NOT NULL
GROUP BY DATE_TRUNC('month', paid_date);

CREATE INDEX IF NOT EXISTS idx_monthly_revenue_month ON monthly_revenue(month DESC);

-- ==========================================
-- REGULAR VIEWS
-- ==========================================

-- Pipeline metrics for sales analytics
CREATE OR REPLACE VIEW pipeline_metrics AS
SELECT 
  stage,
  COUNT(*) as deal_count,
  SUM(value) as total_value,
  AVG(value) as avg_value,
  AVG(probability) as avg_probability,
  COUNT(CASE WHEN closed_at IS NOT NULL AND stage = 'Closed Won' THEN 1 END) as won_count,
  COUNT(CASE WHEN closed_at IS NOT NULL AND stage = 'Closed Lost' THEN 1 END) as lost_count
FROM deals
GROUP BY stage;

-- Customer RFM (Recency, Frequency, Monetary) for segmentation
CREATE OR REPLACE VIEW customer_rfm AS
SELECT 
  c.id,
  c.store_name,
  c.province,
  c.type,
  c.status,
  MAX(i.paid_date) as last_purchase_date,
  EXTRACT(DAYS FROM NOW() - MAX(i.paid_date)) as recency_days,
  COUNT(i.id) as purchase_frequency,
  COALESCE(SUM(i.total), 0) as monetary_value,
  COALESCE(AVG(i.total), 0) as avg_order_value
FROM customers c
LEFT JOIN invoices i ON c.id = i.customer_id AND i.status = 'paid'
GROUP BY c.id, c.store_name, c.province, c.type, c.status;

-- Invoice aging for financial analytics
CREATE OR REPLACE VIEW invoice_aging AS
SELECT 
  i.id,
  i.customer_id,
  i.invoice_number,
  i.total,
  i.due_date,
  i.status,
  c.store_name,
  CASE 
    WHEN i.status = 'paid' THEN 'paid'
    WHEN i.due_date IS NULL THEN 'no_due_date'
    WHEN i.due_date >= NOW() THEN 'current'
    WHEN i.due_date >= NOW() - INTERVAL '30 days' THEN 'overdue_30'
    WHEN i.due_date >= NOW() - INTERVAL '60 days' THEN 'overdue_60'
    WHEN i.due_date >= NOW() - INTERVAL '90 days' THEN 'overdue_90'
    ELSE 'overdue_90_plus'
  END as aging_bucket,
  EXTRACT(DAYS FROM NOW() - i.due_date) as days_overdue
FROM invoices i
JOIN customers c ON i.customer_id = c.id
WHERE i.status != 'cancelled';

-- Shipment performance metrics
CREATE OR REPLACE VIEW shipment_metrics AS
SELECT 
  s.id,
  s.customer_id,
  s.carrier,
  s.status,
  s.service_level,
  s.shipped_date,
  s.delivered_date,
  s.estimated_delivery_date,
  s.shipping_cost,
  c.province,
  CASE 
    WHEN s.delivered_date IS NOT NULL AND s.estimated_delivery_date IS NOT NULL 
    THEN s.delivered_date <= s.estimated_delivery_date
    ELSE NULL
  END as on_time,
  CASE 
    WHEN s.delivered_date IS NOT NULL AND s.shipped_date IS NOT NULL
    THEN EXTRACT(DAYS FROM s.delivered_date - s.shipped_date)
    ELSE NULL
  END as delivery_days
FROM shipments s
JOIN customers c ON s.customer_id = c.id;

-- ==========================================
-- PERFORMANCE INDEXES
-- ==========================================

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_paid_date ON invoices(paid_date) WHERE status = 'paid';
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date) WHERE status IN ('sent', 'overdue');
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

-- Deals
CREATE INDEX IF NOT EXISTS idx_deals_stage_value ON deals(stage, value) WHERE closed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_deals_closed_at ON deals(closed_at) WHERE closed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_expected_close ON deals(expected_close_date) WHERE closed_at IS NULL;

-- Shipments
CREATE INDEX IF NOT EXISTS idx_shipments_status_date ON shipments(status, shipped_date);
CREATE INDEX IF NOT EXISTS idx_shipments_delivered_date ON shipments(delivered_date) WHERE delivered_date IS NOT NULL;

-- Timeline
CREATE INDEX IF NOT EXISTS idx_timeline_created_at ON customer_timeline(created_at);

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Function to refresh materialized views (call this daily via cron)
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW monthly_revenue;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON MATERIALIZED VIEW monthly_revenue IS 'Monthly revenue aggregation for dashboard KPIs. Refresh daily.';
COMMENT ON VIEW pipeline_metrics IS 'Real-time sales pipeline metrics by stage.';
COMMENT ON VIEW customer_rfm IS 'Customer RFM analysis for segmentation.';
COMMENT ON VIEW invoice_aging IS 'Invoice aging buckets for AR reporting.';
COMMENT ON VIEW shipment_metrics IS 'Shipment performance with delivery times.';


-- ==============================================================================
-- PHASE 8: EMAIL (phase-8-email.sql)
-- ==============================================================================

-- Phase VIII: Email Integration & Automation
-- Database schema for email templates, campaigns, and tracking

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(100),
  variables JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Campaigns Table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sending, sent, cancelled
  scheduled_date TIMESTAMPTZ,
  sent_date TIMESTAMPTZ,
  recipient_count INT DEFAULT 0,
  opened_count INT DEFAULT 0,
  clicked_count INT DEFAULT 0,
  bounced_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Recipients (Many-to-Many)
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced BOOLEAN DEFAULT false,
  UNIQUE(campaign_id, customer_id) -- Prevent duplicate recipients
);

-- Extend customer_timeline with email tracking fields
ALTER TABLE customer_timeline 
  ADD COLUMN IF NOT EXISTS email_message_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS email_sent_to VARCHAR(255),
  ADD COLUMN IF NOT EXISTS email_sent_from VARCHAR(255),
  ADD COLUMN IF NOT EXISTS email_attachment_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS email_clicked BOOLEAN DEFAULT false;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(active);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_template ON email_campaigns(template_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_customer ON campaign_recipients(customer_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_timeline_email_message ON customer_timeline(email_message_id);
CREATE INDEX IF NOT EXISTS idx_timeline_email_type ON customer_timeline(type) WHERE type = 'email';

-- Trigger to update email_templates.updated_at
CREATE OR REPLACE FUNCTION update_email_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS email_templates_updated_at ON email_templates;
CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_template_updated_at();

-- Seed default email templates
INSERT INTO email_templates (name, subject, body, category, variables) VALUES
(
  'Invoice Notification',
  'Invoice {{invoice_number}} from Purrify',
  '<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">Purrify</h1>
    <p style="color: white; margin: 10px 0 0 0;">Cat Litter Odor Control</p>
  </div>
  
  <div style="padding: 30px; background: #f9fafb;">
    <h2 style="color: #1f2937; margin-top: 0;">Hi {{customer_name}},</h2>
    <p style="color: #4b5563; line-height: 1.6;">
      Your invoice is ready! Here are the details:
    </p>
    
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #6b7280;">Invoice Number:</td>
          <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #1f2937;">{{invoice_number}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280;">Total Amount:</td>
          <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #1f2937;">{{invoice_total}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280;">Due Date:</td>
          <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #dc2626;">{{invoice_due_date}}</td>
        </tr>
      </table>
    </div>
    
    <p style="color: #4b5563; line-height: 1.6;">
      Please review the attached invoice and submit payment by the due date. If you have any questions, reply to this email.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Invoice</a>
    </div>
    
    <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
      Thank you for your business!<br>
      The Purrify Team
    </p>
  </div>
</body>
</html>',
  'invoicing',
  '["customer_name", "invoice_number", "invoice_total", "invoice_due_date"]'::jsonb
),
(
  'Shipment Notification',
  'Your order has shipped - Tracking #{{tracking_number}}',
  '<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">📦 Order Shipped!</h1>
  </div>
  
  <div style="padding: 30px; background: #f9fafb;">
    <h2 style="color: #1f2937; margin-top: 0;">Hi {{customer_name}},</h2>
    <p style="color: #4b5563; line-height: 1.6;">
      Great news! Your order has been shipped and is on its way to you.
    </p>
    
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #6b7280;">Carrier:</td>
          <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #1f2937;">{{shipment_carrier}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280;">Tracking Number:</td>
          <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #1f2937;">{{tracking_number}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280;">Estimated Delivery:</td>
          <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #059669;">{{estimated_delivery}}</td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Track Package</a>
    </div>
    
    <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
      Thank you for choosing Purrify!<br>
      Questions? Reply to this email anytime.
    </p>
  </div>
</body>
</html>',
  'shipping',
  '["customer_name", "tracking_number", "shipment_carrier", "estimated_delivery"]'::jsonb
),
(
  'Welcome Email',
  'Welcome to Purrify - Let''s eliminate cat litter odor!',
  '<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">🎉 Welcome to Purrify!</h1>
  </div>
  
  <div style="padding: 30px; background: #f9fafb;">
    <h2 style="color: #1f2937; margin-top: 0;">Hi {{customer_name}},</h2>
    <p style="color: #4b5563; line-height: 1.6;">
      We''re thrilled to have you as a partner! Purrify is Canada''s leading cat litter odor control solution, trusted by pet stores across the country.
    </p>
    
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <h3 style="color: #1f2937; margin-top: 0;">What''s Next?</h3>
      <ul style="color: #4b5563; line-height: 1.8;">
        <li>Review our product catalog and pricing</li>
        <li>Schedule a call with your account manager</li>
        <li>Place your first order and start delighting your customers</li>
      </ul>
    </div>
    
    <p style="color: #4b5563; line-height: 1.6;">
      Have questions? Our team is here to help. Reply to this email or give us a call.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Product Catalog</a>
    </div>
    
    <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
      To fresh-smelling spaces,<br>
      The Purrify Team
    </p>
  </div>
</body>
</html>',
  'onboarding',
  '["customer_name"]'::jsonb
),
(
  'Follow-up Reminder',
  'Follow-up: {{task_title}}',
  '<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">⏰ Reminder</h1>
  </div>
  
  <div style="padding: 30px; background: #f9fafb;">
    <h2 style="color: #1f2937; margin-top: 0;">Hi {{customer_name}},</h2>
    <p style="color: #4b5563; line-height: 1.6;">
      This is a friendly reminder about our upcoming follow-up:
    </p>
    
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <h3 style="color: #1f2937; margin-top: 0;">{{task_title}}</h3>
      <p style="color: #6b7280; margin: 10px 0;">
        <strong>Due:</strong> {{task_due_date}}
      </p>
    </div>
    
    <p style="color: #4b5563; line-height: 1.6;">
      Looking forward to connecting with you. Reply to this email if you need to reschedule.
    </p>
    
    <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
      Best regards,<br>
      The Purrify Team
    </p>
  </div>
</body>
</html>',
  'follow-up',
  '["customer_name", "task_title", "task_due_date"]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust based on your RLS policies)
-- This assumes you have a service role or authenticated users
-- ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE email_templates IS 'Reusable email templates with variable interpolation';
COMMENT ON TABLE email_campaigns IS 'Bulk email campaigns with tracking metrics';
COMMENT ON TABLE campaign_recipients IS 'Junction table tracking campaign recipients and engagement';
COMMENT ON COLUMN customer_timeline.email_message_id IS 'Unique message ID from email provider (Resend/Gmail)';
COMMENT ON COLUMN customer_timeline.email_clicked IS 'Whether recipient clicked any links in the email';


-- ==============================================================================
-- PHASE 9: SETTINGS (phase-9-settings.sql)
-- ==============================================================================

-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'My Company',
    address TEXT,
    city TEXT,
    province TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Canada',
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    currency TEXT DEFAULT 'CAD',
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow authenticated users to view company settings
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'company_settings' AND policyname = 'Authenticated users can view company settings'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated users can view company settings" ON company_settings FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
END $$;

-- Allow authenticated users to update company settings (simplified for now, ideally restricted to admins)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'company_settings' AND policyname = 'Authenticated users can update company settings'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated users can update company settings" ON company_settings FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
END $$;

-- Insert default row if not exists
INSERT INTO company_settings (name)
SELECT 'My Company'
WHERE NOT EXISTS (SELECT 1 FROM company_settings);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_company_settings_updated_at ON company_settings;
CREATE TRIGGER update_company_settings_updated_at
    BEFORE UPDATE ON company_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
