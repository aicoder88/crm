# Purrify CRM - Improvement Plan

**Generated:** November 25, 2025  
**Status:** Comprehensive code review completed

---

## Executive Summary

The Purrify CRM is a well-structured Next.js 16 application with a solid foundation. However, there are critical issues that need addressing before production use, along with numerous improvements for performance, security, and maintainability.

**Priority Levels:**
- 🔴 **CRITICAL** - Must fix before production
- 🟠 **HIGH** - Should fix soon
- 🟡 **MEDIUM** - Important improvements
- 🟢 **LOW** - Nice to have

---

## 🔴 CRITICAL ISSUES

### 1. Inconsistent Supabase Client Usage
**Location:** Multiple files  
**Problem:** The codebase uses different import patterns for Supabase client, causing potential auth state mismatches.

**Files affected:**
- `src/app/login/page.tsx` - imports `supabase` from `@/lib/supabase`
- `src/hooks/use-customers.ts` - imports `supabase` from `@/lib/supabase`
- `src/app/api/shipments/create/route.ts` - imports `createClient` from `@/lib/supabase` (not `@/lib/supabase/server`)
- Other files correctly use `@/lib/supabase/client` or `@/lib/supabase/server`

**Fix:**
```typescript
// Client components should use:
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

// Server components/API routes should use:
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();

// Remove the singleton export from src/lib/supabase/index.ts
```

---

### 2. Missing RLS Policies for Company Settings & Saved Searches
**Location:** `supabase/migrations/`  
**Problem:** The `company_settings` and `saved_searches` tables have RLS enabled but no policies are defined in the complete setup migration.

**Fix:** Add to migration:
```sql
-- Company settings policies
DROP POLICY IF EXISTS "Allow authenticated users full access to company_settings" ON company_settings;
CREATE POLICY "Allow authenticated users full access to company_settings"
ON company_settings FOR ALL
USING (auth.role() = 'authenticated');

-- Saved searches policies
DROP POLICY IF EXISTS "Allow users to manage own saved_searches" ON saved_searches;
CREATE POLICY "Allow users to manage own saved_searches"
ON saved_searches FOR ALL
USING (auth.uid() = user_id);
```

---

### 3. API Routes Missing Auth Verification
**Location:** `src/app/api/`  
**Problem:** API routes create Supabase client but don't verify user authentication before processing.

**Files affected:**
- `src/app/api/shipments/create/route.ts`
- `src/app/api/email/send/route.ts`

**Fix:**
```typescript
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    
    // Add auth check at the start
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // ... rest of handler
}
```

---

### 4. Console.log Statements in Production Code
**Location:** Multiple files  
**Problem:** Sensitive data being logged including customer info.

**Files affected:**
- `src/app/customers/page.tsx` (lines 13, 49-51)
- `src/app/api/webhooks/stripe/route.ts`
- Various hooks

**Fix:** Remove all `console.log` statements or replace with proper logging:
```typescript
// Use the existing logger utility
import { logger } from '@/lib/logger';
logger.info('Customers fetched', { count: customers.length });
```

---

### 5. Webhook Secret Validation Missing in Resend
**Location:** `src/app/api/webhooks/resend/route.ts`  
**Problem:** Need to verify this file properly validates webhook signatures.

**Fix:** Ensure signature validation exists:
```typescript
import crypto from 'crypto';

function verifyResendWebhook(payload: string, signature: string, secret: string): boolean {
    const expected = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

---

## 🟠 HIGH PRIORITY

### 6. No Error Handling in useEffect Dependencies
**Location:** Multiple hooks  
**Problem:** Missing dependency arrays or incorrect dependencies causing potential infinite loops or stale closures.

**Files affected:**
- `src/hooks/use-invoices.ts` - `fetchInvoice` uses `id` but not in deps
- `src/hooks/use-products.ts` - `fetchProduct` uses `id` but not in deps
- `src/hooks/use-analytics.ts` - Multiple fetch functions without stable refs

**Fix:** Use useCallback or include in dependencies:
```typescript
const fetchProduct = useCallback(async () => {
    if (!id) return;
    // ... implementation
}, [id, supabase]);

useEffect(() => {
    fetchProduct();
}, [fetchProduct]);
```

---

### 7. Missing Input Validation on Forms
**Location:** `src/components/customers/customer-form.tsx`  
**Problem:** Phone, postal code fields don't validate Canadian formats.

**Fix:**
```typescript
const formSchema = z.object({
    // ... existing fields
    phone: z.string()
        .regex(/^(\+1)?[\s.-]?\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}$/, 
            'Invalid phone format')
        .optional()
        .or(z.literal("")),
    postal_code: z.string()
        .regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, 
            'Invalid Canadian postal code')
        .optional()
        .or(z.literal("")),
    province: z.enum(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'])
        .optional(),
});
```

---

### 8. No Rate Limiting on API Routes
**Location:** `src/app/api/`  
**Problem:** API routes vulnerable to abuse.

**Fix:** Implement rate limiting middleware:
```typescript
// src/lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

