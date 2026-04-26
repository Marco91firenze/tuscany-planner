#!/usr/bin/env node

/**
 * Direct SQL migration using pg library.
 * Reads ALL migration files in packages/db/prisma/migrations/ in alphabetical order.
 * Each statement runs idempotently — duplicate-object/column errors are skipped.
 * Bypasses Prisma's introspection — works with connection poolers.
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MIGRATIONS_DIR = path.join(__dirname, '../packages/db/prisma/migrations');

const IDEMPOTENT_PATTERNS = [
  'already exists',
  'duplicate key',
  'duplicate column',
  'multiple primary keys',
];

function isIdempotent(msg) {
  if (!msg) return false;
  const lower = msg.toLowerCase();
  return IDEMPOTENT_PATTERNS.some((p) => lower.includes(p));
}

function listMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((d) => {
      const p = path.join(MIGRATIONS_DIR, d);
      return fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, 'migration.sql'));
    })
    .sort();
}

function parseStatements(sql) {
  const cleaned = sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
  return cleaned
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  console.log('🔄 Running direct SQL migrations via pg...');
  const migrations = listMigrations();
  console.log(`📂 Found ${migrations.length} migration(s): ${migrations.join(', ')}`);

  const client = new Client({ connectionString: dbUrl, statement_timeout: 30000 });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    for (const migDir of migrations) {
      const sqlPath = path.join(MIGRATIONS_DIR, migDir, 'migration.sql');
      const sql = fs.readFileSync(sqlPath, 'utf-8');
      const statements = parseStatements(sql);
      console.log(`\n📝 [${migDir}] ${statements.length} statement(s)`);

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
          await client.query(stmt);
          console.log(`  ✓ ${migDir} stmt ${i + 1}/${statements.length}`);
        } catch (err) {
          if (isIdempotent(err.message)) {
            console.log(`  ⚠️  ${migDir} stmt ${i + 1} already applied (skipping)`);
          } else {
            throw err;
          }
        }
      }
    }

    console.log('\n✅ All migrations complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
