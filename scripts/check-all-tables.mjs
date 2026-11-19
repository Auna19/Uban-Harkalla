import fs from 'fs';
import { neon } from '@neondatabase/serverless';

const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/DATABASE_URL="?([^"\r\n]+)"?/) || env.match(/VITE_NEON_DATABASE_URL="?([^"\r\n]+)"?/);

if (!match) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}

const connectionString = match[1];
const sql = neon(connectionString);

async function inspectNeonTables() {
  console.log('Querying PostgreSQL information_schema for public tables...\n');

  // Query all tables in public schema
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    ORDER BY table_name ASC;
  `;

  console.log(`Found ${tables.length} tables in Neon public schema:`);
  
  const expectedTables = [
    'users',
    'admin_roles',
    'admin_permissions',
    'admin_role_permissions',
    'categories',
    'brands',
    'attributes',
    'products',
    'product_variations',
    'delivery_locations',
    'orders',
    'order_items',
    'website_content',
    'testimonials',
    'business_settings',
    'audit_logs'
  ];

  const tableSummary = [];

  for (const t of expectedTables) {
    const exists = tables.some(row => row.table_name === t);
    let count = 'N/A';
    if (exists) {
      try {
        const countRes = await sql.query(`SELECT count(*)::int as count FROM public."${t}"`);
        count = countRes[0].count;
      } catch (err) {
        count = `Error: ${err.message}`;
      }
    }
    tableSummary.push({
      table: t,
      exists: exists ? 'YES' : 'NO',
      rows: count
    });
  }

  console.table(tableSummary);

  // Check extensions
  const extensions = await sql`
    SELECT extname, extversion 
    FROM pg_extension 
    WHERE extname IN ('pgcrypto', 'uuid-ossp');
  `;
  console.log('\nExtensions active in Neon:', extensions);

  // Check sample rows from key seed tables
  const delivery = await sql`SELECT state, fee FROM public.delivery_locations LIMIT 5`;
  console.log('\nDelivery Locations sample:', delivery);

  const categories = await sql`SELECT name, slug FROM public.categories LIMIT 5`;
  console.log('\nCategories sample:', categories);

  const brands = await sql`SELECT name, slug FROM public.brands LIMIT 5`;
  console.log('\nBrands sample:', brands);
}

inspectNeonTables().catch(err => {
  console.error('Inspection error:', err);
  process.exit(1);
});