const rateLimitCache = new LRUCache<string, number[]>({
    max: 500,
    ttl: 60000, // 1 minute
});

export function rateLimit(identifier: string, limit: number = 10): boolean {
    const now = Date.now();
    const timestamps = rateLimitCache.get(identifier) || [];
    const recent = timestamps.filter(t => now - t < 60000);
    
    if (recent.length >= limit) {
        return false;
    }
    
    rateLimitCache.set(identifier, [...recent, now]);
    return true;
}
```

---

### 9. Missing Products Table in Base Schema
**Location:** `supabase-schema.sql`  
**Problem:** The `products` table is referenced but not defined in the base schema.

**Fix:** Add to schema:
```sql
-- Products table
CREATE TABLE products (
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

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_active ON products(active) WHERE active = true;
```

---

### 10. No Database Transactions for Multi-Table Operations
**Location:** `src/components/invoices/invoice-form.tsx`, `src/hooks/use-invoices.ts`  
**Problem:** Invoice creation with items isn't atomic - if item creation fails, orphan invoices remain.

**Fix:** Use Supabase RPC function for atomic operations:
```sql
-- Create function for atomic invoice creation
CREATE OR REPLACE FUNCTION create_invoice_with_items(
    p_invoice JSONB,
    p_items JSONB[]
) RETURNS UUID AS $$
DECLARE
    v_invoice_id UUID;
BEGIN
    -- Insert invoice
    INSERT INTO invoices (customer_id, invoice_number, subtotal, tax, shipping, discount, total, amount, currency, status, due_date, notes, stripe_invoice_id)
    VALUES (
        (p_invoice->>'customer_id')::UUID,
        p_invoice->>'invoice_number',
        (p_invoice->>'subtotal')::DECIMAL,
        (p_invoice->>'tax')::DECIMAL,
        (p_invoice->>'shipping')::DECIMAL,
        (p_invoice->>'discount')::DECIMAL,
        (p_invoice->>'total')::DECIMAL,
        (p_invoice->>'amount')::DECIMAL,
        p_invoice->>'currency',
        p_invoice->>'status',
        (p_invoice->>'due_date')::DATE,
        p_invoice->>'notes',
        p_invoice->>'stripe_invoice_id'
    )
    RETURNING id INTO v_invoice_id;
    
    -- Insert items
    INSERT INTO invoice_items (invoice_id, product_sku, description, quantity, unit_price, total)
    SELECT 
        v_invoice_id,
        item->>'product_sku',
        item->>'description',
        (item->>'quantity')::INTEGER,
        (item->>'unit_price')::DECIMAL,
        (item->>'total')::DECIMAL
    FROM unnest(p_items) AS item;
    
    RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 🟡 MEDIUM PRIORITY

### 11. Missing Loading States for Data Tables
**Location:** `src/app/customers/page.tsx`  
**Problem:** Server component doesn't show loading state while fetching.

**Fix:** Add loading.tsx:
```typescript
// src/app/customers/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-48" />
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-36" />
                </div>
            </div>
            <Skeleton className="h-[500px] w-full" />
        </div>
    );
}
```

---

### 12. No Optimistic Updates in Kanban Board
**Location:** `src/components/deals/kanban-board.tsx`  
**Problem:** UI waits for server response before updating, causing lag.

**Fix:**
```typescript
const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id as string;
    const newStage = over.id as string;
    const deal = deals.find(d => d.id === dealId);

    if (deal && deal.stage !== newStage) {
        // Optimistic update - update local state immediately
        const originalStage = deal.stage;
        
        // Call parent to update local state optimistically
        onOptimisticUpdate?.(dealId, { stage: newStage });
        
        try {
            await onDealUpdate(dealId, { stage: newStage });
        } catch (error) {
            // Rollback on failure
            onOptimisticUpdate?.(dealId, { stage: originalStage });
            toast.error('Failed to update deal');
        }
    }
};
```

---

### 13. Missing Pagination for Large Datasets
**Location:** `src/app/customers/page.tsx`  
**Problem:** Hardcoded `.limit(1000)` will cause issues with growth.

**Fix:** Implement cursor-based pagination:
```typescript
// src/app/customers/page.tsx
export default async function CustomersPage({
    searchParams,
}: {
    searchParams: { page?: string; limit?: string };
}) {
    const page = parseInt(searchParams.page || '1');
    const limit = parseInt(searchParams.limit || '50');
    const offset = (page - 1) * limit;

    const supabase = await createClient();
    
    // Get total count
    const { count } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

    const { data: customers, error } = await supabase
        .from('customers')
        .select(`...`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    return (
        <>
            <CustomersTable customers={customers} />
            <Pagination 
                currentPage={page} 
                totalPages={Math.ceil((count || 0) / limit)} 
                limit={limit}
            />
        </>
    );
}
```

---

### 14. Duplicate CSS Variables
**Location:** `src/app/globals.css`  
**Problem:** `:root` and `.dark` have identical values - unnecessary duplication.

**Fix:** Since this is a dark-mode-only app:
```css
@layer base {
    :root {
        --radius: 0.5rem;
        /* All variables here */
    }
    /* Remove duplicate .dark block entirely */
}
```

---

### 15. No TypeScript Strict Mode
**Location:** `tsconfig.json`  
**Problem:** Missing strict TypeScript settings allows type issues.

**Fix:**
```json
{
    "compilerOptions": {
        "strict": true,
        "noUncheckedIndexedAccess": true,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true,
        "forceConsistentCasingInFileNames": true
    }
}
```

---

### 16. Missing Email Templates Table Definition
**Location:** `supabase-schema.sql`  
**Problem:** `email_templates` table referenced but not defined.

**Fix:**
```sql
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    category TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    template_id UUID REFERENCES email_templates(id),
    status TEXT CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')) DEFAULT 'draft',
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaign_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'sent', 'opened', 'clicked', 'bounced', 'unsubscribed')) DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 17. No Test Coverage
**Location:** Project root  
**Problem:** Playwright is installed but no tests exist.

**Fix:** Add test structure:
```
tests/
├── e2e/
│   ├── auth.spec.ts
│   ├── customers.spec.ts
│   ├── invoices.spec.ts
│   └── deals.spec.ts
├── unit/
│   ├── hooks/
│   └── utils/
└── fixtures/
    └── test-data.ts
```

Example test:
```typescript
// tests/e2e/customers.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Customers', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('[name="email"]', process.env.TEST_EMAIL!);
        await page.fill('[name="password"]', process.env.TEST_PASSWORD!);
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');
    });

    test('can create a new customer', async ({ page }) => {
        await page.goto('/customers/new');
        await page.fill('[name="store_name"]', 'Test Pet Store');
        await page.selectOption('[name="status"]', 'Qualified');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/customers$/);
    });
});
```

---

## 🟢 LOW PRIORITY (Nice to Have)

### 18. Add Sentry or Error Tracking
**Location:** `src/components/error-boundary.tsx`  
**Problem:** Errors only logged to console.

**Fix:**
```typescript
// Install: npm install @sentry/nextjs
// src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
});
```

---

### 19. Add PWA Support
**Location:** `next.config.ts`  
**Problem:** Mobile experience could be improved.

**Fix:**
```typescript
// Install: npm install next-pwa
import withPWA from 'next-pwa';

