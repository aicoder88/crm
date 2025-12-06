# Purrify CRM - Improvement Plan

**Generated:** December 6, 2025
**Status:** Comprehensive analysis completed
**Branch:** `claude/plan-improvements-01Lfk3Z2fv76kvB47EZ7NhBJ`

---

## Executive Summary

The Purrify CRM is a production-grade B2B CRM application built with Next.js 16, React 19, TypeScript, and Supabase. After a comprehensive analysis of 95 component files, 25 custom hooks, and 18 utility libraries, this plan outlines 34 improvements across security, performance, code quality, UI/UX, and testing.

**Priority Levels:**
- 🔴 **CRITICAL** - Security vulnerabilities, must fix before production
- 🟠 **HIGH** - Code quality & performance issues affecting reliability
- 🟡 **MEDIUM** - UI/UX consistency and developer experience
- 🟢 **LOW** - Feature enhancements and architectural refinements

---

## 🔴 CRITICAL PRIORITY - Security & Stability

### 1. Implement Webhook Signature Verification
**Location:** `src/app/api/webhooks/resend/route.ts` (lines 15-32)
**Problem:** Webhook signature verification is incomplete - headers are checked but verification logic is not implemented.

**Current Code:**
```typescript
if (process.env.RESEND_WEBHOOK_SECRET) {
    if (!signature || !timestamp || !svixId) {
        console.warn('Missing webhook signature headers');
        // verification isn't implemented
    }
}
```

**Fix:**
```typescript
import crypto from 'crypto';

function verifyResendWebhook(payload: string, signature: string, secret: string): boolean {
    const expected = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// In route handler:
const isValid = verifyResendWebhook(rawBody, signature, process.env.RESEND_WEBHOOK_SECRET!);
if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

---

### 2. Replace All `console.*` with `logger.*`
**Location:** 8+ API routes and utility files
**Problem:** Direct console statements bypass the logging infrastructure and Sentry error tracking.

**Files affected:**
- `src/app/api/email/send/route.ts` (lines 102, 111)
- `src/app/api/webhooks/stripe/route.ts` (lines 27, 52, 83, 101, 113)
- `src/app/api/shipments/create/route.ts` (lines 69, 122)
- `src/app/api/shipments/[id]/refresh/route.ts` (lines 89, 100)
- `src/app/api/shipments/[id]/cancel/route.ts` (lines 50, 77)
- `src/app/api/webhooks/resend/route.ts` (lines 22, 44, 111, 117)
- `src/app/dashboard/customers/page.tsx` (lines 25, 50)
- `src/lib/stripe.ts` (lines 9, 51, 91, 171, 209)

**Fix:**
```typescript
// Replace all instances:
// Before:
console.error('Failed to create timeline event:', timelineError);

// After:
import { logger } from '@/lib/logger';
logger.error('Failed to create timeline event', { error: timelineError });
```

---

### 3. Enable Row Level Security (RLS) Policies
**Location:** `company_settings` and `saved_searches` tables
**Problem:** RLS is enabled but no policies are defined.

**Fix:** Add to migration:
```sql
-- Company settings policies
CREATE POLICY "Allow authenticated users full access to company_settings"
ON company_settings FOR ALL
USING (auth.role() = 'authenticated');

-- Saved searches policies
CREATE POLICY "Allow users to manage own saved_searches"
ON saved_searches FOR ALL
USING (auth.uid() = user_id);
```

---

### 4. Add Zod Validation to API Routes
**Location:** `src/app/api/shipments/create/route.ts` (lines 21-38)
**Problem:** Only basic required field checks, no type or format validation.

**Current Code:**
```typescript
const body = await request.json();
if (!customer_id || !weight || !length || !width || !height || !service_level) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
}
```

**Fix:**
```typescript
import { z } from 'zod';

const shipmentSchema = z.object({
    customer_id: z.string().uuid(),
    weight: z.number().positive(),
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    service_level: z.enum(['standard', 'express', 'overnight']),
});

