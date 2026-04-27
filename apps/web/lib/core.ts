// Calendar logic inlined to avoid monorepo module resolution issues
// These functions are pure and safe to duplicate locally

export const DURATION_CLASS = {
  HALF_DAY: 'HALF_DAY',
  FULL_DAY: 'FULL_DAY',
  EVENING: 'EVENING',
  FLEXIBLE: 'FLEXIBLE',
} as const;

export const SLOTS = {
  MORNING: 'MORNING',
  AFTERNOON: 'AFTERNOON',
  EVENING: 'EVENING',
  FULL_DAY: 'FULL_DAY',
} as const;

export type ConflictResult = {
  hasConflict: boolean;
  reason?: string;
};

export type DayItem = {
  id: string;
  date: Date;
  slot: string;
  participants: number;
};

export type CalendarState = {
  checkIn: Date;
  checkOut: Date;
  items: DayItem[];
  tripId?: string;
  partySize?: number;
};

export type PerkState = {
  isUnlocked: boolean;
  daysFilled: number;
  totalDays: number;
  filledDates: Date[];
};

export function checkParticipantConflict(
  items: DayItem[],
  date: Date,
  slot: string,
  participants: number,
  partySize: number
): ConflictResult {
  const sameSlotItems = items.filter(
    (item) =>
      item.date.getTime() === date.getTime() && item.slot === slot
  );
  const totalParticipants = sameSlotItems.reduce(
    (sum, item) => sum + item.participants,
    0
  );
  const wouldExceed = totalParticipants + participants > partySize;

  return {
    hasConflict: wouldExceed,
    reason: wouldExceed
      ? `Would exceed party size of ${partySize}`
      : undefined,
  };
}

// Two slots conflict if they overlap in time for the SAME guest.
// MORNING/AFTERNOON/FULL_DAY are daytime — all overlap with each other.
// EVENING is separate.
export function slotsOverlap(a: string, b: string): boolean {
  if (a === b) return true;
  const daytime = new Set(['MORNING', 'AFTERNOON', 'FULL_DAY']);
  if (daytime.has(a) && daytime.has(b)) {
    // MORNING + AFTERNOON do NOT overlap (different halves of day)
    // Only FULL_DAY conflicts with the other two
    return a === 'FULL_DAY' || b === 'FULL_DAY';
  }
  return false;
}

export type GuestConflict = {
  hasConflict: boolean;
  conflictingItemId?: string;
  conflictingExperienceSlug?: string;
  conflictingSlot?: string;
  conflictingGuestNames?: string[];
  reason?: string;
};

// Detect if any of the proposed participants are already booked
// in an overlapping slot on the same day.
export function checkGuestOverlap(
  items: Array<{
    id: string;
    date: Date;
    slot: string;
    participantNames?: string[] | null;
    experience?: { slug: string } | null;
  }>,
  date: Date,
  slot: string,
  participantNames: string[]
): GuestConflict {
  if (!participantNames || participantNames.length === 0) {
    return { hasConflict: false };
  }

  const sameDayItems = items.filter(
    (item) => item.date.getTime() === date.getTime() && slotsOverlap(item.slot, slot)
  );

  for (const item of sameDayItems) {
    const existing = item.participantNames || [];
    const overlap = existing.filter((n) => participantNames.includes(n));
    if (overlap.length > 0) {
      return {
        hasConflict: true,
        conflictingItemId: item.id,
        conflictingExperienceSlug: item.experience?.slug,
        conflictingSlot: item.slot,
        conflictingGuestNames: overlap,
        reason: `${overlap.join(', ')} already booked in ${item.slot} slot for "${item.experience?.slug || 'another experience'}"`,
      };
    }
  }

  return { hasConflict: false };
}

export function checkPerkState(calendar: CalendarState): PerkState {
  const checkIn = new Date(calendar.checkIn);
  checkIn.setUTCHours(0, 0, 0, 0);
  const checkOut = new Date(calendar.checkOut);
  checkOut.setUTCHours(0, 0, 0, 0);

  const allDates: Date[] = [];
  let current = new Date(checkIn);
  while (current < checkOut) {
    allDates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const filledDates = Array.from(
    new Set(
      calendar.items.map((item) => {
        const d = new Date(item.date);
        d.setUTCHours(0, 0, 0, 0);
        return d.getTime();
      })
    )
  )
    .map((time) => new Date(time));

  const isUnlocked =
    allDates.length > 0 && allDates.length === filledDates.length;

  return {
    isUnlocked,
    daysFilled: filledDates.length,
    totalDays: allDates.length,
    filledDates: filledDates.sort((a, b) => a.getTime() - b.getTime()),
  };
}

export function getSlotBlockedByDuration(
  durationClass: string,
  slot: string
): string[] {
  if (durationClass === DURATION_CLASS.HALF_DAY) {
    return [slot];
  }
  if (durationClass === DURATION_CLASS.FULL_DAY) {
    return [SLOTS.MORNING, SLOTS.AFTERNOON];
  }
  if (durationClass === DURATION_CLASS.EVENING) {
    return [SLOTS.EVENING];
  }
  return [slot];
}

export function dateDaysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((end.getTime() - start.getTime()) / msPerDay);
}
