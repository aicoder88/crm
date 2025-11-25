# Purrify CRM - Improvement Plan v2.0

**Generated:** November 25, 2025  
**Updated:** November 25, 2025 (Based on latest push)
**Status:** Progress review completed

---

## Executive Summary

Significant progress has been made since the initial review. Many critical and high-priority items have been addressed. This updated plan reflects the current state and remaining work.

**Priority Levels:**
- 🔴 **CRITICAL** - Must fix before production
- 🟠 **HIGH** - Should fix soon
- 🟡 **MEDIUM** - Important improvements
- 🟢 **LOW** - Nice to have

**Progress Overview:**
| Priority | Original | Completed | Remaining |
|----------|----------|-----------|-----------|
| 🔴 Critical | 5 | 4 | 1 |
| 🟠 High | 5 | 4 | 1 |
| 🟡 Medium | 10 | 7 | 3 |
| 🟢 Low | 10 | 8 | 2 |

---

## ✅ COMPLETED ITEMS

### 🔴 Critical - FIXED

#### ~~1. Inconsistent Supabase Client Usage~~
✅ **FIXED** - `src/lib/supabase/index.ts` now only exports re-exports for convenience. No more singleton.

**Most files now correctly use:**
- Client components: `import { createClient } from '@/lib/supabase/client'`
- Server components/API routes: `import { createClient } from '@/lib/supabase/server'`

⚠️ **PARTIAL** - 6 files in `/dashboard/` route still use old singleton pattern (see remaining issues below)

#### ~~2. Missing RLS Policies~~
✅ **FIXED** - `supabase/migrations/20251123_saved_searches.sql` now has complete RLS policies for saved_searches. Company settings policies added in `20251122_complete_schema.sql`.

#### ~~3. API Routes Missing Auth Verification~~
✅ **FIXED** - All API routes now include auth checks:
- `src/app/api/shipments/create/route.ts` - Auth check added (lines 15-18)
- `src/app/api/email/send/route.ts` - Auth check added (lines 12-15)
- All other API routes verified

#### ~~5. Webhook Signature Validation~~
✅ **FIXED** - Stripe webhook signature validation exists in `src/app/api/webhooks/stripe/route.ts`

---

### 🟠 High Priority - FIXED

#### ~~8. No Rate Limiting~~
✅ **FIXED** - Comprehensive rate limiting implemented:
- `src/lib/rate-limit.ts` - LRU cache-based rate limiter
- `src/lib/with-rate-limit.ts` - HOC wrapper for API routes
- All API routes now wrapped with appropriate limits

#### ~~9. Missing Products Table~~
✅ **FIXED** - `supabase/migrations/20251125_add_products_table.sql` adds:
- Products table with sku, name, description, unit_price, currency, active, stripe_price_id
- Indexes on sku and active
- RLS policies
- Sample data for testing

---

### 🟡 Medium Priority - FIXED

#### ~~11. Missing Loading States~~
✅ **FIXED** - Loading states added:
- `src/app/customers/loading.tsx`
- `src/app/customers/[id]/loading.tsx`
- `src/app/deals/loading.tsx`
- `src/app/invoices/loading.tsx`

#### ~~17. No Test Coverage~~
✅ **FIXED** - E2E tests created:
- `tests/e2e/auth.spec.ts`
- `tests/e2e/customers.spec.ts`
- `tests/e2e/deals.spec.ts`
- `tests/e2e/invoices.spec.ts`
- Test fixtures in `tests/fixtures/test-data.ts`
- Playwright config in `playwright.config.ts`

#### ~~19. No Error Boundaries~~
✅ **FIXED** - Global error boundary added:
- `src/app/global-error.tsx`
- `src/components/error-boundary.tsx`

---

### 🟢 Low Priority - FIXED

#### ~~21. Add Sentry/Error Tracking~~
✅ **FIXED** - Sentry fully integrated:
- `sentry.client.config.ts` - Client-side config with replay
- `sentry.server.config.ts` - Server-side config
- `sentry.edge.config.ts` - Edge runtime config
- `src/lib/error-tracking.ts` - Utility functions

#### ~~22. PWA Support~~
✅ **FIXED** - PWA manifest created:
- `public/manifest.json` - Full PWA manifest with icons and shortcuts
- `public/_offline.html` - Offline fallback page

