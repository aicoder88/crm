import { createClient } from '@supabase/supabase-js'

// Use fallback values during build time if env vars are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types will be generated from Supabase schema
export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          store_name: string
          phone: string | null
          owner_manager_name: string | null
          type: 'B2B' | 'B2C' | 'Affiliate'
          status: 'Qualified' | 'Interested' | 'Not Qualified' | 'Not Interested' | 'Dog Store'
          notes: string | null
          stripe_customer_id: string | null
          website: string | null
          location_lat: number | null
          location_lng: number | null
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      // Additional tables will be added as we build them
    }
  }
}
