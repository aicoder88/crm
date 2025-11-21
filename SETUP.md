# Purrify CRM - Setup Guide

Welcome to Phase 1! Follow these steps to get your CRM running.

## Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Name it "purrify-crm"
4. Set a strong database password (save it!)
5. Choose a region close to you (Canada recommended)
6. Wait ~2 minutes for project to provision

### Step 2: Run Database Schema

1. In your Supabase project, click "SQL Editor" (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste into the SQL editor
5. Click "Run" or press Cmd/Ctrl + Enter
6. You should see "Success. No rows returned" - this is correct!

### Step 3: Get API Credentials

1. In Supabase, go to "Settings" → "API" (left sidebar)
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### Step 4: Configure Environment

1. In this project root, create a file called `.env.local`
2. Add these lines (replace with your actual values):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Save the file

### Step 5: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you should see the Purrify CRM!

## What's Next?

### Phase 1 Progress

- ✅ Project setup
- ✅ Dark theme configured
- ✅ Database schema created
- ⏳ App layout and navigation (in progress)
- ⏳ Customer list page
- ⏳ Customer detail page
- ⏳ CSV import utility

### Verify Database

To check your database is set up correctly:

1. In Supabase, go to "Table Editor"
2. You should see tables like: `customers`, `tags`, `deals`, `invoices`, etc.
3. The `deal_stages` table should have 7 rows (pipeline stages)

### Troubleshooting

**"Failed to connect to Supabase"**
- Check your `.env.local` file has correct values
- Ensure `.env.local` is in the project root (same folder as `package.json`)
- Restart your dev server after adding `.env.local`

**"Database error"**
- Verify the schema SQL ran successfully (no red errors in SQL Editor)
- Check the table editor shows all tables

**"Styles not loading"**
- Clear browser cache and hard reload (Cmd/Ctrl + Shift + R)
- Check `globals.css` has the dark theme colors

## Need Help?

- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)

---

**Ready to import your CSV data?**

Once the app is running, we'll build the CSV import tool to bring in your ~1,181 pet store records!
