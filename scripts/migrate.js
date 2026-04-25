#!/usr/bin/env node

/**
 * Migration helper: runs Prisma migrate deploy
 * For Vercel builds: tries pooler URL first, falls back to direct URL
 */

const { execSync } = require('child_process');

const poolerUrl = process.env.DATABASE_URL;
const directUrl = 'postgresql://postgres:Cheftonyftw123%21@db.ioeirnvyexddubdcwwdp.supabase.co:5432/postgres?sslmode=require';

async function migrate() {
  // Try with pooler first (for runtime connection pooling)
  console.log('🔄 Running migrations...');

  try {
    // On Vercel, use direct URL for migrations only (pooler doesn't work with Prisma)
    // On local, use whatever DATABASE_URL is set
    const dbUrl = process.env.VERCEL ? directUrl : poolerUrl;

    const cmd = `DATABASE_URL="${dbUrl}" npx prisma migrate deploy --schema=packages/db/prisma/schema.prisma`;
    console.log('📝 Command:', cmd.replace(/PASSWORD/g, '***'));

    execSync(cmd, {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log('✅ Migrations complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
