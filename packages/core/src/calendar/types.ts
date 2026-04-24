export const DURATION_CLASS = {
  HALF_DAY: 'HALF_DAY',
  FULL_DAY: 'FULL_DAY',
  EVENING: 'EVENING',
  FLEXIBLE: 'FLEXIBLE',
  MULTI_DAY: 'MULTI_DAY',
} as const;

export const SLOTS = {
  MORNING: 'MORNING',
  AFTERNOON: 'AFTERNOON',
  EVENING: 'EVENING',
  FULL_DAY: 'FULL_DAY',
} as const;

export interface DayItem {
  id: string;
  experienceId: string;
  date: Date;
  slot: string;
  participants: number;
}

export interface CalendarState {
  tripId: string;
  checkIn: Date;
  checkOut: Date;
  partySize: number;
  items: DayItem[];
}

export interface ConflictResult {
  hasConflict: boolean;
  reason?: string;
  affectedDates?: Date[];
}

export interface PerkState {
  isUnlocked: boolean;
  daysFilled: number;
  totalDays: number;
  filledDates: Date[];
}
