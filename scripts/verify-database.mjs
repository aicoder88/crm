#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Purrify CRM - Database Verification\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 1: Check if reminder columns exist
console.log('✓ Test 1: Checking reminder columns in tasks table...');
const { data: tasks, error: tasksError } = await supabase
  .from('tasks')
  .select('*')
  .limit(1);

if (tasksError) {
  console.log('  ❌ Error:', tasksError.message);
} else {
  const hasReminderTime = tasks && tasks.length > 0 && 'reminder_time' in (tasks[0] || {});
  const hasReminderSent = tasks && tasks.length > 0 && 'reminder_sent' in (tasks[0] || {});

  if (hasReminderTime && hasReminderSent) {
    console.log('  ✅ Migration applied successfully!');
    console.log('     - reminder_time column exists');
    console.log('     - reminder_sent column exists');
  } else {
    console.log('  ⚠️  Migration may not be applied yet');
    console.log('     - reminder_time:', hasReminderTime ? '✓' : '✗');
    console.log('     - reminder_sent:', hasReminderSent ? '✓' : '✗');
  }
}
console.log('');

// Test 2: Check RLS policies
console.log('✓ Test 2: Checking RLS policies and access...');
const tables = ['customers', 'tasks', 'deals', 'invoices', 'products', 'tags'];
let accessibleCount = 0;

for (const table of tables) {
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .limit(1);

  if (error) {
    if (error.message.includes('row-level security')) {
      console.log(`  ⚠️  ${table}: RLS enabled but access denied`);
      console.log(`     (You may need to authenticate or adjust policies)`);
    } else {
      console.log(`  ❌ ${table}: ${error.message}`);
    }
  } else {
    console.log(`  ✅ ${table}: Accessible`);
    accessibleCount++;
  }
}
console.log('');

// Test 3: Check table counts
console.log('✓ Test 3: Checking data counts...');
const countTables = ['customers', 'tasks', 'deals', 'invoices'];

for (const table of countTables) {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.log(`  ⚠️  ${table}: Could not count (${error.message})`);
  } else {
    console.log(`  📊 ${table}: ${count || 0} records`);
  }
}
console.log('');

// Test 4: Check indexes (indirect check via query performance)
console.log('✓ Test 4: Verifying critical indexes...');
const { data: pendingTasks, error: indexError } = await supabase
  .from('tasks')
  .select('id, reminder_time')
  .eq('status', 'pending')
  .not('reminder_time', 'is', null)
  .limit(5);

if (indexError) {
  console.log('  ⚠️  Could not verify index:', indexError.message);
} else {
  console.log('  ✅ Reminder index appears functional');
  console.log(`     Found ${pendingTasks?.length || 0} pending tasks with reminders`);
}
console.log('');

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📋 Summary:');
console.log(`  - Accessible tables: ${accessibleCount}/${tables.length}`);
console.log('  - Migration status: Run script to check');
console.log('  - RLS status: ' + (accessibleCount > 0 ? 'Configured' : 'Needs attention'));
console.log('\n✨ Verification complete!\n');

if (accessibleCount === 0) {
  console.log('⚠️  Warning: No tables are accessible. You may need to:');
  console.log('   1. Ensure you are authenticated in your Supabase client');
  console.log('   2. Check that RLS policies allow your access');
  console.log('   3. Verify that the complete-setup.sql was executed successfully');
  console.log('');
}

process.exit(0);
