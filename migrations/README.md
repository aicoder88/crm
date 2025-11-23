# Database Migrations

This directory contains database migrations for the Purrify CRM application.

## Quick Start

### Apply All Migrations and Enable RLS

The easiest way to set up your database:

1. **Run the setup script:**
   ```bash
   ./scripts/execute-sql.sh migrations/complete-setup.sql
   ```

2. **This will copy the SQL to your clipboard and open the Supabase SQL Editor**

3. **Paste the SQL and click "Run"**

4. **Verify the migration:**
   ```bash
   node scripts/verify-database.mjs
   ```

## Directory Structure

```
migrations/
├── README.md                              # This file
├── pending/                               # Migrations not yet applied
│   └── add_task_reminders.sql            # Add reminder fields to tasks
├── complete-setup.sql                     # All-in-one setup file
└── supabase/
    └── migrations/
        ├── 20251122_complete_schema.sql   # Initial schema
        └── 20251123_performance_improvements.sql
```

## Migration Files

### complete-setup.sql
A comprehensive file that includes:
- ✅ Task reminders migration
- ✅ RLS enablement for all tables
- ✅ RLS policies for authenticated users
- ✅ Verification queries

### pending/add_task_reminders.sql
Adds reminder functionality to the tasks table:
- Adds `reminder_time` column (TIMESTAMPTZ)
- Adds `reminder_sent` column (BOOLEAN)
- Creates index for efficient reminder queries

## Manual Migration

If you prefer to run migrations individually:

1. **Navigate to Supabase SQL Editor:**
   https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

2. **Copy the migration SQL:**
   ```bash
   cat migrations/pending/add_task_reminders.sql | pbcopy
   ```

3. **Paste and execute in the SQL Editor**

4. **Verify:**
   ```bash
   node scripts/verify-database.mjs
   ```

## RLS Policies

The complete-setup.sql file enables Row Level Security (RLS) on all tables and creates policies that allow all authenticated users to access all data. This is suitable for:
- Single-user applications
- Development environments
- Internal tools

For production multi-tenant applications, you may want to modify the RLS policies to restrict access based on user ownership or roles.

### Current RLS Policy

All tables use this pattern:
```sql
-- Allow authenticated users full access
CREATE POLICY "policy_name"
ON table_name FOR ALL
USING (auth.role() = 'authenticated');
```

## Verification Scripts

### verify-database.mjs
Checks:
- ✓ Migration applied (reminder columns exist)
- ✓ Table accessibility
- ✓ RLS policies working
- ✓ Data counts
- ✓ Index functionality

Run with:
```bash
node scripts/verify-database.mjs
```

### apply-migration.mjs
Interactive script that:
- Checks current schema
- Shows migration SQL
- Provides instructions
- Verifies RLS status

Run with:
```bash
node scripts/apply-migration.mjs
```

## Troubleshooting

### "No tables are accessible"
This means RLS is enabled but policies aren't working. Causes:
1. Not authenticated (using anon key without auth)
2. RLS policies not created
3. Policies don't match your auth state

**Solution:** Run `complete-setup.sql` to create proper policies

### "Migration not yet applied"
The reminder columns don't exist yet.

**Solution:** Run the SQL in Supabase SQL Editor

### "Permission denied"
You need the service role key or must be authenticated.

**Solution:** Add SUPABASE_SERVICE_ROLE_KEY to .env.local or authenticate your app

## Best Practices

1. **Always verify** after running migrations
2. **Backup** before running in production
3. **Test** in development environment first
4. **Review** RLS policies for your security requirements
5. **Document** any custom modifications

## Schema Version Tracking

| Date | Version | Description |
|------|---------|-------------|
| 2025-11-22 | 1.0 | Initial complete schema |
| 2025-11-23 | 1.1 | Performance improvements + LinkedIn |
| 2025-11-23 | 1.2 | Task reminders + RLS policies |
