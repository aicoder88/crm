#!/usr/bin/env node

// Direct migration runner for saved_searches table
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runMigration() {
    const migrationFile = process.argv[2] || 'supabase/migrations/20251123_saved_searches.sql';

    console.log(`\n📦 Running migration: ${migrationFile}\n`);

    try {
        // Read the migration file
        const migrationSQL = fs.readFileSync(migrationFile, 'utf8');

        console.log('SQL Content:');
        console.log('─'.repeat(80));
        console.log(migrationSQL);
        console.log('─'.repeat(80));
        console.log('\n⚠️  This script cannot execute raw SQL directly.');
        console.log('Please run the above SQL in the Supabase SQL Editor:\n');
        console.log(`🔗 https://supabase.com/dashboard/project/${supabaseUrl.match(/https:\/\/([^.]+)/)[1]}/sql\n`);

        // Test connection
        const { data, error } = await supabase.from('customers').select('id').limit(1);

        if (error) {
            console.error('❌ Connection test failed:', error.message);
        } else {
            console.log('✅ Supabase connection verified');
        }

    } catch (error) {
        console.error('❌ Error reading migration file:', error.message);
        process.exit(1);
    }
}

runMigration();