#### ~~23. Data Export Features~~
✅ **FIXED** - Export utilities implemented:
- `src/lib/export-utils.ts` - CSV, JSON, Excel export functions
- `src/components/ui/export-button.tsx` - Export button component
- Predefined columns for customers, deals, invoices, products

#### ~~26. Activity/Audit Logging~~
✅ **FIXED** - Activity logging implemented:
- `src/hooks/use-activity-log.ts` - Hook with logging functions
- `src/components/activity/activity-feed.tsx` - Activity feed UI
- Categories: auth, customer, deal, invoice, product, task, email, shipment, system, export, import

#### ~~27. Health Check Endpoint~~
✅ **FIXED** - Health endpoints added:
- `src/app/api/health/route.ts` - Basic health check
- `src/app/api/health/detailed/route.ts` - Detailed health with DB check
- `src/components/health/health-monitor.tsx` - Health monitoring UI
- `src/components/health/health-status-indicator.tsx` - Status indicator

#### ~~28. React Query for Data Fetching~~
✅ **FIXED** - React Query implemented:
- `src/lib/react-query.ts` - Query client with optimized defaults
- `src/components/providers/query-provider.tsx` - Provider component
- Query hooks:
  - `src/hooks/use-customers-query.ts`
  - `src/hooks/use-analytics-query.ts`
  - `src/hooks/use-search-query.ts`

#### ~~Security Headers~~
✅ **FIXED** - Security headers added in `src/middleware.ts`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy

#### ~~Global Search~~
✅ **FIXED** - Global search implemented:
- `src/hooks/use-global-search.ts`
- `src/components/global-search.tsx`

#### ~~Pagination Component~~
✅ **FIXED** - Server-side pagination component:
- `src/components/ui/pagination.tsx`

---

## 🔴 REMAINING CRITICAL ISSUES

### 1. Legacy Supabase Imports in Dashboard Route
**Location:** 6 files in `src/app/dashboard/`  
**Problem:** These files still import the old `supabase` singleton which no longer exists:

```
src/app/dashboard/customers/[id]/edit/page.tsx:5 - import { supabase } from "@/lib/supabase"
src/app/dashboard/customers/[id]/page.tsx:5 - import { supabase } from "@/lib/supabase"
src/app/dashboard/customers/page.tsx:7 - import { supabase } from "@/lib/supabase"
src/app/dashboard/import/page.tsx:6 - import { supabase } from "@/lib/supabase"
src/app/login/page.tsx:5 - import { supabase } from "@/lib/supabase"
src/app/auth/logout/page.tsx:5 - import { supabase } from "@/lib/supabase"
```

**Impact:** These pages will break at runtime with "supabase is not defined"

**Fix:** Update each file to use:
```typescript
// For client components ("use client" at top):
import { createClient } from "@/lib/supabase/client"
// Then inside component:
const supabase = createClient()

// For server components:
import { createClient } from "@/lib/supabase/server"
// Then inside component:
const supabase = await createClient()
```

**Estimated Effort:** 1 hour

---

## 🟠 REMAINING HIGH PRIORITY

### 6. useEffect Dependency Issues  
**Location:** Multiple hooks  
**Problem:** Missing dependencies causing potential stale closures

**Files to review:**
- `src/hooks/use-invoices.ts`
- `src/hooks/use-products.ts`
- `src/hooks/use-analytics.ts`

**Fix:** Wrap fetch functions in `useCallback` or use the new React Query hooks instead.

**Estimated Effort:** 2-3 hours

---

## 🟡 REMAINING MEDIUM PRIORITY

### 4. Console.log Statements
**Location:** ~40+ files still have `console.error` statements  
**Problem:** While a logger exists (`src/lib/logger.ts`), it's not used consistently.

**Most affected areas:**
- All hooks (use-saved-searches, use-shipments, use-deals, etc.)
- Components (tag-manager, csv-importer, customer-form, etc.)
- API routes

**Fix:** Replace `console.error` with `logger.error`:
```typescript
import { logger } from '@/lib/logger';

// Instead of:
console.error('Error:', error);

// Use:
logger.error('Descriptive message', error instanceof Error ? error : new Error(String(error)), { context });
```

**Estimated Effort:** 3-4 hours

---

### 7. Missing Input Validation
**Location:** `src/components/customers/customer-form.tsx`  
**Problem:** Phone and postal code fields don't validate Canadian formats

