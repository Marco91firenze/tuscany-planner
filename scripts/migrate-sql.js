#!/usr/bin/env node

/**
 * Direct SQL migration using pg library
 * Bypasses Prisma's introspection - works with poolers
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  console.log('🔄 Running direct SQL migration via pg...');

  const client = new Client({
    connectionString: dbUrl,
    statement_timeout: 30000,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read migration SQL
    const migrationSql = fs.readFileSync(
      path.join(__dirname, '../packages/db/prisma/migrations/0_init/migration.sql'),
      'utf-8'
    );

    // Split into individual statements and execute
    // Remove comments and split by semicolon
    const cleaned = migrationSql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = cleaned
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await client.query(stmt);
        console.log(`  ✓ Statement ${i + 1}/${statements.length}`);
      } catch (err) {
        // Ignore "already exists" errors - idempotent
        if (err.message.includes('already exists')) {
          console.log(`  ⚠️  Statement ${i + 1} already applied (skipping)`);
        } else {
          throw err;
        }
      }
    }

    console.log('✅ Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
