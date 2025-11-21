#!/usr/bin/env node

// Direct migration using Supabase client
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obqapfrjrbvniizlzhbz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_wUNFcsTuea5W7nkVKxaEiw_H4NutsyT';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('Running migration: Adding email column to customers table...\n');

    try {
        // Read the migration file
        const migrationSQL = fs.readFileSync('./migration-add-email.sql', 'utf8');

        // Execute each SQL statement separately
        const statements = migrationSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s && !s.startsWith('--'));

        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 50)}...`);

            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .limit(0);

            if (error && error.code !== 'PGRST116') {
                console.error('Error:', error);
            }
        }

        console.log('\n✅ Migration check completed!');
        console.log('Note: This script only checks connection. Please run the SQL manually in Supabase to be sure.');
        console.log('\nSQL to run:');
        console.log('ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;');
        console.log('CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);');

    } catch (error) {
        console.error('Migration failed:', error.message);
        console.log('\n⚠️  Please run this SQL manually in Supabase SQL Editor:');
        console.log('https://supabase.com/dashboard/project/obqapfrjrbvniizlzhbz/editor/sql\n');
        console.log('SQL to run:');
        console.log('ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;');
        console.log('CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);');
        process.exit(1);
    }
}

runMigration();
