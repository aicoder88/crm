#!/usr/bin/env node
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import * as readline from 'readline';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env.local') });

const projectRef = 'obqapfrjrbvniizlzhbz';

console.log('\n🚀 Automated Database Migration\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Check if DATABASE_URL is already set
let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.log('📋 We need your database password to connect.');
  console.log('   This is a ONE-TIME setup. It will be saved to .env.local\n');
  console.log('🔑 Get your database password:');
  console.log(`   https://supabase.com/dashboard/project/${projectRef}/settings/database\n`);
  console.log('   Look for "Database password" under Connection parameters\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const password = await new Promise((resolve) => {
    rl.question('Enter database password: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  if (!password) {
    console.error('\n❌ Password required to continue');
    process.exit(1);
  }

  // Build connection string for connection pooler (port 6543)
  connectionString = `postgresql://postgres.${projectRef}:${password}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

  // Save to .env.local
  const envPath = join(__dirname, '../.env.local');
  const envContent = readFileSync(envPath, 'utf8');
  const newEnvContent = envContent + `\n# Database connection (added automatically)\nDATABASE_URL=${connectionString}\n`;

  const fs = await import('fs');
  fs.writeFileSync(envPath, newEnvContent);
  console.log('\n✅ DATABASE_URL saved to .env.local\n');
}

console.log('🔌 Connecting to Supabase database...');

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  console.log('✅ Connected!\n');

  // Read migration
  const migrationPath = join(__dirname, '../migrations/complete-setup.sql');
  const sql = readFileSync(migrationPath, 'utf8');

  console.log('🔄 Executing migration...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await client.query(sql);

  console.log('✅ Migration completed successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Verify
  console.log('🔍 Verifying changes...\n');

  const result = await client.query(`
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'tasks'
    AND column_name IN ('reminder_time', 'reminder_sent')
    ORDER BY column_name;
  `);

  if (result.rows.length === 2) {
    console.log('✅ Verification successful!\n');
    console.log('New columns added to tasks table:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });
  }

  console.log('\n✨ All done! Your database is ready.\n');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  if (error.message.includes('password')) {
    console.error('\n💡 The password might be incorrect.');
    console.error('   Delete the DATABASE_URL line from .env.local and try again.\n');
  }
  process.exit(1);
} finally {
  await client.end();
}
