#!/usr/bin/env node
/**
 * Supabase Migration Runner using pg (PostgreSQL client)
 * Executes migrations in chronological order
 * 
 * Requires:
 *   - pg library: npm install --save-dev pg @types/pg
 *   - DATABASE_URL environment variable
 * 
 * Usage:
 *   DATABASE_URL=postgresql://... npm run migrate
 */

const { readdir, readFile } = require('fs/promises');
const { join } = require('path');

async function getMigrationFiles() {
  const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
  const files = await readdir(migrationsDir);
  
  return files
    .filter(file => file.endsWith('.sql'))
    .map(file => {
      const match = file.match(/^(\d{14})_(.+)\.sql$/);
      if (!match) {
        console.warn(`⚠️  Skipping invalid filename: ${file}`);
        return null;
      }
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
  console.log('🚀 Supabase Migration Runner (pg)\n');

  // Check for pg library
  let Client;
  try {
    const pg = require('pg');
    Client = pg.Client;
  } catch (error) {
    console.error('❌ pg library not found.');
    console.error('\n💡 Install it with:');
    console.error('   npm install --save-dev pg @types/pg\n');
    process.exit(1);
  }

  // Check for DATABASE_URL (try multiple environment variable names)
  const databaseUrl = 
    process.env.DATABASE_URL || 
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_CONNECTION_STRING;

  if (!databaseUrl) {
    console.error('❌ Database connection string not found');
    console.error('\n💡 Set one of these environment variables:');
    console.error('   - DATABASE_URL');
    console.error('   - SUPABASE_DB_URL');
    console.error('   - POSTGRES_URL');
    console.error('\n💡 Get your database URL from:');
    console.error('   Supabase Dashboard → Settings → Database → Connection string');
    console.error('   Use the "URI" format (Direct connection, not Session mode)');
    console.error('   Format: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres');
    console.error('\n   Or add to .env.local:');
    console.error('   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres\n');
    process.exit(1);
  }

  const migrationFiles = await getMigrationFiles();

  if (migrationFiles.length === 0) {
    console.log('⚠️  No migration files found in supabase/migrations/');
    return;
  }

  console.log(`📦 Found ${migrationFiles.length} migration file(s):\n`);
  migrationFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file.filename}`);
  });

  console.log('\n🔄 Connecting to database...\n');

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    for (const migration of migrationFiles) {
      try {
        console.log(`📝 Executing: ${migration.filename}...`);
        
        const sql = await readFile(migration.path, 'utf-8');
        
        // Execute the SQL
        // Note: client.query() executes the entire SQL string, which may contain multiple statements
        try {
          await client.query(sql);
          console.log(`✅ Completed: ${migration.filename}\n`);
        } catch (queryError) {
          // Check if it's a "already exists" error (common with IF NOT EXISTS)
          if (queryError.message.includes('already exists') || 
              queryError.code === '42P07' || // duplicate_table
              queryError.code === '42710') { // duplicate_object
            console.log(`⚠️  Skipped (already exists): ${migration.filename}\n`);
          } else {
            throw queryError;
          }
        }
      } catch (error) {
        // Check if it's a "already exists" error (common with IF NOT EXISTS)
        if (error.message && (
          error.message.includes('already exists') || 
          error.code === '42P07' || // duplicate_table
          error.code === '42710' || // duplicate_object
          error.code === '42P16'    // duplicate_column
        )) {
          console.log(`⚠️  Skipped (already exists): ${migration.filename}\n`);
          continue;
        }
        
        console.error(`❌ Error in migration ${migration.filename}:`);
        console.error(error.message);
        if (error.position) {
          console.error(`   Position: ${error.position}`);
        }
        console.error('\n🛑 Stopping migration process.\n');
        throw error;
      }
    }

    console.log('✅ All migrations completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Check for dry-run flag
const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');

if (dryRun) {
  console.log('🔍 DRY RUN MODE\n');
  getMigrationFiles().then(files => {
    console.log(`📦 Would execute ${files.length} migration(s):\n`);
    files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.filename}`);
    });
    console.log('\n✅ Dry run complete. No migrations executed.\n');
  });
} else {
  runMigrations().catch(console.error);
}