const nextConfig = withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
})({
    // existing config
});
```

---

### 20. Add Data Export Features
**Location:** New feature  
**Problem:** No way to export customer data or reports.

**Fix:** Add export functionality:
```typescript
// src/lib/export-utils.ts
export function exportToCSV<T extends Record<string, any>>(
    data: T[],
    filename: string,
    columns: { key: keyof T; header: string }[]
) {
    const headers = columns.map(c => c.header).join(',');
    const rows = data.map(row => 
        columns.map(c => `"${String(row[c.key] || '').replace(/"/g, '""')}"`).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
}
```

---

### 21. Add Keyboard Navigation Improvements
**Location:** `src/components/keyboard-shortcuts-dialog.tsx`  
**Problem:** Limited keyboard navigation in tables.

**Fix:** Add arrow key navigation to data tables and forms.

---

### 22. Implement Search Indexing
**Location:** Database  
**Problem:** Text search is basic.

**Fix:**
```sql
-- Add full-text search
ALTER TABLE customers ADD COLUMN search_vector tsvector;

CREATE INDEX idx_customers_search ON customers USING GIN(search_vector);

CREATE OR REPLACE FUNCTION update_customer_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english',
        coalesce(NEW.store_name, '') || ' ' ||
        coalesce(NEW.email, '') || ' ' ||
        coalesce(NEW.city, '') || ' ' ||
        coalesce(NEW.notes, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customer_search_vector_update
BEFORE INSERT OR UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION update_customer_search_vector();
```

---

### 23. Add Activity Logging
**Location:** New feature  
**Problem:** No audit trail for changes.

**Fix:**
```sql
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);
```

---

### 24. Add Health Check Endpoint
**Location:** `src/app/api/`  
**Problem:** No way to monitor app health.

**Fix:**
```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    const checks = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {} as Record<string, boolean>,
    };

    try {
        const supabase = await createClient();
        const { error } = await supabase.from('customers').select('id').limit(1);
        checks.services.database = !error;
    } catch {
        checks.services.database = false;
    }

    const allHealthy = Object.values(checks.services).every(Boolean);
    checks.status = allHealthy ? 'healthy' : 'degraded';

    return NextResponse.json(checks, {
        status: allHealthy ? 200 : 503,
    });
}
```

---

## Performance Optimizations

### 25. Add React Query or SWR for Data Fetching
**Problem:** Current hooks don't cache or dedupe requests.

```typescript
// Install: npm install @tanstack/react-query
// Replace manual fetch hooks with React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useCustomers() {
    return useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('customers')
                .select('id, store_name')
                .order('store_name');
            if (error) throw error;
            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
