import { createClient } from '@supabase/supabase-js';

// Supabase credentials are loaded from Vite environment variables.
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profile_photo?: string;
  role: 'citizen' | 'lawyer' | 'judge' | 'clerk';
  created_at: string;
  updated_at: string;
  
  // Role-specific fields
  citizen_id?: string;
  license_number?: string;
  specialization?: string;
  law_firm?: string;
  employee_id?: string;
  court_assigned?: string;
  judge_id?: string;
  years_experience?: number;
}
