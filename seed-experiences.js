#!/usr/bin/env node

import https from 'https';

const SANITY_PROJECT_ID = 'rkgcsei3';
const SANITY_DATASET = 'production';
const SANITY_API_TOKEN = 'skRnoi2XS6hmkqPe2wVpWLG0i36aGvfLjMEffVoHAtaFFRByxLKhfAYgdSSlY63z0OHcGsntQ5IJrn0q2cacGMBcdaufoRoT1hZLuLRluzTnlNBmmo6pYPjfe0jmgsx37LY6HQSfNaEdDiuDRrSFnuXVERykxYlddAdpV0tofodJPFnYmvwN';

const experiences = [
  {
    title: 'Mugello Racing Test Drive',
    slug: 'mugello-racing',
    durationClass: 'HALF_DAY',
    defaultSlot: 'MORNING',
    minParticipants: 1,
    maxParticipants: 4,
    category: 'driving',
    shortDescription: 'High-performance racing experience at Mugello Circuit',
    longDescription: 'Test drive a Ferrari or Lamborghini on the legendary Mugello Circuit with professional instruction.',
    imageUrl: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800',
  },
  {
    title: 'Personal Shopper - Via Tornabuoni',
    slug: 'personal-shopper',
    durationClass: 'FLEXIBLE',
    defaultSlot: 'AFTERNOON',
    minParticipants: 1,
    maxParticipants: 4,
    category: 'shopping',
    shortDescription: 'Exclusive shopping tour with luxury stylist',
    longDescription: 'Navigate Florence\'s finest boutiques on Via Tornabuoni with a personal stylist and VIP access.',
    imageUrl: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800',
  },
  {
    title: 'Boat Tour - Forte dei Marmi & Elba',
    slug: 'boat-tour',
    durationClass: 'FULL_DAY',
    defaultSlot: 'FULL_DAY',
    minParticipants: 2,
    maxParticipants: 8,
    category: 'water',
    shortDescription: 'Coastal boat adventure with swimming and lunch',
    longDescription: 'Explore the Tuscany coast by private boat, visit secluded beaches, swim in crystal waters, and enjoy seaside dining.',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
  },
  {
    title: 'Yacht Custom Itinerary',
    slug: 'yacht-itinerary',
    durationClass: 'MULTI_DAY',
    defaultSlot: 'FULL_DAY',
    minParticipants: 2,
    maxParticipants: 12,
    category: 'water',
    shortDescription: 'Multi-day luxury yacht charter',
    longDescription: 'Customize your own multi-day sailing adventure with chef, crew, and visits to coastal villages.',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
  },
  {
    title: 'Private Chef Dinner',
    slug: 'private-chef-dinner',
    durationClass: 'EVENING',
    defaultSlot: 'EVENING',
    minParticipants: 2,
    maxParticipants: 20,
    category: 'food',
    shortDescription: 'Gourmet 5-course dinner with rooftop Florence views',
    longDescription: 'Michelin-trained chef prepares a bespoke tasting menu in your villa with wine pairing and panoramic city views.',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  },
  {
    title: 'Cooking Class',
    slug: 'cooking-class',
    durationClass: 'FLEXIBLE',
    defaultSlot: 'MORNING',
    minParticipants: 2,
    maxParticipants: 6,
    category: 'food',
    shortDescription: 'Learn Tuscan cuisine in an authentic restaurant kitchen',
    longDescription: 'Prepare traditional pasta and regional dishes under guidance of a professional chef, then enjoy your meal.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  },
  {
    title: 'Helicopter Flight over Tuscany',
    slug: 'helicopter-flight',
    durationClass: 'HALF_DAY',
    defaultSlot: 'AFTERNOON',
    minParticipants: 1,
    maxParticipants: 6,
    category: 'aerial',
    shortDescription: 'Scenic helicopter tour of Tuscan landscape',
    longDescription: 'Fly over vineyards, villas, and rolling hills with professional pilot narration and photo opportunities.',
    imageUrl: 'https://images.unsplash.com/photo-1540962614-1e1b5a3f6c8f?w=800',
  },
  {
    title: 'Quad/Motocross through Chianti',
    slug: 'quad-motocross',
    durationClass: 'HALF_DAY',
    defaultSlot: 'AFTERNOON',
    minParticipants: 1,
    maxParticipants: 8,
    category: 'driving',
    shortDescription: 'Off-road adventure through Chianti vineyards',
    longDescription: 'Ride ATVs and dirt bikes through scenic Chianti trails with professional instruction and safety gear.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  },
  {
    title: 'Horse Riding + Wine Tasting',
    slug: 'horse-riding-wine',
    durationClass: 'HALF_DAY',
    defaultSlot: 'MORNING',
    minParticipants: 1,
    maxParticipants: 6,
    category: 'outdoor',
    shortDescription: 'Horseback tour through vineyards with tasting',
    longDescription: 'Ride through Chianti countryside, visit a working winery, and taste premium wines with local expert.',
    imageUrl: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800',
  },
  {
    title: 'Cantina Antinori - Winery Experience',
    slug: 'cantina-antinori',
    durationClass: 'HALF_DAY',
    defaultSlot: 'AFTERNOON',
    minParticipants: 2,
    maxParticipants: 12,
    category: 'wine',
    shortDescription: 'Historic winery tour and wine tasting',
    longDescription: 'Explore the iconic Antinori winery, learn about Tuscan winemaking, taste flagship wines, and enjoy local cuisine.',
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2e3bb6?w=800',
  },
];

function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${SANITY_PROJECT_ID}.api.sanity.io`,
      port: 443,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SANITY_API_TOKEN}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data ? JSON.parse(data) : null,
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function seedExperiences() {
  console.log('🌱 Seeding experiences to Sanity...\n');

  for (const exp of experiences) {
    const doc = {
      _type: 'experience',
      title: exp.title,
      slug: { _type: 'slug', current: exp.slug },
      shortDescription: exp.shortDescription,
      longDescription: exp.longDescription,
      durationClass: exp.durationClass,
      defaultSlot: exp.defaultSlot,
      minParticipants: exp.minParticipants,
      maxParticipants: exp.maxParticipants,
      category: exp.category,
      isActive: true,
    };

    const path = `/v1/data/mutate/${SANITY_DATASET}`;
    const mutation = {
      mutations: [{ createIfNotExists: { ...doc, _id: `experience.${exp.slug}` } }],
    };

    try {
      const result = await makeRequest('POST', path, mutation);
      if (result.status === 200) {
        console.log(`✅ ${exp.title}`);
      } else {
        console.log(`❌ ${exp.title}: ${result.body?.message || result.status}`);
      }
    } catch (err) {
      console.error(`❌ ${exp.title}: ${err.message}`);
    }
  }

  console.log('\n✨ Seeding complete! Note: Images are placeholders. Upload real photos in Sanity Studio.');
}

seedExperiences().catch(console.error);
