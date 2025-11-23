#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

console.log('🔐 Using Supabase URL:', supabaseUrl);
console.log('🔑 Using key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCurrentSchema() {
  console.log('\n🔍 Checking current schema...');

  // Try to check if columns exist by querying tasks
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error checking schema:', error.message);
    return null;
  }

  if (data && data.length > 0) {
    const columns = Object.keys(data[0]);
    console.log('📋 Current tasks table columns:', columns.join(', '));

    const hasReminderTime = columns.includes('reminder_time');
    const hasReminderSent = columns.includes('reminder_sent');

    return { hasReminderTime, hasReminderSent };
  }

  console.log('⚠️  No data in tasks table to check schema');
  return { hasReminderTime: false, hasReminderSent: false };
}

async function applyMigrationManually() {
  console.log('\n📝 Migration needs to be applied manually');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const migrationPath = join(__dirname, '../migrations/pending/add_task_reminders.sql');
  const sql = readFileSync(migrationPath, 'utf8');

  console.log(sql);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📍 To apply this migration:');
  console.log('1. Go to Supabase SQL Editor:');
  console.log(`   ${supabaseUrl.replace('.supabase.co', '.supabase.co/project/_/sql')}`);
  console.log('2. Copy the SQL above');
  console.log('3. Paste and run it in the SQL Editor');
  console.log('4. Run this script again to verify\n');
}

async function verifyRLSPolicies() {
  console.log('\n🔒 Checking RLS policies...');

  // We'll check some core tables
  const tables = ['customers', 'tasks', 'deals', 'invoices'];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .limit(1);

    if (error) {
      if (error.message.includes('row-level security')) {
        console.log(`⚠️  ${table}: RLS is enabled but no policies allow access`);
      } else {
        console.log(`❌ ${table}: ${error.message}`);
      }
    } else {
      console.log(`✅ ${table}: Accessible (RLS may be disabled or policies allow access)`);
    }
  }
}

// Main execution
console.log('🚀 Purrify CRM - Database Migration Tool\n');

const schemaCheck = await checkCurrentSchema();

if (schemaCheck) {
  if (schemaCheck.hasReminderTime && schemaCheck.hasReminderSent) {
    console.log('✅ Migration already applied! Columns reminder_time and reminder_sent exist.');
  } else {
    console.log('⚠️  Migration not yet applied');
    await applyMigrationManually();
  }
} else {
  console.log('⚠️  Could not verify schema');
  await applyMigrationManually();
}

await verifyRLSPolicies();

console.log('\n✨ Schema check completed!');
process.exit(0);