const result = shipmentSchema.safeParse(body);
if (!result.success) {
    return NextResponse.json({
        error: 'Validation failed',
        details: result.error.flatten()
    }, { status: 400 });
}
```

---

## 🟠 HIGH PRIORITY - Code Quality

### 5. Replace 120+ `any` Types with Proper Types
**Location:** Throughout codebase
**Problem:** Reduces type safety and IDE support.

**Examples:**
| File | Line | Current | Fix |
|------|------|---------|-----|
| `src/app/api/webhooks/resend/route.ts` | 49 | `Record<string, any>` | `Partial<EmailRecord>` |
| `src/app/api/shipments/[id]/refresh/route.ts` | 51 | `status as any` | `status as ShipmentStatus` |
| `src/components/invoices/invoice-form.tsx` | 354 | `value: any` | `value: InvoiceStatus` |

---

### 6. Extract API Route Middleware
**Location:** Create `src/lib/api-middleware.ts`
**Problem:** Auth check and error handling pattern repeated in all 8 API routes.

**Current Pattern (repeated 8x):**
```typescript
try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // ... route logic
} catch (error: any) {
    console.error('...');
    return NextResponse.json({ error: error.message || 'Failed to...' }, { status: 500 });
}
```

**Fix:**
```typescript
// src/lib/api-middleware.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

type ApiHandler = (
    request: NextRequest,
    context: { user: User; supabase: SupabaseClient }
) => Promise<NextResponse>;