```

---

### 26. Add Database Connection Pooling Config
**Location:** Supabase Dashboard  
**Problem:** Default connection limits may not be optimal.

**Action:** Configure in Supabase Dashboard:
- Enable connection pooling (Transaction mode)
- Set appropriate pool size for expected concurrent users

---

### 27. Optimize Bundle Size
**Location:** `package.json`  
**Problem:** Large bundle with unused code.

**Fix:** Add bundle analyzer:
```bash
npm install @next/bundle-analyzer
```

```typescript
// next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
```

---

## Security Improvements

### 28. Add CSP Headers
**Location:** `src/middleware.ts`  
**Problem:** Missing Content Security Policy.

**Fix:**
```typescript
response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com;"
);
```

---

### 29. Add CORS Configuration for API Routes
**Location:** `src/app/api/`  
**Problem:** CORS not explicitly configured.

**Fix:**
```typescript
// src/lib/cors.ts
export function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}
```

---

## Database Schema Improvements

### 30. Add Soft Deletes
**Location:** All main tables  
**Problem:** Hard deletes lose data permanently.

**Fix:**
```sql
-- Add to all main tables
ALTER TABLE customers ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE deals ADD COLUMN deleted_at TIMESTAMPTZ;

-- Update RLS policies to exclude deleted
CREATE POLICY "Exclude deleted customers"
ON customers FOR SELECT
USING (auth.role() = 'authenticated' AND deleted_at IS NULL);
```

---

## Summary of Action Items

### Immediate (This Week) - ✅ COMPLETED
1. ✅ Fix inconsistent Supabase client imports - DONE
2. ✅ Add auth verification to API routes - DONE  
3. ✅ Remove console.log statements - DONE
4. ✅ Add missing RLS policies - DONE
5. ✅ Add products table to schema - DONE

### Short Term (Next 2 Weeks)
6. Add proper error handling to hooks
7. Implement input validation
8. Add rate limiting
9. Create loading states
10. Add database transactions for multi-table ops

### Medium Term (Next Month)
11. Add pagination
12. Implement optimistic updates
13. Add test coverage
14. Enable TypeScript strict mode
15. Add full-text search

### Long Term (Ongoing)
16. Add error tracking (Sentry)
17. PWA support
18. Activity logging
19. Performance monitoring
20. Regular security audits

---

## Files to Create/Modify

### New Files Needed
- `src/app/customers/loading.tsx`
- `src/app/api/health/route.ts`
- `src/lib/rate-limit.ts`
- `src/lib/cors.ts`
- `tests/e2e/*.spec.ts`
- `supabase/migrations/YYYYMMDD_add_products.sql`
- `supabase/migrations/YYYYMMDD_add_email_tables.sql`
- `supabase/migrations/YYYYMMDD_add_audit_log.sql`

### Files to Modify
- `src/lib/supabase/index.ts` - Remove singleton
- `src/app/login/page.tsx` - Fix import
- `src/hooks/use-customers.ts` - Fix import
- `src/app/api/shipments/create/route.ts` - Fix import, add auth
- `src/app/api/email/send/route.ts` - Add auth check
- `src/middleware.ts` - Add CSP
- `tsconfig.json` - Enable strict mode
- `src/app/globals.css` - Remove duplicate vars

---

## Estimated Effort

| Priority | Items | Est. Hours |
|----------|-------|------------|
| Critical | 5 | 8-12 |
| High | 5 | 16-24 |
| Medium | 10 | 24-32 |
| Low | 10 | 20-30 |
| **Total** | **30** | **68-98 hours** |

---

*Generated by Claude Code Review*
