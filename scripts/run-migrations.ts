#!/usr/bin/env node
/**
 * Supabase Migration Runner
 * Executes all migration files in supabase/migrations/ in chronological order
 *
 * Usage:
 *   npm run migrate
 *   npm run migrate:dry-run  (preview only)
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL');
  console.error(
    'Required: SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY as fallback)'
  );
  console.error(
    '\nNote: For migrations, SUPABASE_SERVICE_ROLE_KEY is recommended for bypassing RLS'
  );
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface MigrationFile {
  filename: string;
  timestamp: string;
  path: string;
}

/**
 * Get all migration files sorted by timestamp
 */
async function getMigrationFiles(): Promise<MigrationFile[]> {
  const migrationsDir = join(process.cwd(), 'supabase', 'migrations');

  try {
    const files = await readdir(migrationsDir);

    // Filter SQL files and extract timestamps
    const migrationFiles: MigrationFile[] = files
      .filter((file) => file.endsWith('.sql'))
      .map((file) => {
        // Extract timestamp from filename: YYYYMMDDHHMMSS_description.sql
        const match = file.match(/^(\d{14})_(.+)\.sql$/);
        if (!match) {
          console.warn(`⚠️  Skipping file with invalid naming: ${file}`);
          return null;
        }

        return {
          filename: file,
          timestamp: match[1],
          path: join(migrationsDir, file),
        };
      })
      .filter((file): file is MigrationFile => file !== null)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return migrationFiles;
  } catch (error) {
    console.error('❌ Error reading migrations directory:', error);
    process.exit(1);
  }
}

/**
 * Read and parse SQL file
 */
async function readMigrationFile(filePath: string): Promise<string> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`❌ Error reading migration file: ${filePath}`, error);
    throw error;
  }
}

/**
 * Execute SQL using Supabase RPC (requires a function) or direct query
 * Note: Supabase JS client doesn't support raw SQL execution directly
 * We'll use the REST API's rpc endpoint or create a helper function
 */
async function executeSQL(sql: string, migrationName: string): Promise<void> {
  // Split SQL into individual statements
  // Remove comments and empty lines, then split by semicolon
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'))
    .filter((s) => !s.match(/^\s*\/\*[\s\S]*?\*\//)); // Remove block comments

  console.log(
    `\n📝 Executing ${statements.length} statements from ${migrationName}...`
  );

  // For each statement, execute via Supabase
  // Note: We'll use a workaround - execute via REST API or use pg library
  // For now, let's use a simpler approach: execute the entire SQL as one query
  // using Supabase's REST API directly

  try {
    // Use Supabase REST API to execute SQL
    // This requires the service role key
    if (!supabaseServiceKey) {
      throw new Error('Supabase service key is required');
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ sql_query: sql }),
    });

    if (!response.ok) {
      // Fallback: Try executing via direct PostgreSQL connection
      // For now, we'll use a different approach
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    // If RPC doesn't exist, we need to use pg library
    console.warn(
      '⚠️  Direct SQL execution not available. Using alternative method...'
    );
    throw error;
  }
}

/**
 * Alternative: Execute SQL using pg library (PostgreSQL client)
 */
async function executeSQLWithPG(
  sql: string,
  migrationName: string
): Promise<void> {
  // This requires the pg library
  // We'll check if it's available
  try {
    const { Client } = await import('pg');

    // Get database connection string from environment
    const databaseUrl =
      process.env.DATABASE_URL ||
      process.env.SUPABASE_DB_URL ||
      `${supabaseUrl?.replace('https://', '').replace('.supabase.co', '')}.pooler.supabase.com`;

    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL or SUPABASE_DB_URL environment variable required'
      );
    }

    const client = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();
    console.log(`\n📝 Executing migration: ${migrationName}...`);

    try {
      await client.query(sql);
      console.log(`✅ Migration completed: ${migrationName}`);
    } catch (error) {
      console.error(`❌ Error executing migration ${migrationName}:`, error);
      throw error;
    } finally {
      await client.end();
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Cannot find module')
    ) {
      console.error(
        '❌ pg library not found. Install it with: npm install --save-dev pg @types/pg'
      );
      console.error('   Or use Supabase CLI: npm install -g supabase');
    }
    throw error;
  }
}

/**
 * Main migration runner
 */
async function runMigrations(dryRun: boolean = false): Promise<void> {
  console.log('🚀 Supabase Migration Runner\n');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
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

  if (dryRun) {
    console.log('\n✅ Dry run complete. No migrations executed.');
    return;
  }

  console.log('\n🔄 Starting migrations...\n');

  for (const migration of migrationFiles) {
    try {
      const sql = await readMigrationFile(migration.path);

      // Try to execute using pg library first
      try {
        await executeSQLWithPG(sql, migration.filename);
      } catch (error) {
        // If pg fails, provide instructions
        console.error(
          `\n❌ Failed to execute migration: ${migration.filename}`
        );
        console.error('\n💡 Solutions:');
        console.error(
          '   1. Install pg library: npm install --save-dev pg @types/pg'
        );
        console.error('   2. Set DATABASE_URL environment variable');
        console.error('   3. Or use Supabase CLI: supabase db push');
        throw error;
      }
    } catch (error) {
      console.error(`\n❌ Migration failed: ${migration.filename}`);
      console.error('Stopping migration process.\n');
      process.exit(1);
    }
  }

  console.log('\n✅ All migrations completed successfully!');
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-d');

// Run migrations
runMigrations(dryRun).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
