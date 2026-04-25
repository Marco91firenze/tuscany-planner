import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Fix for Supabase connection pooler (PgBouncer transaction mode)
// Required: pgbouncer=true tells Prisma to skip prepared statements
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || '';
  if (!url) return url;

  try {
    const parsed = new URL(url);
    // Always set pgbouncer=true for Supabase pooler URLs
    if (parsed.hostname.includes('pooler.supabase')) {
      parsed.searchParams.set('pgbouncer', 'true');
      parsed.searchParams.set('connection_limit', '1');
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
