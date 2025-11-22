# Phase V Implementation - Quick Start Guide

## ✅ What's Ready to Use

The following features have been implemented and are ready for use after configuration:

### 1. Product Catalog Management
- Navigate to `/products` to manage your product catalog
- Add, edit, and delete products  
- Soft delete keeps products in database but marks them inactive

### 2. Invoice Viewing
- Navigate to `/invoices` to view all invoices
- Filter by customer, status, or date range
- View invoice details including line items

### 3. Stripe Integration (Backend Ready)
- Webhook handler at `/api/webhooks/stripe` ready to receive events
- Functions to create customers, prices, and invoices in Stripe
- Payment status sync via webhooks

---

## 🔧 Required Setup Steps

Before using Phase V features, complete these steps:

### Step 1: Run Database Migration

Copy and run this SQL in your Supabase SQL Editor:

```bash
# Open: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
# Then paste the contents of:
/Users/macpro/dev/crm/supabase/migrations/phase-5-invoicing.sql
```

This creates:
- `products` table
- Updates `invoices` table with new columns
- Adds `generate_invoice_number()` function
- Seeds 5 sample products

### Step 2: Configure Environment Variables

Add to `.env.local`:

```bash
# Get these from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# After deploying, configure webhook and get this
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

### Step 3: Test Product Management

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000/products`
3. Click "Add Product"
4. Fill in:
   - SKU: `TEST-001`
   - Name: `Test Product`
   - Price: `10.00`
5. Verify product appears in list

---

## 📝 What's Missing (Future Work)

### Critical for Full Functionality

**Invoice Creation Form** - Currently you can only VIEW invoices, not CREATE them via UI
- Need multi-step wizard to:
  - Select customer
  - Add line items (products + quantities)
  - Set tax, shipping, discount
  - Generate invoice

**Invoice Detail Page** - View individual invoice with actions
- Send to customer via Stripe
- Mark as paid manually
- Download PDF
- Edit/delete drafts

### Nice to Have

- Dashboard metrics (revenue, invoice counts)
- Customer invoice history on customer detail page
- PDF generation for offline invoices
- Bulk operations

---

## 🏗️ Architecture Overview

### Data Flow

```
1. Create Product → Supabase products table
2. Create Invoice → Supabase invoices + invoice_items tables
3. Send Invoice → Stripe API → Customer receives email
4. Payment → Stripe Webhook → Update invoice status to "paid"
```

### Files Created (15 total)

**Database**:
- `supabase/migrations/phase-5-invoicing.sql`

**Types**:
- `src/types/index.ts` (updated)

**Hooks**:
- `src/hooks/use-products.ts`
- `src/hooks/use-invoices.ts`

**Utilities**:
- `src/lib/stripe.ts`
- `src/lib/invoice-utils.ts`

**API**:
- `src/app/api/webhooks/stripe/route.ts`

**Components**:
- `src/components/products/product-form.tsx`
- `src/components/products/product-dialog.tsx`
- `src/components/products/product-list.tsx`
- `src/components/invoices/invoice-list.tsx`
- `src/components/invoices/invoice-status-badge.tsx`

**Pages**:
- `src/app/products/page.tsx`
- `src/app/invoices/page.tsx`

**Navigation**:
- `src/components/app-sidebar.tsx` (updated)

---

## 🎯 Recommended Next Steps

### Immediate (Complete Basic Functionality)

1. **Run database migration** (5 minutes)
2. **Configure Stripe test keys** (10 minutes)
3. **Test product CRUD** (5 minutes)
4. **Build invoice creation form** (2-3 hours)
   - Use existing customer-form.tsx as reference
   - Multi-step with product selection
   - Calculate totals in real-time

### Short Term (Polish)

5. **Build invoice detail page** (1 hour)
   - Display invoice with formatting
   - Add Send/Pay/Delete actions
6. **Update dashboard** (30 minutes)
   - Show real product count
   - Show outstanding invoices
   - Show revenue metrics

### Long Term (Enhancement)

7. **PDF generation** (2 hours)
8. **Customer invoice tab** (1 hour)
9. **Advanced filtering** (1 hour)
10. **Stripe webhook testing in staging** (30 minutes)

---

## 📚 Key Functions to Know

### Creating an Invoice Programmatically

```typescript
import { useInvoice } from '@/hooks/use-invoices';

const { createInvoice } = useInvoice(null);

await createInvoice(
  {
    customer_id: 'uuid',
    subtotal: 100,
    tax: 13,
    shipping: 0,
    discount: 0,
    total: 113,
    amount: 113, // legacy field
    currency: 'CAD',
    status: 'draft',
    due_date: '2025-12-31',
    // ...other fields
  },
  [
    {
      product_sku: 'PURR-10LB',
      description: 'Purrify 10lb',
      quantity: 2,
      unit_price: 50,
      total: 100,
    }
  ]
);
```

### Calculating Tax

```typescript
import { getProvincialTaxRate, calculateTax } from '@/lib/invoice-utils';

const customer = { province: 'ON' }; // Ontario
const taxRate = getProvincialTaxRate(customer.province); // 13%
const subtotal = 100;
const tax = calculateTax(subtotal, taxRate); // 13.00
```

---

## 🐛 Known Issues

1. **TypeScript warnings in product-form** - Type inference issues with react-hook-form (fixed, but may show in IDE)
2. **No invoice creation UI** - Can only create via API/code currently
3. **Stripe integration untested** - Needs actual Stripe account configuration

---

## ❓ Need Help?

Check the detailed walkthrough: [walkthrough.md](file:///Users/macpro/.gemini/antigravity/brain/eb56bdd6-8c07-45fc-9014-987b26dba336/walkthrough.md)

Or review the original implementation plan: [implementation_plan.md](file:///Users/macpro/.gemini/antigravity/brain/eb56bdd6-8c07-45fc-9014-987b26dba336/implementation_plan.md)
