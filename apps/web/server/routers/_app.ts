import { router } from '../trpc';
import { tripRouter } from './trip';
import { experienceRouter } from './experience';
import { calendarRouter } from './calendar';
import { inquiryRouter } from './inquiry';
import { adminRouter } from './admin';

export const appRouter = router({
  trip: tripRouter,
  experience: experienceRouter,
  calendar: calendarRouter,
  inquiry: inquiryRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
