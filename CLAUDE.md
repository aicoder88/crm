# CLAUDE.md - AI Assistant Guide for Purrify CRM

This document provides comprehensive guidance for AI assistants (like Claude) working with the Purrify CRM codebase. It covers architecture, conventions, workflows, and best practices to ensure consistent, high-quality contributions.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Codebase Structure](#codebase-structure)
3. [Tech Stack](#tech-stack)
4. [Development Setup](#development-setup)
5. [Code Conventions](#code-conventions)
6. [Component Patterns](#component-patterns)
7. [API Development](#api-development)
8. [Database Management](#database-management)
9. [State Management](#state-management)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Common Tasks](#common-tasks)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Purrify CRM** is a custom B2B CRM system built for managing relationships with pet stores across Canada for Purrify cat litter odor control products.

### Key Features
- Customer & contact management with advanced segmentation
- Sales pipeline with drag-and-drop Kanban board
- Invoice generation with Stripe integration
- Shipment tracking via NetParcel API
- Email campaigns and automation with Resend
- Analytics dashboard with financial reporting
- Task management and activity timeline

### Development Philosophy
- **TypeScript-first**: Strong typing for reliability
- **Component reusability**: shadcn/ui components as foundation
- **Server-first**: Leverage Next.js App Router and React Server Components
- **Performance**: Optimized queries, caching, and bundle size
- **Security**: Row Level Security (RLS) on all tables

---

## Codebase Structure

```
purrify-crm/
├── src/
│   ├── app/                    # Next.js App Router pages & API routes
│   │   ├── (routes)/          # Public & authenticated routes
│   │   ├── api/               # REST API endpoints
│   │   ├── dashboard/         # Main app pages (customers, deals, etc.)
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Landing page
│   │
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui base components
│   │   ├── customers/        # Customer-specific components
│   │   ├── deals/            # Deal/pipeline components
│   │   ├── invoices/         # Invoice components
│   │   ├── analytics/        # Charts and analytics
│   │   └── [feature]/        # Feature-specific components
│   │
│   ├── lib/                   # Utilities & configurations
│   │   ├── supabase/         # Supabase clients (client.ts, server.ts)
│   │   ├── logger.ts         # Structured logging utility
│   │   ├── stripe.ts         # Stripe configuration
│   │   ├── react-query.ts    # TanStack Query setup
│   │   ├── utils.ts          # General utilities (cn, etc.)
│   │   └── [service].ts      # Service integrations
│   │
│   └── hooks/                 # Custom React hooks
│       ├── use-customers.ts
│       ├── use-deals.ts
│       └── use-[feature].ts
│
├── public/                    # Static assets
├── scripts/                   # Database & utility scripts
├── migrations/                # Database migrations
├── tests/                     # E2E tests (Playwright)
├── supabase/                  # Supabase config & local migrations
└── [config files]            # TypeScript, Tailwind, ESLint, etc.
```

### File Organization Principles

1. **Co-location**: Keep related files close (components, hooks, utils for a feature)
2. **Feature folders**: Group by feature/domain, not by type
3. **Barrel exports**: Avoid index.ts files; import directly
4. **Naming**: kebab-case for files, PascalCase for components, camelCase for functions

---

## Tech Stack

### Core Framework
- **Next.js 16.0.3**: App Router with Turbopack
- **React 19.2.0**: Latest with Server Components
- **TypeScript 5**: Strict mode enabled

### UI & Styling
- **Tailwind CSS 4**: Utility-first styling with custom theme
- **shadcn/ui**: Radix UI primitives + custom components
- **Lucide React**: Icon library
- **Framer Motion**: Animations
- **Recharts**: Data visualization

### Backend & Database
- **Supabase**: PostgreSQL database + Auth + Storage
- **@supabase/ssr**: Server-side auth handling
- **Row Level Security**: All tables protected

### External Services
- **Stripe**: Payment processing and invoicing
- **Resend**: Transactional email service
- **NetParcel**: Shipping API
- **Sentry**: Error tracking and monitoring

### State & Data Fetching
- **TanStack Query v5**: Server state management
- **React Hook Form**: Form handling
- **Zod**: Schema validation

### Testing
- **Playwright**: E2E testing across browsers
- **TypeScript**: Static type checking

### Deployment
- **Vercel**: Recommended hosting platform
- **PWA**: Progressive Web App support (next-pwa)

---

## Development Setup

### Prerequisites
```bash
Node.js 18+ and npm
Supabase account
Vercel account (optional, for deployment)
```

### Initial Setup

1. **Clone and install**
```bash
git clone <repo-url>
cd crm
npm install
```

2. **Environment variables**
Copy `.env.example` to `.env.local` and configure:
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional (feature-specific)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
RESEND_API_KEY=re_...
NETPARCEL_API_KEY=...
```

3. **Database setup**
Run the schema in Supabase SQL Editor:
```bash
# See supabase-schema.sql or migrations/complete-setup.sql
```

4. **Run development server**
```bash
npm run dev
# Opens at http://localhost:3000
```

### Available Scripts

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run Playwright tests
npm run test:ui      # Playwright UI mode
npm run db:verify    # Verify database connection
npm run db:migrate   # Run database migrations
```

---

## Code Conventions

### TypeScript

#### Strict Mode
All code must pass strict TypeScript checks:
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### Type Definitions
```typescript
// Use interfaces for objects
interface Customer {
  id: string;
  store_name: string;
  email: string | null;
  status: 'active' | 'inactive' | 'prospect';
}

// Use type for unions/intersections
type CustomerStatus = 'active' | 'inactive' | 'prospect';
type CustomerWithContacts = Customer & { contacts: Contact[] };
```

#### Path Aliases
Use `@/*` for imports:
```typescript
import { createClient } from '@/lib/supabase/client';
import { CustomerForm } from '@/components/customers/customer-form';
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `customer-form.tsx` |
| Components | PascalCase | `CustomerForm` |
| Functions | camelCase | `fetchCustomers` |
| Hooks | use prefix | `useCustomers` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Types/Interfaces | PascalCase | `CustomerData` |

### Code Style

#### Formatting
- Use 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in multiline

#### Component Structure
```typescript
'use client'; // If client component

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  customerId: string;
  onSave: (data: Customer) => void;
}

export function CustomerForm({ customerId, onSave }: Props) {
  // 1. Hooks
  const [loading, setLoading] = useState(false);

  // 2. Handlers
  const handleSubmit = async () => {
    setLoading(true);
    // ...
  };

  // 3. Render
  return (
    <form onSubmit={handleSubmit}>
      {/* JSX */}
    </form>
  );
}
```

### Import Order
```typescript
// 1. React & Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

// 3. Internal utilities
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

// 4. Components
import { Button } from '@/components/ui/button';
import { CustomerCard } from '@/components/customers/customer-card';

// 5. Types
import type { Customer } from '@/types';
```

---

## Component Patterns

### Server vs Client Components

**Default to Server Components** unless you need:
- Client-side state (`useState`, `useReducer`)
- Effects (`useEffect`)
- Event handlers (`onClick`, etc.)
- Browser-only APIs

```typescript
// Server Component (default)
export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: customers } = await supabase.from('customers').select('*');

  return <CustomerList customers={customers} />;
}

// Client Component
'use client';

export function CustomerSearch() {
  const [query, setQuery] = useState('');
  // ...
}
```

### shadcn/ui Components

All UI components in `src/components/ui/` are from shadcn/ui. To add new ones:

```bash
npx shadcn@latest add [component-name]
```

**Key components used:**
- `Button`, `Input`, `Label` - Forms
- `Dialog`, `Sheet` - Modals/Drawers
- `Table`, `DataTable` - Tables
- `Card` - Content containers
- `Badge` - Status indicators
- `Popover`, `DropdownMenu` - Overlays

### Form Handling Pattern

Use React Hook Form + Zod:

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  store_name: z.string().min(1, 'Store name is required'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function CustomerForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { store_name: '', email: '', phone: '' },
  });

  const onSubmit = async (data: FormData) => {
    // Handle submission
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Data Fetching Pattern

Use TanStack Query for client-side data:

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';

export function useCustomers() {
  return useQuery({
    queryKey: queryKeys.customers.lists(),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Customer> }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from('customers')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
    },
  });
}
```

---

## API Development

### Route Structure

API routes live in `src/app/api/`:

```
src/app/api/
├── health/              # Health check endpoints
├── webhooks/            # External webhook handlers
│   ├── stripe/
│   └── resend/
├── shipments/           # Shipment operations
│   ├── create/
│   └── [id]/
└── email/               # Email sending
```

### API Route Pattern

```typescript
// src/app/api/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch customers', error);
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });

  } catch (error) {
    logger.error('Unexpected error in GET /api/customers', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Error Handling

Use the logger utility:

```typescript
import { logger } from '@/lib/logger';

// Info logging
logger.info('Customer created', { customerId: customer.id });

// Warning
logger.warn('Rate limit approaching', { userId, requestCount });

// Error with context
logger.error('Failed to process payment', error, {
  customerId,
  invoiceId,
  amount,
});
```

### Authentication

```typescript
// Server components / API routes
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data: { user }, error } = await supabase.auth.getUser();

if (!user) {
  redirect('/login');
}
```

```typescript
// Client components
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
```

---

## Database Management

### Supabase Client Usage

**Server-side (Server Components, API Routes)**
```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
```

**Client-side (Client Components, Hooks)**
```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
```

### Query Patterns

```typescript
// Select with joins
const { data } = await supabase
  .from('customers')
  .select(`
    *,
    contacts:customer_contacts(*),
    deals(*)
  `)
  .eq('status', 'active');

// Insert
const { data, error } = await supabase
  .from('customers')
  .insert({
    store_name: 'Pet Paradise',
    email: 'info@petparadise.com',
  })
  .select()
  .single();

// Update
await supabase
  .from('customers')
  .update({ status: 'inactive' })
  .eq('id', customerId);

// Delete
await supabase
  .from('customers')
  .delete()
  .eq('id', customerId);
```

### Migrations

Database migrations are in `migrations/` and `supabase/migrations/`:

```bash
# Verify database
npm run db:verify

# Check database status
npm run db:status

# Run migrations
npm run db:migrate
```

### Row Level Security (RLS)

All tables have RLS enabled. Policies enforce:
- Users can only see their organization's data
- Authentication required for all operations
- Role-based permissions

**When adding new tables:**
1. Enable RLS: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Add policies for SELECT, INSERT, UPDATE, DELETE
3. Test with different user roles

---

## State Management

### TanStack Query

Centralized query keys in `src/lib/react-query.ts`:

```typescript
import { queryKeys, invalidationHelpers } from '@/lib/react-query';

// In hooks
const { data } = useQuery({
  queryKey: queryKeys.customers.detail(customerId),
  queryFn: fetchCustomer,
});

// Invalidate after mutation
const queryClient = useQueryClient();
queryClient.invalidateQueries({
  queryKey: queryKeys.customers.lists(),
});

// Use helpers for complex invalidations
const updateCustomer = useMutation({
  onSuccess: (data, variables) => {
    invalidationHelpers.customer(variables.customerId).forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  },
});
```

### Cache Configuration

Default cache settings (from `react-query.ts`):
- **staleTime**: 5 minutes (data considered fresh)
- **gcTime**: 10 minutes (cache garbage collection)
- **retry**: 2 attempts for queries, 1 for mutations

---

## Testing

### Playwright E2E Tests

Tests are in `tests/e2e/`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Customer Management', () => {
  test('should create a new customer', async ({ page }) => {
    await page.goto('/dashboard/customers');
    await page.click('text=New Customer');

    await page.fill('input[name="store_name"]', 'Test Store');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Test Store')).toBeVisible();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# UI mode (interactive)
npm run test:ui

# Headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug

# Generate report
npm run test:report
```

### Test Configuration

See `playwright.config.ts`:
- Tests run on Chromium, Firefox, WebKit
- Mobile viewports included
- Screenshots on failure
- Video on failure
- Dev server starts automatically

---

## Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Environment variables** - Add all from `.env.example`
3. **Build settings** (auto-detected):
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Deploy**

### Environment Variables

Required for production:
```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Feature-specific
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
NETPARCEL_API_KEY
```

### Build Optimization

Next.js config includes:
- PWA support (disabled in dev)
- Image optimization (AVIF, WebP)
- Package imports optimization
- Sentry integration
- Service worker caching

---

## Common Tasks

### Adding a New Feature

1. **Plan the data model** - Add tables/columns in migrations
2. **Create database migration** - Use SQL scripts
3. **Add types** - Define TypeScript interfaces
4. **Create hooks** - Custom hooks for data fetching
5. **Build components** - UI components for the feature
6. **Add routes** - Pages and API endpoints
7. **Update navigation** - Add to sidebar/menu
8. **Write tests** - E2E tests for critical paths

### Adding a New Table

```sql
-- migrations/add_new_table.sql
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  -- fields
);

-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view own records"
  ON new_table FOR SELECT
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX idx_new_table_user_id ON new_table(user_id);
```

### Adding a New Component

```bash
# Use shadcn CLI for UI components
npx shadcn@latest add [component-name]

# Custom components go in feature folders
# src/components/[feature]/[component-name].tsx
```

### Adding a New API Route

```typescript
// src/app/api/[route]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  // Implementation
}

export async function POST(request: NextRequest) {
  // Implementation
}
```

---

## Troubleshooting

### Common Issues

#### Build Errors

**Issue**: TypeScript errors during build
```bash
# Check types
npx tsc --noEmit

# Fix common issues
- Add 'use client' to components using hooks
- Check import paths use @/* aliases
- Verify all types are defined
```

**Issue**: Module not found
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

#### Database Issues

**Issue**: RLS blocking queries
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Temporarily disable for debugging (DO NOT use in production)
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

**Issue**: Connection errors
```bash
# Verify environment variables
npm run db:verify

# Check Supabase dashboard for API keys
```

#### Authentication Issues

**Issue**: "User not found" errors
- Check cookies are enabled
- Verify Supabase URL and anon key
- Check browser console for errors
- Ensure auth redirects are configured

### Logging & Debugging

Use the logger utility:
```typescript
import { logger } from '@/lib/logger';

logger.debug('Debug info', { context });
logger.info('Info message');
logger.warn('Warning');
logger.error('Error occurred', error, { context });
```

View logs:
- **Development**: Browser console + terminal
- **Production**: Vercel logs or Sentry dashboard

---

## AI Assistant Guidelines

When working with this codebase:

### DO:
✅ Use TypeScript strictly - no `any` types
✅ Follow the established patterns (see Component Patterns, API Development)
✅ Use existing hooks and utilities before creating new ones
✅ Leverage TanStack Query for data fetching
✅ Use shadcn/ui components for UI
✅ Add proper error handling and logging
✅ Follow the import order convention
✅ Use Server Components by default
✅ Ensure RLS policies for new tables
✅ Write descriptive commit messages

### DON'T:
❌ Use `console.log` - use `logger` instead
❌ Add client-side state when Server Components suffice
❌ Create duplicate utilities - check `lib/` first
❌ Skip error handling in API routes
❌ Bypass RLS policies
❌ Use inline styles - use Tailwind classes
❌ Create barrel exports (index.ts files)
❌ Ignore TypeScript errors

### Code Quality Checklist

Before submitting code:
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Components follow Server/Client patterns correctly
- [ ] API routes have proper error handling
- [ ] Database queries use proper RLS
- [ ] Forms use React Hook Form + Zod
- [ ] Logging uses `logger` utility
- [ ] Imports follow the standard order
- [ ] No hardcoded values (use env vars)
- [ ] New features have basic tests

### Getting Context

When asked to work on a feature:
1. **Read related files** first - check existing patterns
2. **Check `lib/react-query.ts`** for query keys
3. **Review similar components** for consistency
4. **Check database schema** (`supabase-schema.sql`)
5. **Verify environment variables** (`.env.example`)

---

## Resources

### Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Internal Docs
- `README.md` - Project overview and setup
- `MIGRATION_GUIDE.md` - Migration instructions
- `PHASE_*_QUICKSTART.md` - Feature documentation
- `migrations/README.md` - Database migration guide

### Support
- Check GitHub issues for known problems
- Review commit history for similar changes
- Consult phase quickstart guides for feature-specific docs

---

**Last Updated**: 2025-12-06
**Version**: 0.1.0
**Maintainer**: Purrify Development Team