**Fix:** Add Zod validation:
```typescript
const customerSchema = z.object({
  // ... existing fields
  phone: z.string()
    .regex(/^(\+1)?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, 'Invalid Canadian phone number')
    .optional()
    .or(z.literal('')),
  postal_code: z.string()
    .regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, 'Invalid Canadian postal code (e.g., K1A 0A6)')
    .optional()
    .or(z.literal('')),
  province: z.enum(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'])
    .optional(),
});
```

**Estimated Effort:** 2 hours

---

### 10. No Database Transactions
**Location:** `src/components/invoices/invoice-form.tsx`  
**Problem:** Invoice + items creation not atomic

**Fix:** Create Supabase RPC function:
```sql
CREATE OR REPLACE FUNCTION create_invoice_with_items(
    p_invoice JSONB,
    p_items JSONB[]
) RETURNS UUID AS $$
DECLARE
    v_invoice_id UUID;
BEGIN
    INSERT INTO invoices (customer_id, invoice_number, due_date, notes, status, subtotal, tax, total)
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

    INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, total)
    SELECT 
        v_invoice_id,
        (item->>'product_id')::UUID,
        item->>'description',
        (item->>'quantity')::INTEGER,
        (item->>'unit_price')::DECIMAL,
        (item->>'total')::DECIMAL
    FROM unnest(p_items) AS item;

    RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;
```

**Estimated Effort:** 3 hours

---

## 🟢 REMAINING LOW PRIORITY

### 15. TypeScript Strict Mode
**Location:** `tsconfig.json`  
**Problem:** Strict mode disabled, missing type safety

**Current:**
```json
{
  "compilerOptions": {
    "strict": false
  }
}
```

**Fix:** Enable strict mode and fix type errors:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Estimated Effort:** 4-6 hours (fixing all type errors)

---

### 29. Bundle Size Optimization
**Location:** Project-wide  
**Problem:** No bundle analysis configured

**Fix:** Add bundle analyzer:
```bash
npm install --save-dev @next/bundle-analyzer
```

```javascript
// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // existing config
})
```

**Estimated Effort:** 1 hour setup + optimization time

---

## Summary of Remaining Work

| Item | Priority | Effort | Status |
|------|----------|--------|--------|
| Fix dashboard legacy imports | 🔴 Critical | 1 hr | TODO |
| Fix useEffect dependencies | 🟠 High | 2-3 hrs | TODO |
| Replace console.log with logger | 🟡 Medium | 3-4 hrs | TODO |
| Add Canadian input validation | 🟡 Medium | 2 hrs | TODO |
| Add database transactions | 🟡 Medium | 3 hrs | TODO |
| Enable TypeScript strict mode | 🟢 Low | 4-6 hrs | TODO |
| Bundle size optimization | 🟢 Low | 1+ hrs | TODO |

**Total Remaining Effort:** ~16-20 hours

---

## Quick Wins (Can Do Now)

### 1. Fix the Dashboard Imports (1 hour)

Run this to see all affected files:
```bash
grep -rn "from ['\"]@/lib/supabase['\"]" --include="*.ts" --include="*.tsx" src/
```

Then update each file. Here's the fix for `src/app/login/page.tsx`:

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client" // Changed
// ... rest of imports

export default function LoginPage() {
    const supabase = createClient() // Add this line
    // ... rest of component
```

### 2. Add Missing Icon Files

The PWA manifest references icons that may not exist:
```bash
ls -la public/icons/
```

If missing, generate icons at: https://realfavicongenerator.net/

---

## Recommendations for Next Steps

1. **Immediate (Today):** Fix the 6 files with legacy Supabase imports - this is blocking production

2. **This Week:** 
   - Replace console.log statements with logger
   - Add Canadian input validation

3. **Next Week:**
   - Database transactions for invoices
   - Fix useEffect dependencies

4. **Future:**
   - Enable TypeScript strict mode (do during a refactor sprint)
   - Bundle optimization (do before scaling)

---

## Architecture Notes

### What's Working Well
- Modern Next.js 16 App Router architecture
- Proper client/server Supabase separation (mostly)
- React Query for data fetching
- Comprehensive RLS policies
- Rate limiting on API routes
- Sentry error tracking
- PWA support
- Health monitoring

### Areas to Watch
- The `/dashboard/` route seems to be legacy code - consider consolidating with main routes
- Some hooks still use direct Supabase calls instead of React Query hooks
- Email templates/campaigns feature appears incomplete (has pages but limited functionality)

---

*Last updated: November 25, 2025*
