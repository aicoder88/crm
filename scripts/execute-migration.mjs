#!/usr/bin/env node
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

console.log('🚀 Purrify CRM - Automated Migration Execution\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env.local');
  process.exit(1);
}

// Extract project ref
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)[1];

// Check for credentials
if (!serviceRoleKey && !databaseUrl) {
  console.log('⚠️  Missing database credentials\n');
  console.log('To execute migrations automatically, add ONE of the following to .env.local:\n');
  console.log('Option 1 - Service Role Key (Recommended):');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.log('   Get it from: https://supabase.com/dashboard/project/' + projectRef + '/settings/api\n');
  console.log('Option 2 - Direct Database Connection:');
  console.log('   DATABASE_URL=postgresql://...');
  console.log('   Get it from: https://supabase.com/dashboard/project/' + projectRef + '/settings/database\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Offer to open the settings page
  console.log('Would you like to open the Supabase settings page?');
  console.log('Run: open https://supabase.com/dashboard/project/' + projectRef + '/settings/api\n');
  process.exit(1);
}

// Construct connection string
let connectionString;
if (databaseUrl) {
  connectionString = databaseUrl;
  console.log('🔌 Using DATABASE_URL for connection');
} else {
  // Build connection string from service role key
  // Supabase format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
  console.log('🔌 Using service role key (need database password)');
  console.log('⚠️  Service role key alone cannot connect to database');
  console.log('   Please add DATABASE_URL to .env.local instead\n');
  process.exit(1);
}

// Read migration file
const migrationPath = join(__dirname, '../migrations/complete-setup.sql');
console.log('📂 Loading migration:', migrationPath);
const sql = readFileSync(migrationPath, 'utf8');
console.log('✓ Migration SQL loaded\n');

// Connect and execute
console.log('🔄 Connecting to database...');
const client = new Client({ connectionString });

try {
  await client.connect();
  console.log('✓ Connected to database\n');

  console.log('🔄 Executing migration...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const result = await client.query(sql);

  console.log('✅ Migration executed successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Verify the migration
  console.log('🔍 Verifying migration...\n');

  const verifyQuery = `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'tasks'
    AND column_name IN ('reminder_time', 'reminder_sent')
    ORDER BY column_name;
  `;

  const verifyResult = await client.query(verifyQuery);

  if (verifyResult.rows.length === 2) {
    console.log('✅ Migration verified! New columns found:');
    console.table(verifyResult.rows);
  } else {
    console.log('⚠️  Verification incomplete - columns may not have been created');
  }

  console.log('\n✨ Migration complete!\n');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  console.error('\nError details:', error);
  process.exit(1);
} finally {
  await client.end();
}
