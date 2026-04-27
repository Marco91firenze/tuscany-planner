import { router, procedure } from '../trpc';
import { prisma } from '../../lib/prisma';
import { checkParticipantConflict, checkPerkState, checkGuestOverlap } from '../../lib/core';
import { z } from 'zod';

const SlotEnum = z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY']);

const AddItemInput = z.object({
  tripId: z.string(),
  experienceId: z.string(),
  date: z.string().pipe(z.coerce.date()),
  slot: SlotEnum,
  participants: z.number().min(1),
  participantNames: z.array(z.string()).default([]),
});

export const calendarRouter = router({
  addItem: procedure.input(AddItemInput).mutation(async ({ input }) => {
    const trip = await prisma.trip.findUnique({
      where: { id: input.tripId },
      include: { items: true },
    });

    if (!trip) throw new Error('Trip not found');

    // Per-guest overlap (same person can't be in two overlapping experiences)
    const itemsWithExp = await prisma.itineraryItem.findMany({
      where: { tripId: input.tripId },
      include: { experience: true },
    });
    const guestOverlap = checkGuestOverlap(
      itemsWithExp,
      input.date,
      input.slot,
      input.participantNames
    );
    if (guestOverlap.hasConflict) {
      const e: any = new Error(guestOverlap.reason || 'Guest already booked in overlapping slot');
      e.code = 'BAD_REQUEST';
      e.conflict = {
        type: 'GUEST_OVERLAP',
        conflictingItemId: guestOverlap.conflictingItemId,
        conflictingExperienceSlug: guestOverlap.conflictingExperienceSlug,
        conflictingSlot: guestOverlap.conflictingSlot,
        conflictingGuestNames: guestOverlap.conflictingGuestNames,
      };
      throw e;
    }

    // Party-size conflict (parallel tracks must fit within partySize)
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
        tripId: input.tripId,
        experienceId: input.experienceId,
        date: new Date(input.date),
        slot: input.slot,
        participants: input.participants,
        participantNames: input.participantNames,
      },
      include: { experience: true },
    });
  }),

  removeItem: procedure.input(z.string()).mutation(async ({ input }) => {
    try {
      return await prisma.itineraryItem.delete({ where: { id: input } });
    } catch (err: any) {
      // Record not found
      if (err?.code === 'P2025') {
        const e: any = new Error('Item not found');
        e.code = 'NOT_FOUND';
        throw e;
      }
      throw err;
    }
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
