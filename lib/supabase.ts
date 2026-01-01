import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hupdwrzrgapfhhswcxmx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1cGR3cnpyZ2FwZmhoc3djeG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyMTU1ODUsImV4cCI6MjA4Mjc5MTU4NX0.K8EyOKbK2R7NViLOmyyJC5biJGKk4F48RWhda2uGi_E'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
