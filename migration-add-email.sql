-- Migration: Add email column to customers table
-- Run this in Supabase SQL Editor if you already have the customers table created

ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
