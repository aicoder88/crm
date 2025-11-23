#!/bin/bash

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Automated Migration with Supabase CLI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if token is already in .env.local
if grep -q "SUPABASE_ACCESS_TOKEN" .env.local 2>/dev/null; then
    echo "✅ Access token found in .env.local"
    export $(grep "SUPABASE_ACCESS_TOKEN" .env.local | xargs)
else
    echo "📋 A browser window will open to get your access token"
    echo "   (One-time setup - will be saved for future use)"
    echo ""

    # Open tokens page
    open "https://supabase.com/dashboard/account/tokens"
    sleep 2

    echo "Instructions:"
    echo "1. Click 'Generate New Token'"
    echo "2. Name it: 'CLI Access'"
    echo "3. Copy the token"
    echo ""

    read -p "Paste your access token here: " TOKEN

    if [ -z "$TOKEN" ]; then
        echo ""
        echo "❌ No token provided"
        exit 1
    fi

    # Save to .env.local
    echo "" >> .env.local
    echo "# Supabase CLI Access Token (added automatically)" >> .env.local
    echo "SUPABASE_ACCESS_TOKEN=$TOKEN" >> .env.local

    export SUPABASE_ACCESS_TOKEN=$TOKEN
    echo ""
    echo "✅ Token saved to .env.local"
fi

echo ""
echo "🔗 Linking project..."
npx supabase link --project-ref obqapfrjrbvniizlzhbz

echo ""
echo "🚀 Pushing migration to database..."
npx supabase db push

echo ""
echo "✅ Migration complete!"
echo ""
echo "🔍 Verifying..."
node scripts/verify-database.mjs
