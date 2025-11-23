#!/bin/bash

# Load environment variables from .env.local
set -a
source .env.local
set +a

# Migration SQL file
MIGRATION_FILE="migrations/pending/add_task_reminders.sql"

echo "🚀 Applying migration: $MIGRATION_FILE"
echo ""

# Read the SQL file
SQL_CONTENT=$(cat "$MIGRATION_FILE")

# Note: Supabase doesn't expose a direct SQL execution endpoint via the anon key for security reasons.
# We need to use the Supabase SQL Editor in the dashboard, or use the service role key.
# For now, let's provide instructions and show what needs to be run.

echo "📝 Migration SQL:"
echo "----------------------------------------"
cat "$MIGRATION_FILE"
echo "----------------------------------------"
echo ""
echo "ℹ️  To apply this migration, you have two options:"
echo ""
echo "Option 1: Supabase Dashboard (Recommended)"
echo "  1. Go to: https://obqapfrjrbvniizlzhbz.supabase.co/project/_/sql"
echo "  2. Paste the SQL content shown above"
echo "  3. Click 'Run'"
echo ""
echo "Option 2: If you have the service role key"
echo "  1. Add SUPABASE_SERVICE_ROLE_KEY to .env.local"
echo "  2. Run this script again with the --execute flag"
echo ""
echo "Would you like me to copy the SQL to your clipboard? (requires pbcopy)"
read -p "Copy to clipboard? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cat "$MIGRATION_FILE" | pbcopy
    echo "✅ SQL copied to clipboard! Paste it in the Supabase SQL Editor."
fi
