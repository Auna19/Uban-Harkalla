import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('No database URL provided in environment');
  process.exit(1);
}

const sql = neon(dbUrl);

async function restock() {
  await sql`UPDATE product_variations SET stock_quantity = 25 WHERE stock_quantity < 10`;
  await sql`UPDATE products SET stock_quantity = 100 WHERE stock_quantity < 10`;
  console.log('✓ Inventory restocked successfully');
}

restock().catch(console.error);
