import { router, procedure } from '../trpc';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

const TripCreateInput = z.object({
  checkIn: z.date(),
  checkOut: z.date(),
  partySize: z.number().min(1).max(20),
  language: z.string().default('en'),
  hotelName: z.string().optional(),
});

export const tripRouter = router({
  create: procedure.input(TripCreateInput).mutation(async ({ input }) => {
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    return prisma.trip.create({
      data: {
        sessionToken,
        ...input,
      },
    });
  }),

  get: procedure.input(z.string()).query(async ({ input }) => {
    return prisma.trip.findUnique({
      where: { id: input },
      include: { items: { include: { experience: true } } },
    });
  }),

  update: procedure
    .input(z.object({ id: z.string(), data: TripCreateInput.partial() }))
    .mutation(async ({ input }) => {
      return prisma.trip.update({
        where: { id: input.id },
        data: input.data,
      });
    }),
});
