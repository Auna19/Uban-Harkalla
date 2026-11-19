import fs from 'fs';
import { neon } from '@neondatabase/serverless';

// Load .env
const envFile = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envFile.match(/DATABASE_URL_UNPOOLED="?([^"\r\n]+)"?/) || envFile.match(/DATABASE_URL="?([^"\r\n]+)"?/);

if (!dbUrlMatch) {
  console.error('No DATABASE_URL found in .env');
  process.exit(1);
}

const connectionString = dbUrlMatch[1];
console.log('Connecting to Neon via HTTPS serverless driver...');

const sql = neon(connectionString);

function splitSqlStatements(sqlString) {
  // Remove comments
  const lines = sqlString.split('\n');
  let cleanSql = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('--')) {
      cleanSql += line + '\n';
    }
  }

  // Split by semicolon that is not inside quotes
  const statements = [];
  let current = '';
  let inSingleQuote = false;

  for (let i = 0; i < cleanSql.length; i++) {
    const char = cleanSql[i];
    if (char === "'" && (i === 0 || cleanSql[i - 1] !== '\\')) {
      inSingleQuote = !inSingleQuote;
    }
    if (char === ';' && !inSingleQuote) {
      if (current.trim().length > 0) {
        statements.push(current.trim());
      }
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim().length > 0) {
    statements.push(current.trim());
  }
  return statements;
}

async function run() {
  try {
    const schemaSql = fs.readFileSync('neon/schema.sql', 'utf8');
    const statements = splitSqlStatements(schemaSql);
    console.log(`Found ${statements.length} SQL statements to execute.`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      process.stdout.write(`Executing statement ${i + 1}/${statements.length}... `);
      await sql.query(stmt);
      console.log('OK');
    }

    console.log('\nAll schema statements executed successfully!');

    // Test queries
    const categories = await sql`SELECT id, name, slug FROM public.categories`;
    console.log('Categories in Neon DB:', categories);

    const locations = await sql`SELECT state, city, fee FROM public.delivery_locations`;
    console.log('Delivery locations in Neon DB:', locations);

    const brands = await sql`SELECT name, slug FROM public.brands`;
    console.log('Brands in Neon DB:', brands);

  } catch (err) {
    console.error('\nError executing migration:', err);
    process.exit(1);
  }
}

run();
