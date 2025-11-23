#!/usr/bin/env node
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env.local');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.error('');
  console.error('To get your service role key:');
  console.error('1. Go to: https://supabase.com/dashboard/project/obqapfrjrbvniizlzhbz/settings/api');
  console.error('2. Copy the "service_role" key (not the anon key)');
  console.error('3. Add to .env.local:');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here');
  console.error('');
  process.exit(1);
}

console.log('🚀 Auto-executing database migration...\n');

// Read the migration SQL
const migrationPath = join(__dirname, '../migrations/complete-setup.sql');
const sql = readFileSync(migrationPath, 'utf8');

console.log('📂 Migration file loaded');
console.log('🔐 Using service role key for authentication');
console.log('');

// Execute SQL using Supabase REST API
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)[1];
const apiUrl = `${supabaseUrl}/rest/v1/rpc/exec_sql`;

try {
  // Use the pg_meta API endpoint
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`
    },
    body: JSON.stringify({ sql })
  });

  if (!response.ok) {
    // Try alternative: direct SQL execution via PostgREST
    console.log('⚠️  RPC method not available, trying direct execution...\n');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // For now, we'll need to use a different approach
    console.log('❌ Direct SQL execution requires manual intervention or database URL');
    console.log('');
    console.log('Alternative solutions:');
    console.log('');
    console.log('1. Use Supabase CLI:');
    console.log('   brew install supabase/tap/supabase');
    console.log('   supabase db execute -f migrations/complete-setup.sql --project-ref obqapfrjrbvniizlzhbz');
    console.log('');
    console.log('2. Use PostgreSQL client:');
    console.log('   Get your database URL from Supabase dashboard');
    console.log('   psql "postgres://..." -f migrations/complete-setup.sql');
    console.log('');
    process.exit(1);
  }

  const result = await response.json();
  console.log('✅ Migration executed successfully!');
  console.log('Result:', result);
  console.log('');

  // Verify migration
  console.log('🔍 Verifying migration...');
  const { default: verify } = await import('./verify-database.mjs');

} catch (error) {
  console.error('❌ Error executing migration:', error.message);
  console.error('');
  console.error('Please try one of the alternative methods listed above.');
  process.exit(1);
}
