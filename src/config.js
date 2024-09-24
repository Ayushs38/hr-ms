import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qtsntsivgbmcrlgxlnxq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0c250c2l2Z2JtY3JsZ3hsbnhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTAwMTUsImV4cCI6MjA0MjQ2NjAxNX0.B4daxFUPribWm9L_xABlxWBVGYN5y_j0Lv1T8Yyh-iI'
export const supabase = createClient(supabaseUrl, supabaseKey)

