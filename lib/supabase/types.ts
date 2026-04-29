// This file can be used to define TypeScript types for your Supabase database
// Run `npx supabase gen types typescript --project-id <your-project-id>` to generate types
// Or use the Supabase CLI: `supabase gen types typescript --local > lib/supabase/types.ts`

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Add your table types here
      // Example:
      // users: {
      //   Row: {
      //     id: string
      //     created_at: string
      //     // ... other columns
      //   }
      //   Insert: {
      //     id?: string
      //     created_at?: string
      //     // ... other columns
      //   }
      //   Update: {
      //     id?: string
      //     created_at?: string
      //     // ... other columns
      //   }
      // }
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
