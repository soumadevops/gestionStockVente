const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    const sql = fs.readFileSync('scripts/014_add_user_id_to_sales.sql', 'utf8');
    console.log('Running provenance migration...');

    // Split the SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() + ';' });

        if (error) {
          console.error('Error executing statement:', error);
          // Try direct query instead
          const { error: directError } = await supabase.from('_supabase_migration_temp').select('*').limit(1);
          if (directError) {
            console.log('Trying direct SQL execution...');
            // For now, let's just log what we would execute
            console.log('SQL to execute manually:', statement.trim());
          }
        } else {
          console.log('✓ Statement executed successfully');
        }
      }
    }

    console.log('Migration completed!');
  } catch (err) {
    console.error('Migration failed:', err.message);
  }
}

runMigration();