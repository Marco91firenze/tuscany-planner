import { router, procedure } from '../trpc';
import { prisma } from '../../lib/prisma';
import { checkParticipantConflict, checkPerkState } from '@tuscany/core';
import { z } from 'zod';

const SlotEnum = z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY']);

const AddItemInput = z.object({
  tripId: z.string(),
  experienceId: z.string(),
  date: z.date(),
  slot: SlotEnum,
  participants: z.number().min(1),
});

export const calendarRouter = router({
  addItem: procedure.input(AddItemInput).mutation(async ({ input }) => {
    const trip = await prisma.trip.findUnique({
      where: { id: input.tripId },
      include: { items: true },
    });

    if (!trip) throw new Error('Trip not found');

    const conflict = checkParticipantConflict(
      trip.items,
      input.date,
      input.slot,
      input.participants,
      trip.partySize
    );

    if (conflict.hasConflict) {
      throw new Error(conflict.reason || 'Participant conflict');
    }

    return prisma.itineraryItem.create({
      data: {
        ...input,
        date: new Date(input.date),
      },
      include: { experience: true },
    });
  }),

  removeItem: procedure.input(z.string()).mutation(async ({ input }) => {
    return prisma.itineraryItem.delete({
      where: { id: input },
    });
  }),

  validate: procedure.input(z.string()).query(async ({ input }) => {
    const trip = await prisma.trip.findUnique({
      where: { id: input },
      include: { items: true },
    });

    if (!trip) throw new Error('Trip not found');

    const perk = checkPerkState({
      tripId: trip.id,
      checkIn: trip.checkIn,
      checkOut: trip.checkOut,
      partySize: trip.partySize,
      items: trip.items,
    });

    return perk;
  }),
});
