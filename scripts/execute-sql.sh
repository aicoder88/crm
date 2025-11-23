#!/bin/bash

# Load environment variables
set -a
source .env.local 2>/dev/null || source .env 2>/dev/null
set +a

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
    exit 1
fi

# Extract project ref from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\/\([^.]*\).*/\1/')

# Read SQL file
SQL_FILE=${1:-"migrations/pending/add_task_reminders.sql"}

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: SQL file not found: $SQL_FILE"
    exit 1
fi

echo "🚀 Executing SQL migration: $SQL_FILE"
echo "📍 Project: $PROJECT_REF"
echo ""

# Read the SQL content
SQL_CONTENT=$(<"$SQL_FILE")

# Try using PostgREST's rpc function (if you have one set up)
# Note: This requires a custom function in your database

echo "📝 SQL to execute:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$SQL_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Since we can't execute DDL directly via the anon key, provide instructions
echo "⚠️  Note: DDL statements cannot be executed via the Supabase client API for security reasons."
echo ""
echo "✅ Please apply this migration in one of the following ways:"
echo ""
echo "Option 1 - Supabase Dashboard (Easiest):"
echo "  1. Open: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo "  2. Copy the SQL above"
echo "  3. Paste and click 'Run'"
echo ""
echo "Option 2 - Direct PostgreSQL connection:"
echo "  1. Get your database connection string from Supabase Dashboard"
echo "  2. Run: psql <connection-string> -f $SQL_FILE"
echo ""

# Copy to clipboard if pbcopy is available
if command -v pbcopy &> /dev/null; then
    cat "$SQL_FILE" | pbcopy
    echo "✨ SQL has been copied to your clipboard!"
    echo ""
    read -p "Press Enter to open the Supabase SQL Editor in your browser..."
    open "https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
fi
