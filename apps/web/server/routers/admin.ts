import { router, procedure } from '../trpc';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

const InquiryStatusEnum = z.enum(['NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST']);

// Admin token check helper
function requireAdmin(input: any) {
  const token = input?._adminToken;
  const expected = process.env.SESSION_SECRET;
  if (!expected) {
    throw new Error('Admin auth not configured');
  }
  if (!token || token !== expected) {
    const err: any = new Error('Unauthorized');
    err.code = 'UNAUTHORIZED';
    throw err;
  }
}

export const adminRouter = router({
  inquiries: router({
    list: procedure
      .input(
        z.object({
          _adminToken: z.string(),
          status: InquiryStatusEnum.optional(),
          limit: z.number().default(50),
        })
      )
      .query(async ({ input }) => {
        requireAdmin(input);
        return prisma.inquiry.findMany({
          where: input.status ? { status: input.status } : undefined,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
          include: { trip: { include: { items: { include: { experience: true } } } } },
        });
      }),

    updateStatus: procedure
      .input(z.object({ _adminToken: z.string(), id: z.string(), status: InquiryStatusEnum }))
      .mutation(async ({ input }) => {
        requireAdmin(input);
        return prisma.inquiry.update({
          where: { id: input.id },
          data: { status: input.status },
        });
      }),
  }),

  experiences: router({
    update: procedure
      .input(
        z.object({
          _adminToken: z.string(),
          id: z.string(),
          blockedDates: z.array(z.string().pipe(z.coerce.date())).optional(),
        })
      )
      .mutation(async ({ input }) => {
        requireAdmin(input);
        return prisma.experience.update({
          where: { id: input.id },
          data: {
            blockedDates: input.blockedDates || [],
          },
        });
      }),
  }),
});
