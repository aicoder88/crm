-- Migration: Add atomic create_invoice_with_items function
-- Created: 2025-11-25
-- Description: Adds an RPC function to atomically create invoices with their items in a single transaction

CREATE OR REPLACE FUNCTION create_invoice_with_items(
    p_invoice JSONB,
    p_items JSONB[]
) RETURNS UUID AS $$
DECLARE
    v_invoice_id UUID;
BEGIN
    -- Insert the invoice
    INSERT INTO invoices (
        customer_id,
        invoice_number,
        due_date,
        notes,
        status,
        subtotal,
        tax,
        total
    )
    SELECT 
        (p_invoice->>'customer_id')::UUID,
        p_invoice->>'invoice_number',
        (p_invoice->>'due_date')::DATE,
        p_invoice->>'notes',
        COALESCE(p_invoice->>'status', 'draft'),
        (p_invoice->>'subtotal')::DECIMAL,
        (p_invoice->>'tax')::DECIMAL,
        (p_invoice->>'total')::DECIMAL
    RETURNING id INTO v_invoice_id;

    -- Insert all invoice items
    INSERT INTO invoice_items (
        invoice_id,
        product_id,
        description,
        quantity,
        unit_price,
        total
    )
    SELECT 
        v_invoice_id,
        (item->>'product_id')::UUID,
        item->>'description',
        (item->>'quantity')::INTEGER,
        (item->>'unit_price')::DECIMAL,
        (item->>'total')::DECIMAL
    FROM unnest(p_items) AS item;

    -- Return the created invoice ID
    RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION create_invoice_with_items(JSONB, JSONB[]) IS 
'Atomically creates an invoice with all its items in a single transaction. Returns the created invoice ID.';
