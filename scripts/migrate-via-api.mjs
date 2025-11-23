#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🚀 Attempting automated migration via API...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

// Try to execute individual DDL statements
const migrations = [
  {
    name: 'Add reminder_time column',
    sql: 'ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_time TIMESTAMPTZ'
  },
  {
    name: 'Add reminder_sent column',
    sql: 'ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false'
  },
  {
    name: 'Create reminder index',
    sql: `CREATE INDEX IF NOT EXISTS idx_tasks_reminder ON tasks(reminder_time) WHERE status = 'pending' AND reminder_sent = false`
  }
];

console.log('Attempting to execute migrations using PostgREST...\n');

// Since we can't execute DDL directly via the REST API with anon key,
// let's try using the supabase-js client to make changes
console.log('⚠️  DDL operations require database-level access.\n');
console.log('Using alternative approach: Testing if migrations already applied...\n');

// Test if columns exist by trying to query them
const { data, error } = await supabase
  .from('tasks')
  .select('id, reminder_time, reminder_sent')
  .limit(1);

if (error) {
  if (error.message.includes('column') && error.message.includes('does not exist')) {
    console.log('❌ Migrations not yet applied.\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('The anon key cannot execute DDL statements.');
    console.log('We need elevated privileges to modify the database schema.\n');
    console.log('Quick solution - run ONE of these commands:\n');
    console.log('Option 1 - With database password:');
    console.log('  node scripts/run-migration-auto.mjs\n');
    console.log('Option 2 - With access token:');
    console.log('  ./scripts/migrate-with-token.sh\n');
    console.log('Option 3 - Manual (copy/paste in browser):');
    console.log('  cat migrations/complete-setup.sql | pbcopy');
    console.log('  open https://supabase.com/dashboard/project/obqapfrjrbvniizlzhbz/sql/new\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(1);
  } else {
    console.log('❌ Unexpected error:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Migrations already applied!\n');
  console.log('The following columns exist in the tasks table:');
  console.log('  - reminder_time');
  console.log('  - reminder_sent\n');
  console.log('✨ Your database is ready to use!\n');

  // Run full verification
  console.log('Running full verification...\n');
  const { exec } = await import('child_process');
  exec('node scripts/verify-database.mjs', (error, stdout) => {
    console.log(stdout);
  });
}
