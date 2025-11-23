-- ==============================================================================
-- PURRIFY CRM - COMPLETE DATABASE SETUP
-- ==============================================================================
-- This file applies the pending migration and enables RLS policies
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard

-- ==============================================================================
-- 1. APPLY PENDING MIGRATION: Add Task Reminders
-- ==============================================================================

-- Add reminder fields to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS reminder_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- Create index for efficient reminder queries
CREATE INDEX IF NOT EXISTS idx_tasks_reminder
ON tasks(reminder_time)
WHERE status = 'pending' AND reminder_sent = false;

-- ==============================================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES
-- ==============================================================================

-- Core tables
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customer_social_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customer_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tags ENABLE ROW LEVEL SECURITY;

-- Communication tables
ALTER TABLE IF EXISTS calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS emails ENABLE ROW LEVEL SECURITY;

-- Sales tables
ALTER TABLE IF EXISTS deal_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS deals ENABLE ROW LEVEL SECURITY;

-- Financial tables
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoice_items ENABLE ROW LEVEL SECURITY;

-- Shipping tables
ALTER TABLE IF EXISTS shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS shipping_events ENABLE ROW LEVEL SECURITY;

-- Email tables
ALTER TABLE IF EXISTS email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Settings tables
ALTER TABLE IF EXISTS company_settings ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. CREATE RLS POLICIES (Allow all authenticated users - adjust as needed)
-- ==============================================================================

-- For development/single-user setup, allow all authenticated users to access everything
-- In production, you may want to restrict based on user roles

-- Customers table policies
DROP POLICY IF EXISTS "Allow authenticated users to view customers" ON customers;
CREATE POLICY "Allow authenticated users to view customers"
ON customers FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert customers" ON customers;
CREATE POLICY "Allow authenticated users to insert customers"
ON customers FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update customers" ON customers;
CREATE POLICY "Allow authenticated users to update customers"
ON customers FOR UPDATE
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete customers" ON customers;
CREATE POLICY "Allow authenticated users to delete customers"
ON customers FOR DELETE
USING (auth.role() = 'authenticated');

-- Tasks table policies
DROP POLICY IF EXISTS "Allow authenticated users to view tasks" ON tasks;
CREATE POLICY "Allow authenticated users to view tasks"
ON tasks FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert tasks" ON tasks;
CREATE POLICY "Allow authenticated users to insert tasks"
ON tasks FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update tasks" ON tasks;
CREATE POLICY "Allow authenticated users to update tasks"
ON tasks FOR UPDATE
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete tasks" ON tasks;
CREATE POLICY "Allow authenticated users to delete tasks"
ON tasks FOR DELETE
USING (auth.role() = 'authenticated');

-- Deals table policies
DROP POLICY IF EXISTS "Allow authenticated users to view deals" ON deals;
CREATE POLICY "Allow authenticated users to view deals"
ON deals FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert deals" ON deals;
CREATE POLICY "Allow authenticated users to insert deals"
ON deals FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update deals" ON deals;
CREATE POLICY "Allow authenticated users to update deals"
ON deals FOR UPDATE
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete deals" ON deals;
CREATE POLICY "Allow authenticated users to delete deals"
ON deals FOR DELETE
USING (auth.role() = 'authenticated');

-- Invoices table policies
DROP POLICY IF EXISTS "Allow authenticated users to view invoices" ON invoices;
CREATE POLICY "Allow authenticated users to view invoices"
ON invoices FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert invoices" ON invoices;
CREATE POLICY "Allow authenticated users to insert invoices"
ON invoices FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update invoices" ON invoices;
CREATE POLICY "Allow authenticated users to update invoices"
ON invoices FOR UPDATE
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete invoices" ON invoices;
CREATE POLICY "Allow authenticated users to delete invoices"
ON invoices FOR DELETE
USING (auth.role() = 'authenticated');

-- Products table policies
DROP POLICY IF EXISTS "Allow authenticated users to view products" ON products;
CREATE POLICY "Allow authenticated users to view products"
ON products FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to manage products" ON products;
CREATE POLICY "Allow authenticated users to manage products"
ON products FOR ALL
USING (auth.role() = 'authenticated');

-- Tags table policies
DROP POLICY IF EXISTS "Allow authenticated users to view tags" ON tags;
CREATE POLICY "Allow authenticated users to view tags"
ON tags FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to manage tags" ON tags;
CREATE POLICY "Allow authenticated users to manage tags"
ON tags FOR ALL
USING (auth.role() = 'authenticated');

