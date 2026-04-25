import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Fix for connection pooler: disable prepared statement caching
// Supabase PgBouncer in transaction mode can't handle Prisma's prepared statements
const dbUrl = new URL(process.env.DATABASE_URL || '');
if (!dbUrl.searchParams.has('statement_cache_size')) {
  dbUrl.searchParams.set('statement_cache_size', '0');
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl.toString(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
