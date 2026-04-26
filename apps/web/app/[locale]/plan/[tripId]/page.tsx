'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Experience metadata (titles, descriptions, images) keyed by slug
const EXPERIENCE_META: Record<string, { title: string; description: string; image: string; emoji: string }> = {
  'mugello-racing': {
    title: 'Mugello Racing Test Drive',
    description: 'Drive a Ferrari or Lamborghini on the legendary Mugello Circuit',
    image: '/experiences/mugello-racing.jpg',
    emoji: '🏎️',
  },
  'personal-shopper': {
    title: 'Personal Shopper - Via Tornabuoni',
    description: 'Exclusive luxury shopping tour with private stylist',
    image: '/experiences/personal-shopper.jpg',
    emoji: '🛍️',
  },
  'boat-tour': {
    title: 'Boat Tour - Forte dei Marmi & Elba',
    description: 'Coastal adventure with swimming and seaside lunch',
    image: '/experiences/boat-tour.jpg',
    emoji: '⛵',
  },
  'yacht-itinerary': {
    title: 'Yacht Custom Itinerary',
    description: 'Multi-day luxury yacht charter with crew and chef',
    image: '/experiences/yacht-itinerary.jpg',
    emoji: '🛥️',
  },
  'private-chef-dinner': {
    title: 'Private Chef Dinner',
    description: 'Gourmet 5-course dinner with rooftop Florence views',
    image: '/experiences/private-chef-dinner.jpg',
    emoji: '🍽️',
  },
  'cooking-class': {
    title: 'Tuscan Cooking Class',
    description: 'Learn authentic Tuscan cuisine in a famous restaurant',
    image: '/experiences/cooking-class.jpg',
    emoji: '👨‍🍳',
  },
  'helicopter-flight': {
    title: 'Helicopter Flight over Tuscany',
    description: 'Scenic flight over vineyards and rolling hills',
    image: '/experiences/helicopter-flight.jpg',
    emoji: '🚁',
  },
  'quad-motocross': {
    title: 'Quad/Motocross through Chianti',
    description: 'Off-road adventure through scenic Chianti trails',
    image: '/experiences/quad-motocross.jpg',
    emoji: '🏍️',
  },
  'horse-riding-wine': {
    title: 'Horse Riding + Wine Tasting',
    description: 'Horseback tour through vineyards with premium tasting',
    image: '/experiences/horse-riding-wine.jpg',
    emoji: '🐴',
  },
  'cantina-antinori': {
    title: 'Cantina Antinori Winery',
    description: 'Historical winery tour with premium wine tasting',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop',
    emoji: '🍷',
  },
};

// Map raw category to display label (overrides "water" → "Sea")
const CATEGORY_LABEL: Record<string, string> = {
  water: 'Sea',
  food: 'Food',
  wine: 'Wine',
  driving: 'Driving',
  outdoor: 'Outdoor',
  shopping: 'Shopping',
  aerial: 'Aerial',
  cultural: 'Cultural',
};

const ALL_SLOTS = [
  { value: 'MORNING', label: 'Morning (9:00 - 13:00)' },
  { value: 'AFTERNOON', label: 'Afternoon (14:00 - 18:00)' },
  { value: 'EVENING', label: 'Evening (19:00 - 23:00)' },
  { value: 'FULL_DAY', label: 'Full Day (9:00 - 18:00)' },
];

