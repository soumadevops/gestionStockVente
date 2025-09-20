const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set');
  process.exit(1);
}

console.log('🔧 Database Setup Instructions:');
console.log('');
console.log('Since Supabase doesn\'t allow direct SQL execution from client-side code,');
console.log('you need to run these SQL scripts manually in your Supabase dashboard:');
console.log('');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to the SQL Editor');
console.log('3. Run the following scripts in order:');
console.log('');

const scriptsDir = path.join(__dirname, 'scripts');
const sqlFiles = fs.readdirSync(scriptsDir)
  .filter(file => file.endsWith('.sql'))
  .sort();

sqlFiles.forEach((file, index) => {
  const filePath = path.join(scriptsDir, file);
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`${index + 1}. ${file}`);
  console.log('```sql');
  console.log(sql.trim());
  console.log('```');
  console.log('');
});

console.log('🚨 CRITICAL FIX: Run this script to resolve the RLS policy violation error:');
console.log('');
console.log('📋 Quick Setup Command (run in Supabase SQL Editor):');
console.log('');
console.log('Run this UPDATED script to fix the "new row violates row-level security policy" error:');
console.log('```sql');
const userIdScript = fs.readFileSync(path.join(scriptsDir, '010_add_user_id_to_sales_and_invoices.sql'), 'utf8');
console.log(userIdScript.trim());
console.log('```');
console.log('');
console.log('✅ This script will:');
console.log('   • Create invoices and invoice_items tables if missing');
console.log('   • Add user_id columns to all tables');
console.log('   • Set up FIXED Row Level Security (RLS) policies');
console.log('   • Create necessary indexes for performance');
console.log('   • Ensure proper user authentication for INSERT operations');
console.log('');
console.log('🔧 The key fix: Updated RLS policies to properly handle user authentication');
console.log('   during INSERT operations while maintaining security.');
console.log('');

console.log('⚠️  IMPORTANT: Make sure to run these scripts in your Supabase SQL Editor, not from this script.');
console.log('🚀 After running the scripts, restart your Next.js application.');
console.log('');
console.log('Alternatively, you can use the Supabase CLI if you have it installed:');
console.log('supabase db push');
console.log('');
console.log('📖 For more information, check the Supabase documentation on migrations.');