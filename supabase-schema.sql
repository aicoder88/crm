-- Purrify CRM Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- CORE TABLES
-- ==========================================

-- Tags table (centralized tag management)
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#8B5CF6', -- Purple default
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers (main customer/pet store records)
CREATE TABLE customers (
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
CREATE TABLE customer_tags (
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (customer_id, tag_id)
);

-- Customer contacts (multiple contacts per customer)
CREATE TABLE customer_contacts (
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
CREATE TABLE customer_addresses (
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
CREATE TABLE customer_social_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  platform TEXT CHECK (platform IN ('facebook', 'instagram', 'tiktok', 'youtube')) NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer timeline (activity feed with structured fields)
CREATE TABLE customer_timeline (
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
CREATE TABLE calls (
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
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('call', 'email', 'follow_up', 'other')) DEFAULT 'other',
  title TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  reminder_time TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Emails (for Gmail integration - Phase 7)
CREATE TABLE emails (
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
CREATE TABLE deal_stages (
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
  ('Closed Lost', 7, 0);

-- Deals
CREATE TABLE deals (
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
CREATE TABLE invoices (
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
CREATE TABLE invoice_items (
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
CREATE TABLE shipments (
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
CREATE TABLE shipping_events (
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
CREATE INDEX idx_customers_email ON customer_contacts(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_type_status ON customers(type, status);
CREATE INDEX idx_customers_postal_code ON customers(postal_code);
CREATE INDEX idx_customers_province ON customers(province);

-- Timeline
CREATE INDEX idx_timeline_customer ON customer_timeline(customer_id, created_at DESC);
CREATE INDEX idx_timeline_type ON customer_timeline(type);
CREATE INDEX idx_timeline_follow_up ON customer_timeline(call_follow_up_date) WHERE call_follow_up_date IS NOT NULL;

-- Tasks
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE status = 'pending';
CREATE INDEX idx_tasks_customer ON tasks(customer_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_reminder ON tasks(reminder_time) WHERE status = 'pending' AND reminder_sent = false;

-- Deals
CREATE INDEX idx_deals_customer ON deals(customer_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_expected_close ON deals(expected_close_date);

-- Invoices
CREATE INDEX idx_invoices_customer_status ON invoices(customer_id, status);
CREATE INDEX idx_invoices_stripe_id ON invoices(stripe_invoice_id);

-- Shipments
CREATE INDEX idx_shipments_tracking ON shipments(tracking_number);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- To be enabled after authentication is set up
-- ==========================================

-- Enable RLS on all tables
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
-- (etc. for all tables)

-- Create policies after auth setup
-- Example: CREATE POLICY "Users can view their own customers" ON customers
--   FOR SELECT USING (auth.uid() = user_id);