function getValidSlots(durationClass: string) {
  switch (durationClass) {
    case 'HALF_DAY':
      return ALL_SLOTS.filter((s) => s.value === 'MORNING' || s.value === 'AFTERNOON');
    case 'FULL_DAY':
    case 'MULTI_DAY':
      return ALL_SLOTS.filter((s) => s.value === 'FULL_DAY');
    case 'EVENING':
      return ALL_SLOTS.filter((s) => s.value === 'EVENING');
    case 'FLEXIBLE':
    default:
      return ALL_SLOTS.filter((s) => s.value !== 'FULL_DAY');
  }
}

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
  participantNames?: string[];
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

  // Guest names editing
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [savingGuests, setSavingGuests] = useState(false);
  const [guestsExpanded, setGuestsExpanded] = useState(false);

  // Picker modal (for empty day → choose experience)
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date | null>(null);

  // Add modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalExp, setModalExp] = useState<Experience | null>(null);
  const [modalDate, setModalDate] = useState<string>('');
  const [modalSlot, setModalSlot] = useState<string>('');
  const [modalParticipantNames, setModalParticipantNames] = useState<string[]>([]);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string>('');

  const refreshTrip = useCallback(async () => {
    try {
      const res = await fetch('/api/trpc/trip.get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripId),
      });
      const data = await res.json();
      const t = data.result?.data;
      setTrip(t);
      if (t?.guestNames && Array.isArray(t.guestNames) && t.guestNames.length > 0) {
        setGuestNames(t.guestNames);
      } else if (t?.partySize) {
        // Initialize empty guest names array based on party size
        setGuestNames(Array(t.partySize).fill(''));
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
    }
  }, [tripId]);

  // Close modals on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modalOpen) closeModal();
        if (pickerOpen) setPickerOpen(false);
      }
    };
    if (modalOpen || pickerOpen) {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
    return;
  }, [modalOpen, pickerOpen]);

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

        const t = tripData.result?.data;
        setTrip(t);
        setExperiences(expData.result?.data || []);

        if (t?.guestNames && Array.isArray(t.guestNames) && t.guestNames.length > 0) {
          setGuestNames(t.guestNames);
        } else if (t?.partySize) {
          setGuestNames(Array(t.partySize).fill(''));
          setGuestsExpanded(true); // Auto-expand if no names yet
        }
      } catch (error) {
        console.error('Error loading planner:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [tripId]);

  const guestLabel = (idx: number) => guestNames[idx]?.trim() || `Guest ${idx + 1}`;

  const saveGuestNames = async () => {
    setSavingGuests(true);
    try {
      const res = await fetch('/api/trpc/trip.update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tripId,
          data: { guestNames },
        }),
      });
      const data = await res.json();
      if (!data.error) {
        setGuestsExpanded(false);
        await refreshTrip();
      } else {
        alert('Failed to save guest names: ' + data.error.message);
      }
    } catch (e: any) {
      alert('Network error: ' + e.message);
    } finally {
      setSavingGuests(false);
    }
  };

  const openAddModal = (exp: Experience, prefillDate?: Date) => {
    setModalExp(exp);
    setModalDate(prefillDate ? prefillDate.toISOString().split('T')[0] : '');
    const validSlots = getValidSlots(exp.durationClass);
    const defaultSlot = exp.defaultSlot || validSlots[0]?.value || 'MORNING';
    const finalSlot = validSlots.find((s) => s.value === defaultSlot)?.value || validSlots[0]?.value || 'MORNING';
    setModalSlot(finalSlot);
    // Pre-select all guests up to maxParticipants (or just first minParticipants)
    const initial = guestNames
      .map((_, i) => guestLabel(i))
      .slice(0, Math.min(exp.minParticipants, guestNames.length));
    setModalParticipantNames(initial);
    setModalError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalExp(null);
    setModalError('');
  };

  const toggleGuestInModal = (name: string) => {
    setModalParticipantNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const submitAddItem = async () => {
    if (!modalExp || !modalDate || !modalSlot) {
      setModalError('Please fill all fields');
      return;
    }
    if (modalParticipantNames.length < modalExp.minParticipants) {
      setModalError(`This experience requires at least ${modalExp.minParticipants} guest${modalExp.minParticipants > 1 ? 's' : ''}`);
      return;
    }
    if (modalParticipantNames.length > modalExp.maxParticipants) {
      setModalError(`Maximum ${modalExp.maxParticipants} guests for this experience`);
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
          participants: modalParticipantNames.length,
          participantNames: modalParticipantNames,
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

  const openPicker = (date: Date) => {
    setPickerDate(date);
    setPickerOpen(true);
  };

  const pickExperience = (exp: Experience) => {
    setPickerOpen(false);
    if (pickerDate) {
      openAddModal(exp, pickerDate);
      setPickerDate(null);
    } else {
      openAddModal(exp);
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

      {/* Guest Names Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
          <button
            onClick={() => setGuestsExpanded(!guestsExpanded)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-amber-50 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <div className="text-left">
                <h3 className="font-serif font-bold text-amber-900">Guests ({trip.partySize})</h3>
                <p className="text-xs text-neutral-600">
                  {guestNames.every((n) => n.trim())
                    ? guestNames.map((n, i) => n.trim() || `Guest ${i + 1}`).join(', ')
                    : 'Click to name your guests for personalized experience selection'}
                </p>
              </div>
            </div>
            <span className="text-amber-700 text-xl">{guestsExpanded ? '▴' : '▾'}</span>
          </button>
          {guestsExpanded && (
            <div className="px-5 pb-5 border-t border-amber-100 pt-4">
              <p className="text-sm text-neutral-600 mb-3">
                Name each guest. You'll be able to select who participates in each experience.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: trip.partySize }).map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Guest ${i + 1} name`}
                    value={guestNames[i] || ''}
                    onChange={(e) => {
                      const next = [...guestNames];
                      while (next.length < trip.partySize) next.push('');
                      next[i] = e.target.value;
                      setGuestNames(next);
                    }}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ))}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setGuestsExpanded(false)}
                  className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={saveGuestNames}
                  disabled={savingGuests}
                  className="px-4 py-2 text-sm bg-amber-700 text-white rounded font-medium hover:bg-amber-800 disabled:opacity-50"
                >
                  {savingGuests ? 'Saving...' : 'Save Guest Names'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
                        const names = item.participantNames && item.participantNames.length > 0
                          ? item.participantNames.join(', ')
                          : `${item.participants} ${item.participants === 1 ? 'guest' : 'guests'}`;
                        return (
                          <div key={item.id} className="flex items-center gap-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                            <div className="text-3xl flex-shrink-0">{meta.emoji}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-amber-900 truncate">{meta.title}</p>
                              <p className="text-xs text-neutral-600 truncate">
                                {item.slot} • {names}
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
                        onClick={() => openPicker(day)}
                        className="w-full py-2 text-sm text-amber-700 hover:bg-amber-50 rounded font-medium border border-dashed border-amber-300"
                      >
                        + Add another experience
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openPicker(day)}
                      className="w-full py-8 text-amber-700 hover:bg-amber-50 rounded-lg font-medium border-2 border-dashed border-amber-300 hover:border-amber-500 transition"
                    >
                      + Add experience for this day
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Experiences - Right */}
        <div className="lg:col-span-5" id="experiences-sidebar">
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
                    <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200">
                      {meta.image ? (
                        <img
                          src={meta.image}
                          alt={meta.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div className={`absolute inset-0 flex items-center justify-center text-6xl pointer-events-none ${meta.image ? 'opacity-0' : 'opacity-100'}`}>
                        {meta.emoji}
                      </div>
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium text-amber-900">
                        {exp.durationClass.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-neutral-900 mb-1 line-clamp-1">{meta.title}</h3>
                      <p className="text-xs text-neutral-600 line-clamp-2">{meta.description}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-amber-700">
                        <span>{exp.minParticipants}-{exp.maxParticipants} guests</span>
                        <span>{CATEGORY_LABEL[exp.category] || exp.category}</span>
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

      {/* Experience Picker Modal (when clicking + Add experience for day) */}
      {pickerOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-amber-100">
              <div>
                <h3 className="text-xl font-serif font-bold text-amber-900">Choose an Experience</h3>
                {pickerDate && (
                  <p className="text-sm text-neutral-600">
                    For {pickerDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setPickerOpen(false);
                  setPickerDate(null);
                }}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {experiences.map((exp) => {
                  const meta = EXPERIENCE_META[exp.slug] || { title: exp.slug, description: '', image: '', emoji: '🎯' };
                  return (
                    <button
                      key={exp.id}
                      onClick={() => pickExperience(exp)}
                      className="group bg-white rounded-xl border border-amber-100 overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left"
                    >
                      <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200">
                        {meta.image ? (
                          <img
                            src={meta.image}
                            alt={meta.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-6xl">{meta.emoji}</div>
                        )}
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium text-amber-900">
                          {exp.durationClass.replace('_', ' ')}
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm text-neutral-900 mb-1 line-clamp-1">{meta.title}</h4>
                        <p className="text-xs text-neutral-600 line-clamp-2">{meta.description}</p>
                        <div className="mt-2 flex items-center justify-between text-xs text-amber-700">
                          <span>{exp.minParticipants}-{exp.maxParticipants} guests</span>
                          <span>{CATEGORY_LABEL[exp.category] || exp.category}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Experience Modal */}
      {modalOpen && modalExp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="aspect-video relative bg-gradient-to-br from-amber-200 to-orange-300">
              {EXPERIENCE_META[modalExp.slug]?.image ? (
                <img
                  src={EXPERIENCE_META[modalExp.slug]!.image}
                  alt={EXPERIENCE_META[modalExp.slug]?.title || modalExp.slug}
                  className="w-full h-full object-cover rounded-t-2xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">
                  {EXPERIENCE_META[modalExp.slug]?.emoji || '🎯'}
                </div>
              )}
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow-md"
                aria-label="Close"
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
                    {getValidSlots(modalExp.durationClass).map((slot) => (
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

                {/* Guest Selection */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Who participates? ({modalParticipantNames.length} selected
                    {modalExp.minParticipants > 1 && `, min ${modalExp.minParticipants}`}
                    {`, max ${modalExp.maxParticipants}`})
                  </label>
                  <div className="space-y-2">
                    {Array.from({ length: trip.partySize }).map((_, i) => {
                      const name = guestLabel(i);
                      const checked = modalParticipantNames.includes(name);
                      return (
                        <label
                          key={i}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition ${
                            checked ? 'bg-amber-50 border-amber-400' : 'bg-white border-neutral-200 hover:bg-neutral-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleGuestInModal(name)}
                            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                          />
                          <span className="text-sm font-medium text-neutral-800">{name}</span>
                          {!guestNames[i]?.trim() && (
                            <span className="text-xs text-neutral-400 ml-auto">(rename in Guests section)</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
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
                    disabled={modalSubmitting || !modalDate || !modalSlot || modalParticipantNames.length === 0}
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
