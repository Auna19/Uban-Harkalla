import { neon } from '@neondatabase/serverless';

const DEFAULT_NEON_DATABASE_URL =
  'postgresql://neondb_owner:npg_EydW5L0PtfAF@ep-delicate-math-bdjxdk6q-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require';

const rawUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NEON_DATABASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DATABASE_URL) ||
  DEFAULT_NEON_DATABASE_URL;

const databaseUrl = rawUrl.trim().replace(/^["']|["']$/g, '');

export const isNeonConfigured = Boolean(
  databaseUrl &&
  (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')) &&
  !databaseUrl.includes('your-neon-hostname') &&
  !databaseUrl.includes('your-user')
);

/**
 * Serverless Neon SQL client over HTTPS.
 * Can be invoked with template literals: await sql`SELECT * FROM products WHERE id = ${id}`
 */
export const sql = isNeonConfigured ? neon(databaseUrl) : null;

/**
 * Helper to safely execute a Neon SQL query with fallback
 */
export async function queryNeon(queryFn, fallbackFn) {
  if (!isNeonConfigured || !sql) {
    return typeof fallbackFn === 'function' ? fallbackFn() : fallbackFn;
  }
  try {
    return await queryFn(sql);
  } catch (err) {
    console.warn('Neon query error, falling back to local storage:', err);
    return typeof fallbackFn === 'function' ? fallbackFn() : fallbackFn;
  }
}
