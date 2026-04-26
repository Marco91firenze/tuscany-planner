import { router, procedure } from '../trpc';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

// Base schema (without refinements) — used for partial updates
const TripBaseSchema = z.object({
  checkIn: z.string().pipe(z.coerce.date()),
  checkOut: z.string().pipe(z.coerce.date()),
  partySize: z.number().min(1).max(20),
  language: z.string().default('en'),
  hotelName: z.string().optional(),
  guestNames: z.array(z.string()).optional(),
});

// Validated create input
const TripCreateInput = TripBaseSchema
  .refine((data) => data.checkOut > data.checkIn, {
    message: 'Check-out must be after check-in',
    path: ['checkOut'],
  })
  .refine(
    (data) => {
      const days = (data.checkOut.getTime() - data.checkIn.getTime()) / (1000 * 60 * 60 * 24);
      return days <= 30;
    },
    {
      message: 'Stay length cannot exceed 30 days',
      path: ['checkOut'],
    }
  );

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
    .input(z.object({ id: z.string(), data: TripBaseSchema.partial() }))
    .mutation(async ({ input }) => {
      try {
        return await prisma.trip.update({
          where: { id: input.id },
          data: input.data,
        });
      } catch (err: any) {
        if (err?.code === 'P2025') {
          const e: any = new Error('Trip not found');
          e.code = 'NOT_FOUND';
          throw e;
        }
        throw err;
      }
    }),
});
