import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Log successful connection
console.log('Connected to Supabase project:', supabaseUrl);

// Test table creation
const testTable = async () => {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error accessing submissions table:', error.message);
  } else {
    console.log('Successfully connected to submissions table');
  }
};

testTable();