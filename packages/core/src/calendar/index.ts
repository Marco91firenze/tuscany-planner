import { DURATION_CLASS, SLOTS, DayItem, CalendarState, ConflictResult, PerkState } from './types';

export * from './types';

export function checkParticipantConflict(
  items: DayItem[],
  date: Date,
  slot: string,
  participants: number,
  partySize: number
): ConflictResult {
  const sameSlotItems = items.filter(
    (item) => item.date.getTime() === date.getTime() && item.slot === slot
  );

  const totalParticipants = sameSlotItems.reduce((sum, item) => sum + item.participants, 0);
  const wouldExceed = totalParticipants + participants > partySize;

  return {
    hasConflict: wouldExceed,
    reason: wouldExceed ? `Would exceed party size of ${partySize}` : undefined,
  };
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
  ).map((time) => new Date(time));

  const isUnlocked = allDates.length > 0 && allDates.length === filledDates.length;

  return {
    isUnlocked,
    daysFilled: filledDates.length,
    totalDays: allDates.length,
    filledDates: filledDates.sort((a, b) => a.getTime() - b.getTime()),
  };
}

export function getSlotBlockedByDuration(durationClass: string, slot: string): string[] {
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
