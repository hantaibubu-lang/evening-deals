const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkTables() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const { error: usersErr } = await supabase.from('users').select('id').limit(1);
  const { error: storesErr } = await supabase.from('stores').select('id').limit(1);
  const { error: productsErr } = await supabase.from('products').select('id').limit(1);
  
  console.log('users table:', usersErr ? `NOT FOUND (${usersErr.code} - ${usersErr.message})` : 'EXISTS');
  console.log('stores table:', storesErr ? `NOT FOUND (${storesErr.code} - ${storesErr.message})` : 'EXISTS');
  console.log('products table:', productsErr ? `NOT FOUND (${productsErr.code} - ${productsErr.message})` : 'EXISTS');
}

checkTables().catch(console.error);
