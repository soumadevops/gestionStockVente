const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSqlFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Running ${path.basename(filePath)}...`);

    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error(`Error in ${path.basename(filePath)}:`, error);
      return false;
    }

    console.log(`✓ ${path.basename(filePath)} completed successfully`);
    return true;
  } catch (err) {
    console.error(`Failed to run ${path.basename(filePath)}:`, err.message);
    return false;
  }
}

async function setupDatabase() {
  console.log('Starting database setup...');

  const scriptsDir = path.join(__dirname, 'scripts');
  const sqlFiles = fs.readdirSync(scriptsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()
    .map(file => path.join(scriptsDir, file));

  for (const sqlFile of sqlFiles) {
    const success = await runSqlFile(sqlFile);
    if (!success) {
      console.error('Database setup failed');
      process.exit(1);
    }
  }

  console.log('✓ Database setup completed successfully!');
}

setupDatabase().catch(console.error);