-- Customer contacts policies
DROP POLICY IF EXISTS "Allow authenticated users full access to customer_contacts" ON customer_contacts;
CREATE POLICY "Allow authenticated users full access to customer_contacts"
ON customer_contacts FOR ALL
USING (auth.role() = 'authenticated');

-- Customer tags policies
DROP POLICY IF EXISTS "Allow authenticated users full access to customer_tags" ON customer_tags;
CREATE POLICY "Allow authenticated users full access to customer_tags"
ON customer_tags FOR ALL
USING (auth.role() = 'authenticated');

-- Customer addresses policies
DROP POLICY IF EXISTS "Allow authenticated users full access to customer_addresses" ON customer_addresses;
CREATE POLICY "Allow authenticated users full access to customer_addresses"
ON customer_addresses FOR ALL
USING (auth.role() = 'authenticated');

-- Customer social media policies
DROP POLICY IF EXISTS "Allow authenticated users full access to customer_social_media" ON customer_social_media;
CREATE POLICY "Allow authenticated users full access to customer_social_media"
ON customer_social_media FOR ALL
USING (auth.role() = 'authenticated');

-- Customer timeline policies
DROP POLICY IF EXISTS "Allow authenticated users full access to customer_timeline" ON customer_timeline;
CREATE POLICY "Allow authenticated users full access to customer_timeline"
ON customer_timeline FOR ALL
USING (auth.role() = 'authenticated');

-- Calls table policies
DROP POLICY IF EXISTS "Allow authenticated users full access to calls" ON calls;
CREATE POLICY "Allow authenticated users full access to calls"
ON calls FOR ALL
USING (auth.role() = 'authenticated');

-- Emails table policies
DROP POLICY IF EXISTS "Allow authenticated users full access to emails" ON emails;
CREATE POLICY "Allow authenticated users full access to emails"
ON emails FOR ALL
USING (auth.role() = 'authenticated');

-- Shipments table policies
DROP POLICY IF EXISTS "Allow authenticated users full access to shipments" ON shipments;
CREATE POLICY "Allow authenticated users full access to shipments"
ON shipments FOR ALL
USING (auth.role() = 'authenticated');

-- Shipping events policies
DROP POLICY IF EXISTS "Allow authenticated users full access to shipping_events" ON shipping_events;
CREATE POLICY "Allow authenticated users full access to shipping_events"
ON shipping_events FOR ALL
USING (auth.role() = 'authenticated');

-- Invoice items policies
DROP POLICY IF EXISTS "Allow authenticated users full access to invoice_items" ON invoice_items;
CREATE POLICY "Allow authenticated users full access to invoice_items"
ON invoice_items FOR ALL
USING (auth.role() = 'authenticated');

-- Deal stages policies (read-only for most users)
DROP POLICY IF EXISTS "Allow authenticated users to view deal_stages" ON deal_stages;
CREATE POLICY "Allow authenticated users to view deal_stages"
ON deal_stages FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to manage deal_stages" ON deal_stages;
CREATE POLICY "Allow authenticated users to manage deal_stages"
ON deal_stages FOR ALL
USING (auth.role() = 'authenticated');

-- Email templates policies
DROP POLICY IF EXISTS "Allow authenticated users to view email_templates" ON email_templates;
CREATE POLICY "Allow authenticated users to view email_templates"
ON email_templates FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to manage email_templates" ON email_templates;
CREATE POLICY "Allow authenticated users to manage email_templates"
ON email_templates FOR ALL
USING (auth.role() = 'authenticated');

-- Email campaigns policies
DROP POLICY IF EXISTS "Allow authenticated users full access to email_campaigns" ON email_campaigns;
CREATE POLICY "Allow authenticated users full access to email_campaigns"
ON email_campaigns FOR ALL
USING (auth.role() = 'authenticated');

-- Campaign recipients policies
DROP POLICY IF EXISTS "Allow authenticated users full access to campaign_recipients" ON campaign_recipients;
CREATE POLICY "Allow authenticated users full access to campaign_recipients"
ON campaign_recipients FOR ALL
USING (auth.role() = 'authenticated');

-- ==============================================================================
-- 4. VERIFICATION
-- ==============================================================================

-- Verify migration was applied
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'tasks'
AND column_name IN ('reminder_time', 'reminder_sent');

-- Verify RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true
ORDER BY tablename;

-- Count RLS policies
SELECT
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