export function withAuth(handler: ApiHandler) {
    return async (request: NextRequest) => {
        try {
            const supabase = await createClient();
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            return handler(request, { user, supabase });
        } catch (error) {
            logger.error('API error', { error });
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}
```

---

### 7. Fix Silent Error Swallowing
**Location:** Multiple API routes
**Problem:** Errors are logged but not tracked or reported to users.

**Examples:**

| File | Issue |
|------|-------|
| `src/app/api/email/send/route.ts:101-104` | Timeline event failure silently ignored |
| `src/app/api/shipments/[id]/cancel/route.ts:47-52` | NetParcel cancellation error suppressed |
| `src/app/api/shipments/[id]/refresh/route.ts:84-90` | Shipping events insertion failure ignored |

**Fix:** Use `ErrorTracker.captureError()` and inform users:
```typescript
if (timelineError) {
    ErrorTracker.captureError(timelineError, { context: 'timeline_creation' });
    // Still return success but include warning
    return NextResponse.json({
        success: true,
        warning: 'Email sent but timeline update failed'
    });
}
```

---

### 8. Remove Hardcoded Placeholder Values
**Location:** Multiple files
**Problem:** Default values may cause data integrity issues.

| File | Line | Issue |
|------|------|-------|
| `src/lib/netparcel.ts` | 166 | `origin_postal_code: params.originPostalCode \|\| 'M5H2N2'` |
| `src/components/invoices/invoice-form.tsx` | 137 | `stripe_invoice_id: 'manual-' + invoiceNumber` |

**Fix:** Make these required or explicitly mark as test data.

---

## 🟠 HIGH PRIORITY - Performance

### 9. Add Pagination to Customer/Invoice Lists
**Location:** `src/app/dashboard/customers/page.tsx`, `src/app/customers/page.tsx`
**Problem:** Currently loads ALL records without limit, causing performance issues at scale.

**Fix:**
```typescript
export default async function CustomersPage({
    searchParams,
}: {
    searchParams: { page?: string; limit?: string };
}) {
    const page = parseInt(searchParams.page || '1');
    const limit = parseInt(searchParams.limit || '50');
    const offset = (page - 1) * limit;

    const { count } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

    const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .range(offset, offset + limit - 1);

    return (
        <>
            <CustomersTable customers={customers} />
            <Pagination
                currentPage={page}
                totalPages={Math.ceil((count || 0) / limit)}
            />
        </>
    );
}
```

---

### 10. Fix N+1 Query Patterns
**Location:** `src/app/customers/customers-table.tsx` (lines 17-96)
**Problem:** Client-side filtering runs 8 separate filter operations over the full array.

**Current:**
```typescript
filtered = filtered.filter(c => /* status */)
filtered = filtered.filter(c => /* email */)
filtered = filtered.filter(c => /* tags */)
// ... 5 more filters
```

**Fix:** Use server-side filtering or combine into single pass:
```typescript
const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
        return (
            matchesStatus(customer, filters.status) &&
            matchesEmail(customer, filters.email) &&
            matchesTags(customer, filters.tags) &&
            // ... all conditions in one pass
        );
    });
}, [customers, filters]);
```

---

### 11. Batch Stripe Invoice Item Creation
**Location:** `src/lib/stripe.ts` (lines 122-134)
**Problem:** Sequential API calls for each invoice item.

**Current:**
```typescript
for (const item of invoice.items) {
    await stripe.invoiceItems.create({...});  // Sequential!
}
```

**Fix:**
```typescript
await Promise.all(
    invoice.items.map(item =>
        stripe.invoiceItems.create({
            customer: stripeCustomerId,
            price_data: { ... },
            quantity: item.quantity,
        })
    )
);
```

---

### 12. Add Cache-Control Headers to API Routes
**Location:** All API routes
**Problem:** No caching headers set, every request hits the server.

**Fix:**
```typescript
return NextResponse.json(data, {
    headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
    },
});
```

---

### 13. Convert Data-Fetching Pages to Server Components
**Location:** `src/app/dashboard/customers/page.tsx` (lines 17-56)
**Problem:** Uses `useState` and `useEffect` causing client waterfall.

**Fix:** Use React Server Components for initial data:
```typescript
// Server Component (no 'use client')
export default async function CustomersPage() {
    const supabase = await createClient();
    const { data: customers } = await supabase
        .from('customers')
        .select('*');

    return <CustomersTable initialData={customers} />;
}
```

---

## 🟡 MEDIUM PRIORITY - UI/UX Consistency

### 14. Create Reusable `<LoadingState />` Component
**Location:** Create `src/components/ui/loading-state.tsx`
**Problem:** Inconsistent loading UI across components.

**Current Inconsistencies:**
| Component | Loading Style |
|-----------|---------------|
| `ProductList` | `<div>Loading products...</div>` (text only) |
| `TaskList` | `<Loader2 className="h-5 w-5" />` (small spinner) |
| `InvoiceForm` | `<Loader2 className="h-8 w-8" />` (large spinner) |

**Fix:**
```typescript
// src/components/ui/loading-state.tsx
interface LoadingStateProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}

export function LoadingState({ size = 'md', message }: LoadingStateProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-2 p-8">
            <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
    );
}
```

---

### 15. Standardize Empty State Component Usage
**Location:** Multiple components
**Problem:** `<EmptyState />` component exists but is underutilized.

**Apply to:**
- `src/components/products/product-list.tsx`
- `src/components/tasks/task-list.tsx`
- `src/components/ui/data-table.tsx`

---

### 16. Add aria-labels to Icon-Only Buttons
**Location:** Header, Sidebar, action buttons
**Problem:** Missing accessibility labels on interactive elements.

**Example Fix:**
```typescript
// Before:
<Button variant="ghost" size="icon">
    <Bell className="h-5 w-5" />
</Button>

// After:
<Button variant="ghost" size="icon" aria-label="View notifications">
    <Bell className="h-5 w-5" />
    <span className="sr-only">Notifications</span>
</Button>
```

---

### 17. Add `prefers-reduced-motion` Support
**Location:** `src/components/layout/PageTransition.tsx`
**Problem:** Animations run regardless of user accessibility preferences.

**Fix:**
```typescript
import { useReducedMotion } from 'framer-motion';

