import { router, procedure } from '../trpc';
import { prisma } from '@tuscany/db';
import { z } from 'zod';

export const experienceRouter = router({
  list: procedure
    .input(z.object({ locale: z.string().default('en') }).optional())
    .query(async () => {
      return prisma.experience.findMany({
        where: { isActive: true },
        orderBy: { id: 'asc' },
      });
    }),

  getBySlug: procedure.input(z.string()).query(async ({ input }) => {
    return prisma.experience.findUnique({
      where: { slug: input },
    });
  }),
});
