#!/usr/bin/env node

// Quick script to run the email column migration
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obqapfrjrbvniizlzhbz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_wUNFcsTuea5W7nkVKxaEiw_H4NutsyT';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('Running migration: Adding email column to customers table...');

    const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;
      CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
    `
    });

    if (error) {
        console.error('Migration failed:', error);
        console.log('\nPlease run this SQL manually in Supabase SQL Editor:');
        console.log('ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;');
        console.log('CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);');
        process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log('The email column has been added to the customers table.');
}

runMigration();