export function PageTransition({ children }: { children: React.ReactNode }) {
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion) {
        return <>{children}</>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            {children}
        </motion.div>
    );
}
```

---

### 18. Standardize Dialog/Modal Sizing
**Location:** Various dialog components
**Problem:** Different max-widths causing layout inconsistency.

**Fix:** Create dialog size presets:
```typescript
// src/components/ui/dialog-sizes.ts
export const dialogSizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    form: 'max-w-4xl max-h-[90vh] overflow-y-auto',
};
```

---

### 19. Add Horizontal Scroll Indicator for Mobile Tables
**Location:** `src/components/ui/data-table.tsx` (line 88)
**Problem:** `overflow-x-auto` exists but no visual indicator that content is scrollable.

**Fix:** Add scroll shadow or indicator:
```typescript
<div className="relative">
    <div className="overflow-x-auto">
        <Table>...</Table>
    </div>
    {/* Scroll indicator */}
    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
</div>
```

---

## 🟡 MEDIUM PRIORITY - Testing

### 20. Add Unit Tests for Utility Functions
**Location:** Create `tests/unit/` directory
**Problem:** No unit tests for critical business logic.

**Priority Files:**
- `src/lib/invoice-utils.ts`
- `src/lib/shipment-utils.ts`
- `src/lib/analytics-utils.ts`
- `src/lib/export-utils.ts`

**Example:**
```typescript
// tests/unit/invoice-utils.test.ts
import { calculateInvoiceTotal, formatInvoiceNumber } from '@/lib/invoice-utils';

describe('calculateInvoiceTotal', () => {
    it('calculates subtotal, tax, and total correctly', () => {
        const items = [
            { quantity: 2, unit_price: 100 },
            { quantity: 1, unit_price: 50 },
        ];
        const result = calculateInvoiceTotal(items, 0.13);
        expect(result.subtotal).toBe(250);
        expect(result.tax).toBe(32.50);
        expect(result.total).toBe(282.50);
    });
});
```

---

### 21. Add API Route Integration Tests
**Location:** Create `tests/integration/` directory
**Problem:** No tests for API endpoints.

---

### 22. Add Component Tests with React Testing Library
**Location:** Create `tests/components/` directory
**Priority Components:**
- `CustomerForm`
- `InvoiceForm`
- `KanbanBoard`
- `DataTable`

---

### 23. Remove Hardcoded Test Credentials
**Location:** `tests/e2e/customers.spec.ts`
**Problem:** Test credentials committed to repository.

**Fix:** Use environment variables:
```typescript
await page.fill('[name="email"]', process.env.TEST_EMAIL!);
await page.fill('[name="password"]', process.env.TEST_PASSWORD!);
```

---

## 🟢 NEW FEATURES - Additions

### 24. Unsaved Changes Warning on Forms
**Benefit:** Prevent accidental data loss when navigating away.

```typescript
import { useBeforeUnload } from 'react-use';

