import fs from 'fs';
import { neon } from '@neondatabase/serverless';

const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/DATABASE_URL="?([^"\r\n]+)"?/);
const sql = neon(match[1]);

async function seedAdmin() {
  console.log('Seeding default administrator into Neon PostgreSQL...');

  const result = await sql`
    INSERT INTO public.users (
      id, full_name, email, phone_number, password_hash, role
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      'UBAN HARKALLA Super Admin',
      'admin@ubanharkalla.com',
      '+2348123456789',
      'admin123',
      'super_admin'
    )
    ON CONFLICT (email) DO UPDATE SET
      role = 'super_admin',
      password_hash = 'admin123',
      full_name = 'UBAN HARKALLA Super Admin'
    RETURNING id, full_name, email, role;
  `;

  console.log('Admin user seeded in Neon:', result[0]);

  // Also seed customer demo user in Neon
  const custResult = await sql`
    INSERT INTO public.users (
      id, full_name, email, phone_number, password_hash, role
    ) VALUES (
      '00000000-0000-0000-0000-000000000002',
      'Musa Abdullahi',
      'customer@ubanharkalla.com',
      '+2348098765432',
      'customer123',
      'customer'
    )
    ON CONFLICT (email) DO UPDATE SET
      password_hash = 'customer123',
      full_name = 'Musa Abdullahi'
    RETURNING id, full_name, email, role;
  `;

  console.log('Customer user seeded in Neon:', custResult[0]);
}

seedAdmin().catch(console.error);
