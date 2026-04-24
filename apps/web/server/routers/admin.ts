import { router, procedure } from '../trpc';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

const InquiryStatusEnum = z.enum(['NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST']);

export const adminRouter = router({
  inquiries: router({
    list: procedure
      .input(z.object({ status: InquiryStatusEnum.optional(), limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return prisma.inquiry.findMany({
          where: input.status ? { status: input.status } : undefined,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
          include: { trip: { include: { items: { include: { experience: true } } } } },
        });
      }),

    updateStatus: procedure
      .input(z.object({ id: z.string(), status: InquiryStatusEnum }))
      .mutation(async ({ input }) => {
        return prisma.inquiry.update({
          where: { id: input.id },
          data: { status: input.status },
        });
      }),
  }),

  experiences: router({
    update: procedure
      .input(z.object({ id: z.string(), blockedDates: z.array(z.date()).optional() }))
      .mutation(async ({ input }) => {
        return prisma.experience.update({
          where: { id: input.id },
          data: {
            blockedDates: input.blockedDates || [],
          },
        });
      }),
  }),
});