function CustomerForm() {
    const { formState: { isDirty } } = useForm();

    useBeforeUnload(isDirty, 'You have unsaved changes. Are you sure?');

    // Also handle Next.js route changes
    useEffect(() => {
        const handleRouteChange = () => {
            if (isDirty && !confirm('Discard changes?')) {
                throw 'Route change aborted';
            }
        };
        router.events.on('routeChangeStart', handleRouteChange);
        return () => router.events.off('routeChangeStart', handleRouteChange);
    }, [isDirty]);
}
```

---

### 25. Bulk Actions for Customers/Invoices
**Benefit:** Power user efficiency for managing multiple records.

**Features:**
- Select multiple rows
- Bulk delete
- Bulk status change
- Bulk tag assignment
- Bulk export

---

### 26. Keyboard Shortcuts for Kanban Board
**Benefit:** Accessibility and power user efficiency.

**Shortcuts:**
- `←/→` - Move deal between stages
- `↑/↓` - Navigate deals
- `Enter` - Open deal details
- `n` - New deal
- `Escape` - Close dialogs

---

### 27. Server-Side Filtering for Customer Table
**Benefit:** Performance at scale (currently filters 1000+ records client-side).

---

### 28. Real-Time Updates with Supabase Realtime
**Benefit:** Multi-user collaboration without page refresh.

```typescript
useEffect(() => {
    const channel = supabase
        .channel('customers-changes')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'customers' },
            (payload) => {
                queryClient.invalidateQueries(['customers']);
            }
        )
        .subscribe();

    return () => { supabase.removeChannel(channel); };
}, []);
```

---

### 29. Export Audit Log
**Benefit:** Compliance and debugging capabilities.

---

### 30. Dashboard Widget Customization
**Benefit:** User personalization of dashboard layout.

---

## 🟢 ARCHITECTURE - Optimizations

### 31. Filter Factory Pattern
**Location:** `src/app/customers/customers-table.tsx`
**Problem:** 8 separate filter operations with similar patterns.

**Fix:**
```typescript
type FilterConfig = {
    field: keyof Customer;
    type: 'exact' | 'contains' | 'array' | 'boolean';
};

const filterConfigs: FilterConfig[] = [
    { field: 'status', type: 'exact' },
    { field: 'email', type: 'contains' },
    { field: 'tags', type: 'array' },
];

function applyFilters(customers: Customer[], filters: Filters) {
    return customers.filter(customer =>
        filterConfigs.every(config => matchesFilter(customer, config, filters))
    );
}
```

---

### 32. API Response Standardization
**Problem:** Inconsistent error message formats across endpoints.

**Fix:**
```typescript
// src/types/api.ts
type ApiResponse<T> =
    | { success: true; data: T }
    | { success: false; error: string; code?: string };

// Usage:
return NextResponse.json<ApiResponse<Customer>>({
    success: true,
    data: customer,
});
```

---

### 33. Centralize Environment Variable Usage
**Problem:** Direct `process.env` access in routes bypasses validation.

**Fix:** Always use validated env from `src/lib/env.ts`:
```typescript
// Before:
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// After:
import { env } from '@/lib/env';
const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
```

---

### 34. Form State Persistence
**Benefit:** Draft saving to localStorage prevents data loss.

```typescript
function useFormPersistence<T>(key: string, form: UseFormReturn<T>) {
    useEffect(() => {
        const saved = localStorage.getItem(key);
        if (saved) {
            form.reset(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        const subscription = form.watch((data) => {
            localStorage.setItem(key, JSON.stringify(data));
        });
        return () => subscription.unsubscribe();
    }, [form.watch]);

    const clearDraft = () => localStorage.removeItem(key);
    return { clearDraft };
}
```

---

## Implementation Phases

### Phase 1 - Security Hardening (Critical) 🔴
**Items:** 1-4
**Focus:** Webhook verification, logging, RLS, input validation

### Phase 2 - Performance & Reliability 🟠
**Items:** 5-13
**Focus:** Type safety, pagination, caching, server components

### Phase 3 - UX Polish 🟡
**Items:** 14-19
**Focus:** Loading states, accessibility, consistency

### Phase 4 - Testing Foundation 🟡
**Items:** 20-23
**Focus:** Unit, integration, and component tests

### Phase 5 - Feature Enhancements 🟢
**Items:** 24-30
**Focus:** New capabilities

### Phase 6 - Architecture Refinement 🟢
**Items:** 31-34
**Focus:** Long-term maintainability

---

## Summary

| Priority | Count | Focus Area |
|----------|-------|------------|
| 🔴 Critical | 4 | Security vulnerabilities |
| 🟠 High | 9 | Code quality & performance |
| 🟡 Medium | 10 | UI/UX & testing |
| 🟢 Low | 11 | Features & architecture |
| **Total** | **34** | |

---

*Generated by Claude Code Analysis - December 6, 2025*
