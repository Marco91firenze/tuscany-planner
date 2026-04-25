#!/usr/bin/env node

/**
 * Seed PostgreSQL Experience table with 11 Florence Premium Tours experiences
 */

import pg from 'pg';

const { Client } = pg;

const experiences = [
  {
    id: 'experience.mugello-racing',
    slug: 'mugello-racing',
    durationClass: 'HALF_DAY',
    defaultSlot: 'MORNING',
    minParticipants: 1,
    maxParticipants: 4,
    category: 'driving',
  },
  {
    id: 'experience.personal-shopper',
    slug: 'personal-shopper',
    durationClass: 'FLEXIBLE',
    defaultSlot: 'AFTERNOON',
    minParticipants: 1,
    maxParticipants: 4,
    category: 'shopping',
  },
  {
    id: 'experience.boat-tour',
    slug: 'boat-tour',
    durationClass: 'FULL_DAY',
    defaultSlot: 'FULL_DAY',
    minParticipants: 2,
    maxParticipants: 8,
    category: 'water',
  },
  {
    id: 'experience.yacht-itinerary',
    slug: 'yacht-itinerary',
    durationClass: 'MULTI_DAY',
    defaultSlot: 'FULL_DAY',
    minParticipants: 2,
    maxParticipants: 12,
    category: 'water',
  },
  {
    id: 'experience.private-chef-dinner',
    slug: 'private-chef-dinner',
    durationClass: 'EVENING',
    defaultSlot: 'EVENING',
    minParticipants: 2,
    maxParticipants: 20,
    category: 'food',
  },
  {
    id: 'experience.cooking-class',
    slug: 'cooking-class',
    durationClass: 'FLEXIBLE',
    defaultSlot: 'MORNING',
    minParticipants: 2,
    maxParticipants: 6,
    category: 'food',
  },
  {
    id: 'experience.helicopter-flight',
    slug: 'helicopter-flight',
    durationClass: 'HALF_DAY',
    defaultSlot: 'AFTERNOON',
    minParticipants: 1,
    maxParticipants: 6,
    category: 'aerial',
  },
  {
    id: 'experience.quad-motocross',
    slug: 'quad-motocross',
    durationClass: 'HALF_DAY',
    defaultSlot: 'AFTERNOON',
    minParticipants: 1,
    maxParticipants: 8,
    category: 'driving',
  },
  {
    id: 'experience.horse-riding-wine',
    slug: 'horse-riding-wine',
    durationClass: 'HALF_DAY',
    defaultSlot: 'MORNING',
    minParticipants: 1,
    maxParticipants: 6,
    category: 'outdoor',
  },
  {
    id: 'experience.cantina-antinori',
    slug: 'cantina-antinori',
    durationClass: 'HALF_DAY',
    defaultSlot: 'AFTERNOON',
    minParticipants: 2,
    maxParticipants: 12,
    category: 'wine',
  },
];

async function seed() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    for (const exp of experiences) {
      try {
        await client.query(
          `INSERT INTO "Experience"
           (id, slug, "isActive", "durationClass", "defaultSlot", "minParticipants", "maxParticipants", category, "blockedDates", "availabilityRules", "createdAt")
           VALUES ($1, $2, true, $3::"DurationClass", $4::"Slot", $5, $6, $7, ARRAY[]::TIMESTAMP(3)[], '{}', NOW())
           ON CONFLICT (id) DO UPDATE SET
             slug = EXCLUDED.slug,
             "durationClass" = EXCLUDED."durationClass",
             "defaultSlot" = EXCLUDED."defaultSlot",
             "minParticipants" = EXCLUDED."minParticipants",
             "maxParticipants" = EXCLUDED."maxParticipants",
             category = EXCLUDED.category`,
          [
            exp.id,
            exp.slug,
            exp.durationClass,
            exp.defaultSlot,
            exp.minParticipants,
            exp.maxParticipants,
            exp.category,
          ]
        );
        console.log(`  ✓ ${exp.slug}`);
      } catch (err) {
        console.error(`  ❌ ${exp.slug}: ${err.message}`);
      }
    }

    const result = await client.query('SELECT COUNT(*) FROM "Experience"');
    console.log(`\n✅ Total experiences in DB: ${result.rows[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
