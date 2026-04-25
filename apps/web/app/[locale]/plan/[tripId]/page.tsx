'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Experience metadata (titles, descriptions, images) keyed by slug
const EXPERIENCE_META: Record<string, { title: string; description: string; image: string; emoji: string }> = {
  'mugello-racing': {
    title: 'Mugello Racing Test Drive',
    description: 'Drive a Ferrari or Lamborghini on the legendary Mugello Circuit',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop',
    emoji: '🏎️',
  },
  'personal-shopper': {
    title: 'Personal Shopper - Via Tornabuoni',
    description: 'Exclusive luxury shopping tour with private stylist',
    image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&auto=format&fit=crop',
    emoji: '🛍️',
  },
  'boat-tour': {
    title: 'Boat Tour - Forte dei Marmi & Elba',
    description: 'Coastal adventure with swimming and seaside lunch',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop',
    emoji: '⛵',
  },
  'yacht-itinerary': {
    title: 'Yacht Custom Itinerary',
    description: 'Multi-day luxury yacht charter with crew and chef',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop',
    emoji: '🛥️',
  },
  'private-chef-dinner': {
    title: 'Private Chef Dinner',
    description: 'Gourmet 5-course dinner with rooftop Florence views',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop',
    emoji: '🍽️',
  },
  'cooking-class': {
    title: 'Tuscan Cooking Class',
    description: 'Learn authentic Tuscan cuisine in a famous restaurant',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop',
    emoji: '👨‍🍳',
  },
  'helicopter-flight': {
    title: 'Helicopter Flight over Tuscany',
    description: 'Scenic flight over vineyards and rolling hills',
    image: 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=800&auto=format&fit=crop',
    emoji: '🚁',
  },
  'quad-motocross': {
    title: 'Quad/Motocross through Chianti',
    description: 'Off-road adventure through scenic Chianti trails',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    emoji: '🏍️',
  },
  'horse-riding-wine': {
    title: 'Horse Riding + Wine Tasting',
    description: 'Horseback tour through vineyards with premium tasting',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&auto=format&fit=crop',
    emoji: '🐴',
  },
  'cantina-antinori': {
    title: 'Cantina Antinori Winery',
    description: 'Historic winery tour with premium wine tasting',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2e3bb6?w=800&auto=format&fit=crop',
    emoji: '🍷',
  },
};

const SLOTS = [
  { value: 'MORNING', label: 'Morning (9:00 - 13:00)' },
  { value: 'AFTERNOON', label: 'Afternoon (14:00 - 18:00)' },
  { value: 'EVENING', label: 'Evening (19:00 - 23:00)' },
];

interface Experience {
  id: string;
  slug: string;
  durationClass: string;
  defaultSlot: string | null;
  minParticipants: number;
  maxParticipants: number;
  category: string;
}

interface ItineraryItem {
  id: string;
  experienceId: string;
  date: string;
  slot: string;
  participants: number;
  experience?: Experience;
}

