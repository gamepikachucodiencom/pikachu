/**
 * USAGE EXAMPLES for getVietnameseError()
 * 
 * This file demonstrates how to use the Vietnamese error mapping utility
 * in different scenarios throughout your application.
 */

import { getVietnameseError } from './error-mapping';
// Dùng useToast: const { showToast } = useToast(); showToast(getVietnameseError(error), 'error');

// ============================================
// Example 1: Login Page (Client Component)
// ============================================
export async function exampleLogin() {
  // TODO: Import supabase client if this example is used
  // import { supabase } from '@/lib/supabase/client';
  try {
    // @ts-expect-error - Example code, supabase not imported
    const { data, error } = await (supabase as any).auth.signInWithPassword({
      email: 'user@example.com',
      password: 'password',
    });

    if (error) throw error;

    // Success handling...
  } catch (error) {
    // showToast(getVietnameseError(error), 'error');
  }
}

// ============================================
// Example 2: Registration (Client Component)
// ============================================
export async function exampleRegister() {
  try {
    // @ts-expect-error - Example code, supabase not imported
    const { data, error } = await supabase.auth.signUp({
      email: 'user@example.com',
      password: 'password',
    });

    if (error) throw error;

    // Success handling...
  } catch (error) {
    // showToast(getVietnameseError(error), 'error');
  }
}

// ============================================
// Example 3: Database Operations (Client Component)
// ============================================
export async function exampleDatabaseOperation() {
  try {
    // @ts-expect-error - Example code, supabase not imported
    const { data, error } = await supabase
      .from('profiles')
      .insert({ username: 'testuser', email: 'test@example.com' });

    if (error) throw error;

    // Success handling...
  } catch (error) {
    // showToast(getVietnameseError(error), 'error');
  }
}

// ============================================
// Example 4: Using with State (for form errors)
// ============================================
import { useState } from 'react';

export function exampleWithState() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      // Your operation...
    } catch (err) {
      setError(getVietnameseError(err));
    }
  };

  return (
    <div>
      {error ? <div className="error">{error}</div> : null}
      {/* Your form */}
    </div>
  );
}

// ============================================
// Example 5: Server Component (API Route)
// ============================================
export async function exampleServerComponent() {
  try {
    // @ts-expect-error - Example code, createServerClient not imported
    const supabase = await (createServerClient as any)();
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('*');

    if (error) throw error;

    return { data };
  } catch (error) {
    // In server components, you might want to return the error
    // or redirect with an error message
    return {
      error: getVietnameseError(error),
    };
  }
}

// ============================================
// Example 6: API Route Handler
// ============================================
export async function POST(request: Request) {
  try {
    // Your logic...
    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: getVietnameseError(error),
      },
      { status: 400 }
    );
  }
}

// ============================================
// Example 7: Custom Error Handling with Context
// ============================================
import { getVietnameseErrorWithLog } from './error-mapping';

export async function exampleWithLogging() {
  try {
    // Your operation...
  } catch (error) {
    // This will log the error with context for debugging
    const message = getVietnameseErrorWithLog(error, 'User Registration');
    // showToast(message, 'error');
  }
}

