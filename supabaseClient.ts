import { createClient } from '@supabase/supabase-js';

// Configuração do Cliente Supabase
const SUPABASE_URL = 'https://cxnamtgphelbrsecedkb.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bmFtdGdwaGVsYnJzZWNlZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NjU0ODUsImV4cCI6MjA4MDQ0MTQ4NX0.WdjXX3PAnYCjS_drxYL3hurwmq4XANtTjhmCjcKhamk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);