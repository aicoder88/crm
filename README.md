# Purrify CRM

A custom CRM built for Purrify cat litter odor control - managing B2B relationships with pet stores across Canada.

## Tech Stack

- **Frontend**: Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **UI**: shadcn/ui with Radix UI primitives, Tailwind CSS 4 (dark mode)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Auth**: Supabase Auth
- **Payments**: Stripe (Invoicing API & Webhooks)
- **Shipping**: NetParcel API
- **Email**: Resend (with webhook tracking)
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Hosting**: Vercel (recommended)

## Getting Started

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier: [supabase.com](https://supabase.com))
- Vercel account (optional, for deployment)

### 2. Set Up Supabase

1. Create a new project at [app.supabase.com](https://app.supabase.com)
2. Go to Project Settings → API
3. Copy your `Project URL` and `anon/public` API key
4. In the SQL Editor, run the schema from `supabase-schema.sql`

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

Create `.env.local` in the root directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

### Completed Phases

#### Phase I - Core CRM
- ✅ Dark mode UI with Purrify  branding
- ✅ Customer management (CRUD)
- ✅ CSV import for existing data
- ✅ Search and filtering
- ✅ Authentication with Supabase Auth

#### Phase II - Enhanced Customer Management
- ✅ Multiple contacts per customer
- ✅ Tag management system
- ✅ Social media profile tracking
- ✅ Advanced customer segmentation

#### Phase III - Communication Hub
- ✅ Call logging and tracking
- ✅ Task management with priorities
- ✅ Activity timeline with structured events
- ✅ Follow-up scheduling

#### Phase IV - Sales Pipeline
- ✅ Kanban board for deal management
- ✅ Customizable pipeline stages
- ✅ Win probability tracking
- ✅ Deal value forecasting

#### Phase V - Invoicing & Payments
- ✅ Product catalog management
- ✅ Invoice creation and tracking
- ✅ Stripe integration for payments
- ✅ Automated invoice numbering

#### Phase VI - Shipping & Fulfillment
- ✅ NetParcel API integration
- ✅ Shipment tracking
- ✅ Label generation
- ✅ Delivery status updates

#### Phase VII - Analytics & Reporting
- ✅ Sales dashboards with KPIs
- ✅ Customer analytics (RFM analysis)
- ✅ Financial reporting
- ✅ Operational metrics with Recharts

#### Phase VIII - Email Integration
- ✅ Resend email service integration
- ✅ Email template editor
- ✅ Campaign management
- ✅ Email tracking (opens, clicks)
- ✅ Automated notifications

#### Phase IX - Settings & Administration
- ✅ Company settings management
- ✅ Tax and currency configuration
- ✅ User profile management
- ✅ Team settings

## Project Structure

```
purrify-crm/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utilities & configurations
│   │   └── supabase.ts  # Supabase client
│   └── hooks/           # Custom React hooks
├── public/              # Static assets
└── supabase-schema.sql  # Database schema
```

## Database Schema

See `supabase-schema.sql` for the complete schema.

### Key Tables:
- `customers`: Pet store records
- `tags`: Tag management (many-to-many)
- `customer_contacts`: Multiple contacts per customer
- `customer_timeline`: Activity feed with structured fields
- `deals`: Sales pipeline
- `invoices`: Stripe integration
- `shipments`: NetParcel tracking

## CSV Import

To import existing customer data:

1. Prepare CSV with headers matching the schema
2. Use the built-in CSV import tool (coming in Phase 1)
3. Or bulk insert via SQL:

```sql
COPY customers (store_name, phone, status, province, city)
FROM '/path/to/file.csv' CSV HEADER;
```

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

## License

Proprietary - © 2025 Purrify
