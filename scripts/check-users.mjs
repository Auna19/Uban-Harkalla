import fs from 'fs';
import { neon } from '@neondatabase/serverless';

const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/DATABASE_URL="?([^"\r\n]+)"?/);
const sql = neon(match[1]);

async function check() {
  const users = await sql`SELECT id, full_name, email, role, password_hash FROM public.users`;
  console.log('Users in Neon DB count:', users.length);
  console.log('Users in Neon DB:', users);
}

check().catch(console.error);
