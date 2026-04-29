# Supabase Migration Guide

This guide explains how to run database migrations for the Chinese Chess application.

## Prerequisites

Choose one of the following methods:

### Option 1: Using pg Library (Recommended for Direct Execution)

1. Install the PostgreSQL client library:

```bash
npm install --save-dev pg @types/pg
```

2. Get your database connection string from Supabase:
   - Go to Supabase Dashboard → Settings → Database
   - Copy the "Connection string" (URI format)
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3. Set the environment variable:

```bash
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

Or add to `.env.local`:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

4. Run migrations:

```bash
npm run migrate
```

### Option 2: Using Supabase CLI (Recommended for Development)

1. Install Supabase CLI globally:

```bash
npm install supabase
```

2. Link your project:

```bash
supabase link --project-ref <your-project-ref>
```

3. Push migrations:

```bash
npm run migrate:supabase
# or directly:
supabase db push
```

### Option 3: Manual Deployment (Simplest)

1. Open Supabase Dashboard → SQL Editor
2. Copy the entire contents of `supabase/full_deployment.sql`
3. Paste and execute in the SQL Editor

## Available Commands

- `npm run migrate` - Execute all migrations using pg library (requires DATABASE_URL)
- `npm run migrate:dry-run` - Preview migrations without executing
- `npm run migrate:check` - Check if Supabase CLI is available and show migration files
- `npm run migrate:supabase` - Push migrations using Supabase CLI (requires CLI installation)

## Migration Files

Migrations are located in `supabase/migrations/` and are executed in chronological order:

1. `20241130000000_initial_schema.sql` - Base schema
2. `20241220000000_create_profiles.sql` - Profile structure
3. `20241220000001_backfill_profiles.sql` - Data migration
4. `20241220000002_blog_schema.sql` - Blog feature
5. `20241220000003_schema_updates.sql` - Online play updates

## Troubleshooting

### Error: pg library not found

```bash
npm install --save-dev pg @types/pg
```

### Error: DATABASE_URL not set

- Get your connection string from Supabase Dashboard
- Set it as an environment variable or in `.env.local`

### Error: Connection refused

- Verify your database URL is correct
- Check that your IP is allowed in Supabase Dashboard → Settings → Database → Connection Pooling

### Error: Permission denied

- Use the service role key or ensure your connection string has proper permissions
- For migrations, you may need to use the direct database connection (not the pooler)

## Security Notes

- **Never commit** `.env.local` or database URLs to version control
- Use service role key only for migrations, never in client-side code
- The `DATABASE_URL` should use the direct database connection, not the pooler URL

## Migration Best Practices

1. **Always backup** your database before running migrations in production
2. **Test migrations** in a development/staging environment first
3. **Review** migration files before executing
4. **Use dry-run** mode to preview changes: `npm run migrate:dry-run`
5. **Run migrations** in order (they're automatically sorted by timestamp)
