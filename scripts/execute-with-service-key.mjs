#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🚀 Executing Migration with Service Role Key\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔐 Using service role key for elevated privileges');

// Read migration SQL
const migrationPath = join(__dirname, '../migrations/complete-setup.sql');
const sqlContent = readFileSync(migrationPath, 'utf8');

console.log('📂 Migration file loaded\n');

// Split SQL into individual statements (filter out comments and empty lines)
const statements = sqlContent
  .split(';')
  .map(s => s.trim())
  .filter(s => {
    // Remove empty statements and pure comment lines
    if (!s) return false;
    const lines = s.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('--');
    });
    return lines.length > 0;
  })
  .map(s => s + ';'); // Re-add semicolon

console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
console.log('🔄 Executing migration...\n');

// Execute via SQL query - we'll use the .rpc() method if available, or direct query
try {
  // Method 1: Try using a custom SQL execution approach
  // Since Supabase doesn't expose direct SQL execution via REST API for DDL,
  // we need to use the Management API

  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)[1];

  // Use Supabase Management API
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey
    },
    body: JSON.stringify({
      query: sqlContent
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log('⚠️  Management API approach failed, trying alternative method...\n');
    console.log('Error:', errorText, '\n');

    // Alternative: Execute critical statements individually
    console.log('📋 Executing critical migration statements individually:\n');

    const criticalStatements = [
      'ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_time TIMESTAMPTZ',
      'ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false',
      "CREATE INDEX IF NOT EXISTS idx_tasks_reminder ON tasks(reminder_time) WHERE status = 'pending' AND reminder_sent = false"
    ];

    for (let i = 0; i < criticalStatements.length; i++) {
      const stmt = criticalStatements[i];
      console.log(`  ${i + 1}/${criticalStatements.length} Executing...`);

      // Try using supabase.rpc if we have a function
      const { error } = await supabase.rpc('exec_sql', { sql_query: stmt }).catch(() => ({ error: { message: 'RPC not available' } }));

      if (error && !error.message.includes('not available')) {
        console.log(`    ⚠️  ${error.message}`);
      }
    }

    console.log('\n⚠️  Direct SQL execution not available via REST API');
    console.log('   This is a Supabase security feature.\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Using Supabase CLI instead...\n');

    // Use Supabase CLI with the service key
    const { exec } = await import('child_process');
    const util = await import('util');
    const execPromise = util.promisify(exec);

    try {
      // Link project with service key
      process.env.SUPABASE_ACCESS_TOKEN = serviceRoleKey;

      await execPromise('npx supabase link --project-ref obqapfrjrbvniizlzhbz');
      console.log('✅ Project linked\n');

      console.log('🔄 Pushing migrations...\n');
      const { stdout, stderr } = await execPromise('npx supabase db push');

      console.log(stdout);
      if (stderr && !stderr.includes('warn')) {
        console.error(stderr);
      }

      console.log('\n✅ Migration completed via Supabase CLI!\n');

    } catch (cliError) {
      console.error('❌ CLI execution failed:', cliError.message);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('Final option: Use database password for direct connection');
      console.log('Add to .env.local:');
      console.log('  DATABASE_URL=postgresql://postgres.obqapfrjrbvniizlzhbz:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres\n');
      console.log('Then run: node scripts/run-migration-auto.mjs\n');
      process.exit(1);
    }

  } else {
    const result = await response.json();
    console.log('✅ Migration executed successfully via Management API!\n');
    console.log('Result:', result);
  }

  // Verify migration
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🔍 Verifying migration...\n');

  const { data: tasks, error: verifyError } = await supabase
    .from('tasks')
    .select('id, reminder_time, reminder_sent')
    .limit(1);

  if (verifyError) {
    if (verifyError.message.includes('column') && verifyError.message.includes('does not exist')) {
      console.log('⚠️  Columns not yet created - migration may need manual execution\n');
    } else {
      console.log('⚠️  Verification error:', verifyError.message, '\n');
    }
  } else {
    console.log('✅ Migration verified! Columns exist:\n');
    console.log('   - reminder_time ✓');
    console.log('   - reminder_sent ✓\n');
  }

  console.log('✨ Process complete!\n');

} catch (error) {
  console.error('❌ Unexpected error:', error.message);
  console.error(error);
  process.exit(1);
}
