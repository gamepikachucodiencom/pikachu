# Supabase Setup Guide

This project uses Supabase for backend services. Follow these steps to set up Supabase.

## 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details and wait for the project to be created

## 2. Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## 3. Configure Environment Variables

Create a `.env.local` file in the root of your project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the placeholder values with your actual Supabase credentials.

**Important:** Never commit `.env.local` to version control. It's already in `.gitignore`.

## 4. Install Dependencies

If you haven't already, install the Supabase packages:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## 5. Project Structure

The Supabase integration is organized as follows:

- `lib/supabase/client.ts` - Client-side Supabase client (for Client Components)
- `lib/supabase/server.ts` - Server-side Supabase client (for Server Components)
- `lib/supabase/middleware.ts` - Middleware helper for session management
- `lib/supabase/types.ts` - TypeScript types for your database schema
- `middleware.ts` - Next.js middleware that handles session refresh

## 6. Usage Examples

### Client Component Example

```typescript
'use client';

import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('your_table')
        .select('*');

      if (error) {
        console.error('Error:', error);
      } else {
        setData(data);
      }
    }

    fetchData();
  }, []);

  return <div>{/* Your component */}</div>;
}
```

### Server Component Example

```typescript
import { createServerClient } from '@/lib/supabase/server';

export default async function MyServerComponent() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('your_table')
    .select('*');

  if (error) {
    return <div>Error loading data</div>;
  }

  return <div>{/* Render your data */}</div>;
}
```

### Authentication Example

```typescript
'use client';

import { supabase } from '@/lib/supabase/client';

// Sign up
async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

// Sign in
async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

// Sign out
async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Get current user
async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
```

## 7. Generate TypeScript Types

To get type safety for your database schema, generate types from your Supabase project:

```bash
npx supabase gen types typescript --project-id <your-project-id> > lib/supabase/types.ts
```

Replace `<your-project-id>` with your actual project ID (found in your project settings).

## 8. Protecting Routes

To protect routes with authentication, edit `lib/supabase/middleware.ts` and uncomment the authentication check. Customize the paths that should be protected.

## Next Steps

- Set up your database tables in the Supabase dashboard
- Configure Row Level Security (RLS) policies
- Set up authentication providers (email, OAuth, etc.)
- Generate and use TypeScript types for type safety

For more information, visit the [Supabase Documentation](https://supabase.com/docs).
