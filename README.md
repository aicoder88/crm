# Purrify CRM

A custom CRM built for Purrify cat litter odor control - managing B2B relationships with pet stores across Canada.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI**: shadcn/ui (dark mode with Purrify branding)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Stripe (Invoicing API)
- **Shipping**: NetParcel API
- **Email**: Resend
- **Hosting**: Vercel

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

### Phase 1 (Current)
- ✅ Dark mode UI with Purrify branding
- ✅ Customer management (CRUD)
- ✅ CSV import for existing data
- ✅ Search and filtering
- 🚧 Authentication

### Upcoming Phases
- Phase 2: Enhanced customer management (contacts, tags, social media)
- Phase 3: Communication hub (calls, tasks, timeline)
- Phase 4: Sales pipeline (Kanban board)
- Phase 5: Invoicing & Stripe integration
- Phase 6: Shipping & NetParcel integration
- Phase 7: Gmail API & analytics dashboards
- Phase 8: AI features (note summarization)

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
