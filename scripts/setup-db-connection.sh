#!/bin/bash

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Database Connection Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PROJECT_REF="obqapfrjrbvniizlzhbz"

echo "To execute migrations automatically, we need database credentials."
echo ""
echo "Opening Supabase database settings..."
echo ""

# Open the database settings page
open "https://supabase.com/dashboard/project/$PROJECT_REF/settings/database"

sleep 2

echo "Instructions:"
echo ""
echo "1. In the Supabase dashboard that just opened:"
echo "   - Scroll down to 'Connection string'"
echo "   - Click 'URI' tab"
echo "   - Copy the connection string"
echo ""
echo "2. Add it to .env.local:"
echo "   DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
echo ""
echo "3. Run the migration:"
echo "   node scripts/execute-migration.mjs"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Press Enter when you've added DATABASE_URL to .env.local..."

# Check if it was added
if grep -q "DATABASE_URL" .env.local 2>/dev/null; then
    echo ""
    echo "✅ DATABASE_URL found in .env.local"
    echo ""
    echo "🚀 Running migration now..."
    echo ""
    node scripts/execute-migration.mjs
else
    echo ""
    echo "⚠️  DATABASE_URL not found in .env.local"
    echo "   Please add it and run: node scripts/execute-migration.mjs"
    echo ""
fi
