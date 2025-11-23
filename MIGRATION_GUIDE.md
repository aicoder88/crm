# Database Migration Guide - Purrify CRM

## Status: Ready to Execute

### What's Been Prepared

✅ **Migration SQL Created**: `migrations/complete-setup.sql`
✅ **Verification Scripts Created**: `scripts/verify-database.mjs`
✅ **Documentation Created**: `migrations/README.md`
✅ **SQL Copied to Clipboard**: Ready to paste
✅ **Supabase SQL Editor**: Opened in your browser

---

## Current Database Status

```
✅ All tables accessible (RLS configured)
⚠️  Migration pending (reminder columns don't exist yet)
📊 Database has: 979 customers, 2 tasks, 1 deal, 0 invoices
```

---

## What the Migration Does

### 1. **Task Reminders** (Pending)
Adds reminder functionality to tasks:
- `reminder_time` column (TIMESTAMPTZ)
- `reminder_sent` column (BOOLEAN)
- Optimized index for reminder queries

### 2. **RLS Policies** (Already Configured)
- Enables Row Level Security on all tables ✅
- Creates policies for authenticated users ✅
- Secures your database for production ✅

### 3. **Verification Queries**
Automatically verifies:
- Column creation
- RLS enablement
- Policy counts

---

## Execute the Migration

### Step 1: Paste SQL in Supabase

The SQL is **already in your clipboard**. The Supabase SQL Editor should be open. If not:

1. Go to: https://supabase.com/dashboard/project/obqapfrjrbvniizlzhbz/sql/new
2. Paste the SQL from your clipboard (⌘+V)
3. Click **"Run"** button

### Step 2: Verify Migration

After running the SQL, verify it worked:

```bash
node scripts/verify-database.mjs
```

Expected output:
```
✓ Test 1: Checking reminder columns in tasks table...
  ✅ Migration applied successfully!
     - reminder_time column exists
     - reminder_sent column exists

✓ Test 2: Checking RLS policies and access...
  ✅ customers: Accessible
  ✅ tasks: Accessible
  ✅ deals: Accessible
  ✅ invoices: Accessible
  ✅ products: Accessible
  ✅ tags: Accessible
```

---

## What Happens After Migration

### Enabled Features

1. **Task Reminders**
   - The `useTaskReminders` hook will start working
   - Browser notifications for due tasks
   - Automatic reminder tracking

2. **RLS Security**
   - All tables protected by Row Level Security
   - Only authenticated users can access data
   - Production-ready security

### Code Already in Place

Your codebase is already set up:
- ✅ TypeScript types include `reminder_time` and `reminder_sent`
- ✅ `useTaskReminders` hook implemented (src/hooks/useTaskReminders.ts:24-30)
- ✅ Notification system ready

### No Code Changes Needed

The migration enables existing code. No application changes required!

---

## Troubleshooting

### "Column already exists" error
✅ **Good!** Migration was already applied. Run verification to confirm.

### "Permission denied" error
⚠️  Check that:
1. You're using the correct Supabase project
2. You're logged in to Supabase Dashboard
3. You have admin access to the project

### "RLS policy error"
⚠️  The complete-setup.sql file will fix this. Make sure to run all of it, not just part.

---

## Quick Command Reference

```bash
# Verify current status
node scripts/verify-database.mjs

# View migration SQL
cat migrations/complete-setup.sql

# Copy SQL to clipboard again
cat migrations/complete-setup.sql | pbcopy

# Open Supabase SQL Editor
open "https://supabase.com/dashboard/project/obqapfrjrbvniizlzhbz/sql/new"
```

---

## Migration Checklist

- [ ] SQL pasted in Supabase SQL Editor
- [ ] Clicked "Run" in SQL Editor
- [ ] No errors shown
- [ ] Run verification script
- [ ] All tests pass
- [ ] Mark migration as complete

---

## Support

If you encounter issues:

1. **Check verification output**: `node scripts/verify-database.mjs`
2. **Review error messages** in Supabase SQL Editor
3. **Check migration logs** in Supabase Dashboard
4. **Refer to** `migrations/README.md` for detailed docs

---

## Next Steps After Migration

1. **Test task reminders**
   - Create a task with a reminder time
   - Wait for notification
   - Verify `reminder_sent` updates

2. **Verify RLS policies**
   - Test data access in your app
   - Ensure unauthenticated users can't access data

3. **Monitor performance**
   - Check query performance with new indexes
   - Monitor task reminder checks

---

*Migration prepared on: 2025-11-23*
*Project: Purrify CRM*
*Database: Supabase (obqapfrjrbvniizlzhbz)*
