import fs from 'fs';
import { neon } from '@neondatabase/serverless';

// Read .env
const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/DATABASE_URL="?([^"\r\n]+)"?/) || env.match(/VITE_NEON_DATABASE_URL="?([^"\r\n]+)"?/);

if (!match) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}

const connectionString = match[1];
console.log('Connecting to Neon PostgreSQL production database...');
const sql = neon(connectionString);

async function testServices() {
  console.log('\n--- 1. Testing Neon Connection & Branch Metadata ---');
  const nowResult = await sql`SELECT NOW() as current_time, current_database() as db_name, version() as pg_version`;
  console.log('Postgres Database:', nowResult[0].db_name);
  console.log('Current DB Timestamp:', nowResult[0].current_time);
  console.log('PostgreSQL Engine:', nowResult[0].pg_version.split(' on ')[0]);

  console.log('\n--- 2. Testing Categories Table (Read) ---');
  const categories = await sql`SELECT id, name, slug FROM public.categories ORDER BY display_order ASC`;
  console.log(`Retrieved ${categories.length} categories:`, categories.map(c => c.name).join(', '));

  console.log('\n--- 3. Testing Delivery Locations Table (Read) ---');
  const locations = await sql`SELECT state, city, fee FROM public.delivery_locations ORDER BY display_order ASC`;
  console.log(`Retrieved ${locations.length} delivery zones:`, locations.map(l => `${l.state} (₦${l.fee})`).join(', '));

  console.log('\n--- 4. Testing Brands Table (Read) ---');
  const brands = await sql`SELECT name, slug FROM public.brands ORDER BY display_order ASC`;
  console.log(`Retrieved ${brands.length} brands:`, brands.map(b => b.name).join(', '));

  console.log('\n--- 5. Testing Orders Table (Insert, Select, Cleanup - Roundtrip) ---');
  const testRef = `UBH-TEST-${Date.now()}`;
  const insertOrder = await sql`
    INSERT INTO public.orders (
      order_reference, customer_name, customer_email, customer_phone,
      delivery_method, delivery_state, delivery_address, delivery_fee,
      subtotal_amount, total_amount, payment_method, payment_status, order_status
    ) VALUES (
      ${testRef}, 'Neon Verification Bot', 'bot@ubanharkalla.com', '+234800000000',
      'door_delivery', 'Kano', 'Kano Commercial Hub', 0.00,
      150000.00, 150000.00, 'pay_on_delivery', 'Pending', 'Confirmed'
    ) RETURNING id, order_reference, customer_name, total_amount, order_status
  `;
  console.log('Created test order in Neon:', insertOrder[0]);

  const verifyOrder = await sql`SELECT id, order_reference, customer_name, order_status FROM public.orders WHERE order_reference = ${testRef}`;
  console.log('Verified inserted order:', verifyOrder[0]);

  await sql`DELETE FROM public.orders WHERE order_reference = ${testRef}`;
  console.log('Cleaned up test order successfully.');

  console.log('\n========================================');
  console.log('ALL NEON SERVICES TESTED AND PASSING E2E');
  console.log('========================================');
}

testServices().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
