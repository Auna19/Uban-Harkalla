import fs from 'fs';
import { neon } from '@neondatabase/serverless';

const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/DATABASE_URL="?([^"\r\n]+)"?/);
const sql = neon(match[1]);

async function seedAdmin() {
  console.log('Ensuring schema columns and seeding users into Neon PostgreSQL...');

  await sql`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true`;
  await sql`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_number TEXT`;

  const result = await sql`
    INSERT INTO public.users (
      id, full_name, email, phone_number, password_hash, role, is_active
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      'UBAN HARKALLA Super Admin',
      'admin@ubanharkalla.com',
      '+2348123456789',
      'admin123',
      'super_admin',
      true
    )
    ON CONFLICT (email) DO UPDATE SET
      role = 'super_admin',
      password_hash = 'admin123',
      full_name = 'UBAN HARKALLA Super Admin',
      is_active = true
    RETURNING id, full_name, email, role;
  `;

  console.log('Admin user seeded in Neon:', result[0]);

  // Seed customer demo users matching Test Accounts in docx specification:
  // CUST-A: Abubakar Garba / abubakar@test.ng
  // CUST-B: Chidi Eze / chidi@test.ng
  // CUST-S: Suspended User / suspended@test.ng (is_active = false)
  // Demo: customer@ubanharkalla.com
  const users = [
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Musa Abdullahi',
      email: 'customer@ubanharkalla.com',
      phone: '+2348098765432',
      pass: 'customer123',
      role: 'customer',
      active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Abubakar Garba',
      email: 'abubakar@test.ng',
      phone: '08031234567',
      pass: 'Password123!',
      role: 'customer',
      active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Chidi Eze',
      email: 'chidi@test.ng',
      phone: '08129876543',
      pass: 'Password123!',
      role: 'customer',
      active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      name: 'Suspended Account',
      email: 'suspended@test.ng',
      phone: '07011223344',
      pass: 'Password123!',
      role: 'customer',
      active: false,
    },
  ];

  for (const u of users) {
    const res = await sql`
      INSERT INTO public.users (
        id, full_name, email, phone_number, password_hash, role, is_active
      ) VALUES (
        ${u.id}, ${u.name}, ${u.email}, ${u.phone}, ${u.pass}, ${u.role}, ${u.active}
      )
      ON CONFLICT (email) DO UPDATE SET
        password_hash = ${u.pass},
        full_name = ${u.name},
        is_active = ${u.active}
      RETURNING id, full_name, email, role, is_active;
    `;
    console.log('User seeded in Neon:', res[0]);
  }
}

seedAdmin().catch(console.error);
