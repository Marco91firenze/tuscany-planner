'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PlannerPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.tripId as string;

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [selectedExp, setSelectedExp] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (!tripId) return;

    const fetchTrip = async () => {
      try {
        const res = await fetch(`/api/trpc/trip.get?input="${tripId}"`);
        const data = await res.json();
        setTrip(data.result?.data);
      } catch (error) {
        console.error('Error fetching trip:', error);
      }
    };

    const fetchExperiences = async () => {
      try {
        const res = await fetch('/api/trpc/experience.list');
        const data = await res.json();
        setExperiences(data.result?.data || []);
      } catch (error) {
        console.error('Error fetching experiences:', error);
      }
    };

    fetchTrip();
    fetchExperiences();
    setLoading(false);
  }, [tripId]);

  if (loading || !trip) {
    return <div className="container py-20">Loading...</div>;
  }

  const checkIn = new Date(trip.checkIn);
  const checkOut = new Date(trip.checkOut);
  const days = [];
  let current = new Date(checkIn);
  while (current < checkOut) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const itemsByDate = new Map();
  trip.items?.forEach((item: any) => {
    const key = new Date(item.date).toDateString();
    if (!itemsByDate.has(key)) itemsByDate.set(key, []);
    itemsByDate.get(key).push(item);
  });

  const filledDays = itemsByDate.size;
  const progress = Math.round((filledDays / days.length) * 100);
  const isComplete = filledDays === days.length;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="container py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif font-bold">Your Tuscan Itinerary</h1>
            <p className="text-sm text-neutral-600">
              {trip.checkIn && trip.checkOut
                ? `${checkIn.toLocaleDateString()} - ${checkOut.toLocaleDateString()}`
                : 'Plan your stay'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-neutral-600 mb-2">
              {filledDays} of {days.length} days planned
            </div>
            <div className="w-48 h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="grid gap-4">
            {days.map((day, idx) => {
              const dayKey = day.toDateString();
              const dayItems = itemsByDate.get(dayKey) || [];
              return (
                <div key={dayKey} className="bg-white p-6 rounded-lg border border-neutral-200">
                  <h3 className="font-serif font-bold text-lg mb-4">
                    Day {idx + 1} - {day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </h3>
                  {dayItems.length > 0 ? (
                    <div className="space-y-2">
                      {dayItems.map((item: any) => (
                        <div key={item.id} className="p-3 bg-neutral-50 rounded flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.experience?.slug}</p>
                            <p className="text-sm text-neutral-600">{item.slot} • {item.participants} guests</p>
                          </div>
                          <button
                            onClick={async () => {
                              await fetch(`/api/trpc/calendar.removeItem`, {
                                method: 'POST',
                                body: JSON.stringify({ input: item.id }),
                              });
                              window.location.reload();
                            }}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedExp({ date: day });
                        setIsAddModalOpen(true);
                      }}
                      className="w-full py-8 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary transition text-neutral-600 hover:text-primary"
                    >
                      + Add experience
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Experiences Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border border-neutral-200 sticky top-20">
            <h3 className="font-serif font-bold text-lg mb-4">Available Experiences</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {experiences.slice(0, 5).map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => {
                    setSelectedExp(exp);
                    setIsAddModalOpen(true);
                  }}
                  className="w-full text-left p-3 border border-neutral-200 rounded hover:bg-primary hover:text-white transition"
                >
                  <p className="font-medium text-sm">{exp.slug}</p>
                  <p className="text-xs opacity-75">{exp.durationClass}</p>
                </button>
              ))}
            </div>
          </div>

          {isComplete && (
            <div className="mt-6 bg-green-50 border-2 border-green-200 p-6 rounded-lg">
              <h4 className="font-serif font-bold text-green-900 mb-2">Congratulations!</h4>
              <p className="text-sm text-green-800 mb-4">
                Your Tuscan week is complete. Your package includes a complimentary private driver for the entire stay.
              </p>
              <button
                onClick={() => router.push(`/submit/${tripId}`)}
                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium"
              >
                Submit Itinerary
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