export default function PlannerPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.tripId as string;
  const locale = (params?.locale as string) || 'en';

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalExp, setModalExp] = useState<Experience | null>(null);
  const [modalDate, setModalDate] = useState<string>('');
  const [modalSlot, setModalSlot] = useState<string>('');
  const [modalParticipants, setModalParticipants] = useState<number>(1);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string>('');

  const refreshTrip = async () => {
    try {
      const res = await fetch('/api/trpc/trip.get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripId),
      });
      const data = await res.json();
      setTrip(data.result?.data);
    } catch (error) {
      console.error('Error fetching trip:', error);
    }
  };

  useEffect(() => {
    if (!tripId) return;

    const fetchAll = async () => {
      try {
        const [tripRes, expRes] = await Promise.all([
          fetch('/api/trpc/trip.get', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tripId),
          }),
          fetch('/api/trpc/experience.list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          }),
        ]);

        const tripData = await tripRes.json();
        const expData = await expRes.json();

        setTrip(tripData.result?.data);
        setExperiences(expData.result?.data || []);
      } catch (error) {
        console.error('Error loading planner:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [tripId]);

  const openAddModal = (exp: Experience, prefillDate?: Date) => {
    setModalExp(exp);
    setModalDate(prefillDate ? prefillDate.toISOString().split('T')[0] : '');
    setModalSlot(exp.defaultSlot || 'MORNING');
    setModalParticipants(Math.min(exp.minParticipants, trip?.partySize || 1));
    setModalError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalExp(null);
  };

  const submitAddItem = async () => {
    if (!modalExp || !modalDate || !modalSlot) {
      setModalError('Please fill all fields');
      return;
    }

    setModalSubmitting(true);
    setModalError('');

    try {
      const res = await fetch('/api/trpc/calendar.addItem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          experienceId: modalExp.id,
          date: new Date(modalDate).toISOString(),
          slot: modalSlot,
          participants: modalParticipants,
        }),
      });
      const data = await res.json();

      if (data.error) {
        setModalError(data.error.message || 'Failed to add experience');
      } else {
        closeModal();
        await refreshTrip();
      }
    } catch (error: any) {
      setModalError(error.message || 'Network error');
    } finally {
      setModalSubmitting(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await fetch('/api/trpc/calendar.removeItem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemId),
      });
      await refreshTrip();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-600">Loading your itinerary...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-red-600">Trip not found</p>
          <button onClick={() => router.push(`/${locale}`)} className="mt-4 px-4 py-2 bg-amber-700 text-white rounded">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const checkIn = new Date(trip.checkIn);
  const checkOut = new Date(trip.checkOut);
  const days: Date[] = [];
  let current = new Date(checkIn);
  while (current < checkOut) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const itemsByDate = new Map<string, ItineraryItem[]>();
  trip.items?.forEach((item: ItineraryItem) => {
    const key = new Date(item.date).toDateString();
    if (!itemsByDate.has(key)) itemsByDate.set(key, []);
    itemsByDate.get(key)!.push(item);
  });

  const filledDays = itemsByDate.size;
  const progress = Math.round((filledDays / days.length) * 100);
  const isComplete = filledDays === days.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-900">Your Tuscan Itinerary</h1>
            <p className="text-sm text-neutral-600">
              {checkIn.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} -{' '}
              {checkOut.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {trip.partySize} guests
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
            <div className="text-sm font-medium text-neutral-700">
              {filledDays} of {days.length} days planned ({progress}%)
            </div>
            <div className="w-full sm:w-64 h-3 bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-orange-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar - Left */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-serif font-bold text-neutral-800">Your Calendar</h2>
          {days.map((day, idx) => {
            const dayKey = day.toDateString();
            const dayItems = itemsByDate.get(dayKey) || [];
            return (
              <div key={dayKey} className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-700 to-orange-700 text-white px-5 py-3">
                  <h3 className="font-serif font-bold">
                    Day {idx + 1} - {day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                </div>
                <div className="p-5">
                  {dayItems.length > 0 ? (
                    <div className="space-y-3">
                      {dayItems.map((item) => {
                        const meta = EXPERIENCE_META[item.experience?.slug || ''] || { title: item.experience?.slug, description: '', image: '', emoji: '🎯' };
                        return (
                          <div key={item.id} className="flex items-center gap-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                            <div className="text-3xl flex-shrink-0">{meta.emoji}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-amber-900 truncate">{meta.title}</p>
                              <p className="text-xs text-neutral-600">
                                {item.slot} • {item.participants} {item.participants === 1 ? 'guest' : 'guests'}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-50 rounded"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                      <button
                        onClick={() => {
                          // Pick first experience as default for "add another"
                          if (experiences.length > 0) {
                            openAddModal(experiences[0], day);
                          }
                        }}
                        className="w-full py-2 text-sm text-amber-700 hover:bg-amber-50 rounded font-medium border border-dashed border-amber-300"
                      >
                        + Add another experience
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-neutral-500">
                      <p className="mb-2">No experiences yet</p>
                      <p className="text-xs">Click an experience on the right to add it to this day</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Experiences - Right */}
        <div className="lg:col-span-5">
          <div className="sticky top-28">
            <h2 className="text-xl font-serif font-bold text-neutral-800 mb-4">
              Available Experiences ({experiences.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {experiences.map((exp) => {
                const meta = EXPERIENCE_META[exp.slug] || { title: exp.slug, description: '', image: '', emoji: '🎯' };
                return (
                  <button
                    key={exp.id}
                    onClick={() => openAddModal(exp)}
                    className="group bg-white rounded-xl border border-amber-100 overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-amber-100">
                      {meta.image ? (
                        <img
                          src={meta.image}
                          alt={meta.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">{meta.emoji}</div>
                      )}
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium text-amber-900">
                        {exp.durationClass.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-neutral-900 mb-1 line-clamp-1">{meta.title}</h3>
                      <p className="text-xs text-neutral-600 line-clamp-2">{meta.description}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-amber-700">
                        <span>{exp.minParticipants}-{exp.maxParticipants} guests</span>
                        <span className="capitalize">{exp.category}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Complete banner */}
      {isComplete && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-emerald-600 to-green-700 text-white p-4 shadow-2xl z-40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-serif font-bold text-lg">🎉 Congratulations! Your itinerary is complete</h4>
              <p className="text-sm opacity-90">Your package now includes a complimentary private driver for your entire stay.</p>
            </div>
            <button
              onClick={() => router.push(`/${locale}/submit/${tripId}`)}
              className="px-6 py-3 bg-white text-green-700 rounded-lg font-bold hover:bg-green-50 transition whitespace-nowrap"
            >
              Submit Itinerary →
            </button>
          </div>
        </div>
      )}

      {/* Add Experience Modal */}
      {modalOpen && modalExp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="aspect-video relative">
              <img
                src={EXPERIENCE_META[modalExp.slug]?.image || ''}
                alt={EXPERIENCE_META[modalExp.slug]?.title || modalExp.slug}
                className="w-full h-full object-cover rounded-t-2xl"
              />
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-serif font-bold text-amber-900 mb-1">
                {EXPERIENCE_META[modalExp.slug]?.title || modalExp.slug}
              </h3>
              <p className="text-sm text-neutral-600 mb-6">
                {EXPERIENCE_META[modalExp.slug]?.description}
              </p>

              <div className="space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Date</label>
                  <select
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select a day</option>
                    {days.map((d, idx) => (
                      <option key={d.toISOString()} value={d.toISOString().split('T')[0]}>
                        Day {idx + 1} - {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Slot */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Time Slot</label>
                  <div className="grid grid-cols-1 gap-2">
                    {SLOTS.map((slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => setModalSlot(slot.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                          modalSlot === slot.value
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-amber-50'
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Participants ({modalExp.minParticipants}-{Math.min(modalExp.maxParticipants, trip.partySize)})
                  </label>
                  <input
                    type="number"
                    min={modalExp.minParticipants}
                    max={Math.min(modalExp.maxParticipants, trip.partySize)}
                    value={modalParticipants}
                    onChange={(e) => setModalParticipants(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {modalError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg font-medium hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitAddItem}
                    disabled={modalSubmitting || !modalDate || !modalSlot}
                    className="flex-1 px-4 py-2 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 disabled:bg-neutral-300 disabled:cursor-not-allowed"
                  >
                    {modalSubmitting ? 'Adding...' : 'Add to Itinerary'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
