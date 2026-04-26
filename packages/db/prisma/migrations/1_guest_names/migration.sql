-- Add guestNames to Trip
ALTER TABLE "Trip" ADD COLUMN IF NOT EXISTS "guestNames" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add participantNames to ItineraryItem
ALTER TABLE "ItineraryItem" ADD COLUMN IF NOT EXISTS "participantNames" TEXT[] DEFAULT ARRAY[]::TEXT[];
