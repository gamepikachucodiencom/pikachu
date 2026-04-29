#!/usr/bin/env node
/**
 * Simple Supabase Migration Runner (Alternative)
 * Uses Supabase CLI if available, otherwise provides instructions
 * 
 * This is a simpler fallback that uses Supabase CLI or provides clear instructions
 */

const { readdir, readFile } = require('fs/promises');
const { join } = require('path');
const { execSync } = require('child_process');

async function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function getMigrationFiles() {
  const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
  const files = await readdir(migrationsDir);
  
  return files
    .filter(file => file.endsWith('.sql'))
    .map(file => {
      const match = file.match(/^(\d{14})_(.+)\.sql$/);
      if (!match) return null;
      return {
        filename: file,
        timestamp: match[1],
        path: join(migrationsDir, file),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

async function runMigrations() {
  console.log('🚀 Supabase Migration Runner\n');

  const hasCLI = await checkSupabaseCLI();
  
  if (!hasCLI) {
    console.log('⚠️  Supabase CLI not found.\n');
    console.log('📋 Option 1: Install Supabase CLI');
    console.log('   npm install -g supabase\n');
    console.log('   Then run: supabase db push\n');
    console.log('📋 Option 2: Use manual deployment');
    console.log('   1. Go to Supabase Dashboard → SQL Editor');
    console.log('   2. Copy and paste the contents of supabase/full_deployment.sql');
    console.log('   3. Execute the script\n');
    console.log('📋 Option 3: Use pg library (requires DATABASE_URL)');
    console.log('   npm install --save-dev pg @types/pg');
    console.log('   npm run migrate\n');
    return;
  }

  const migrationFiles = await getMigrationFiles();
  
  if (migrationFiles.length === 0) {
    console.log('⚠️  No migration files found');
    return;
  }

  console.log(`📦 Found ${migrationFiles.length} migration file(s):\n`);
  migrationFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file.filename}`);
  });

  console.log('\n💡 To run migrations with Supabase CLI:');
  console.log('   1. Link your project: supabase link --project-ref <your-project-ref>');
  console.log('   2. Push migrations: supabase db push\n');
  console.log('   Or use the full deployment script:');
  console.log('   Copy supabase/full_deployment.sql to Supabase SQL Editor\n');
}

runMigrations().catch(console.error);

