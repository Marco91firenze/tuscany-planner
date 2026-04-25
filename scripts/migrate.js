#!/usr/bin/env node

/**
 * Migration helper: Apply Prisma migrations during build
 * NOTE: Logs warnings but doesn't fail build (migrations can be run manually)
 */

const { spawnSync } = require('child_process');

async function migrate() {
  console.log('🔄 Attempting database migrations...');

  try {
    const result = spawnSync(
      'npx',
      [
        'prisma',
        'migrate',
        'deploy',
        '--schema=packages/db/prisma/schema.prisma'
      ],
      {
        stdio: 'pipe',
        timeout: 30000,  // 30s timeout
        cwd: process.cwd()
      }
    );

    if (result.error) {
      console.warn('⚠️  Migration spawn error (non-fatal):', result.error.message);
      console.log('💡 Migrations may need manual application');
      process.exit(0);  // Don't fail build
    }

    if (result.status === 0) {
      console.log('✅ Migrations deployed successfully');
      process.exit(0);
    } else {
      console.warn(`⚠️  Migration process exited with code ${result.status}`);
      if (result.stderr) console.warn('stderr:', result.stderr.toString());
      console.log('💡 Run "pnpm db:push" or "pnpm db:migrate" manually if needed');
      process.exit(0);  // Non-fatal
    }
  } catch (error) {
    console.warn('⚠️  Migration error (non-fatal):', error.message);
    process.exit(0);
  }
}

migrate();
