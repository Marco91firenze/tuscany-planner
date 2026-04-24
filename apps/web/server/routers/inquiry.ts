import { router, procedure } from '../trpc';
import { prisma } from '@tuscany/db';
import { z } from 'zod';

const SubmitInquiryInput = z.object({
  tripId: z.string(),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  specialNotes: z.string().optional(),
});

export const inquiryRouter = router({
  submit: procedure.input(SubmitInquiryInput).mutation(async ({ input }) => {
    const inquiry = await prisma.inquiry.create({
      data: {
        ...input,
        status: 'NEW',
      },
      include: { trip: { include: { items: { include: { experience: true } } } } },
    });

    // TODO: Send email via Resend
    // TODO: Notify operator

    return inquiry;
  }),

  getStatus: procedure.input(z.string()).query(async ({ input }) => {
    return prisma.inquiry.findUnique({
      where: { id: input },
      include: { trip: { include: { items: { include: { experience: true } } } } },
    });
  }),
});
