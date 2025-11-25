-- Migration: Add products table
-- Date: November 25, 2025

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  unit_price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'CAD',
  active BOOLEAN DEFAULT true,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active) WHERE active = true;

-- RLS Policy
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users full access to products" ON products;
CREATE POLICY "Allow authenticated users full access to products"
ON products FOR ALL
USING (auth.role() = 'authenticated');

-- Insert some sample products for testing
INSERT INTO products (sku, name, description, unit_price) VALUES
('CAT-TREAT-001', 'Premium Cat Treats - Salmon', 'Delicious salmon treats for cats', 12.99),
('DOG-TOY-001', 'Interactive Dog Toy - Rope Ball', 'Durable rope ball for active dogs', 8.99),
('BIRD-FOOD-001', 'Premium Bird Seed Mix', 'High-quality seed mix for all bird types', 15.99),
('CAT-LITTER-001', 'Clumping Cat Litter - 20lb', 'Premium clumping clay litter', 24.99),
('DOG-FOOD-001', 'Dry Dog Food - Chicken & Rice', 'Natural chicken and rice formula', 45.99)
ON CONFLICT (sku) DO NOTHING;