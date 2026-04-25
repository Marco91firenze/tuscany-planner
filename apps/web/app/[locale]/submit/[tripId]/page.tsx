'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const EXPERIENCE_TITLES: Record<string, string> = {
  'mugello-racing': 'Mugello Racing Test Drive',
  'personal-shopper': 'Personal Shopper - Via Tornabuoni',
  'boat-tour': 'Boat Tour - Forte dei Marmi & Elba',
  'yacht-itinerary': 'Yacht Custom Itinerary',
  'private-chef-dinner': 'Private Chef Dinner',
  'cooking-class': 'Tuscan Cooking Class',
  'helicopter-flight': 'Helicopter Flight over Tuscany',
  'quad-motocross': 'Quad/Motocross through Chianti',
  'horse-riding-wine': 'Horse Riding + Wine Tasting',
  'cantina-antinori': 'Cantina Antinori Winery',
};

export default function SubmitPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.tripId as string;
  const locale = (params?.locale as string) || 'en';

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialNotes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tripId) return;
    fetch('/api/trpc/trip.get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tripId),
    })
      .then((r) => r.json())
      .then((d) => {
        setTrip(d.result?.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tripId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/trpc/inquiry.submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          contactName: formData.name,
          contactEmail: formData.email,
          contactPhone: formData.phone || undefined,
          specialNotes: formData.specialNotes || undefined,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error.message || 'Submission failed');
        setSubmitting(false);
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-amber-900 mb-4">Thank You!</h1>
          <p className="text-lg text-neutral-700 mb-2">
            Your itinerary has been submitted successfully.
          </p>
          <p className="text-neutral-600 mb-8">
            Our concierge will contact you within 4 hours at <strong>{formData.email}</strong> with your all-inclusive package quote.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-left">
            <h3 className="font-serif font-bold text-amber-900 mb-2">What's next?</h3>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li>✉️ Confirmation email sent to your inbox</li>
              <li>📞 Concierge will reach out within 4 hours</li>
              <li>🚗 Complimentary private driver included</li>
              <li>💎 Premium package quote tailored to your itinerary</li>
            </ul>
          </div>
          <button
            onClick={() => router.push(`/${locale}`)}
            className="px-8 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const items = trip?.items || [];
  const checkIn = trip ? new Date(trip.checkIn).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const checkOut = trip ? new Date(trip.checkOut).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => router.push(`/${locale}/plan/${tripId}`)}
          className="text-amber-700 hover:text-amber-900 mb-4 text-sm font-medium"
        >
          ← Back to itinerary
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-700 to-orange-700 text-white p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-2">Complete Your Booking</h1>
            <p className="text-amber-100">Final step to receive your custom Tuscan package quote</p>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Itinerary Summary */}
            <div className="lg:col-span-1 lg:order-2">
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 sticky top-4">
                <h3 className="font-serif font-bold text-amber-900 mb-3">Your Itinerary</h3>
                <div className="text-sm text-neutral-700 space-y-1 mb-4">
                  <p><strong>Stay:</strong> {checkIn} - {checkOut}</p>
                  <p><strong>Party:</strong> {trip?.partySize} guests</p>
                  <p><strong>Experiences:</strong> {items.length}</p>
                </div>
                {items.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {items.map((item: any) => (
                      <div key={item.id} className="bg-white rounded p-2 text-xs">
                        <p className="font-medium">{EXPERIENCE_TITLES[item.experience?.slug] || item.experience?.slug}</p>
                        <p className="text-neutral-500">
                          {new Date(item.date).toLocaleDateString()} • {item.slot}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-amber-200">
                  <p className="text-xs text-amber-800 font-medium">
                    🎁 Includes complimentary private driver for your entire stay
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 lg:order-1">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Alessandro Rossi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="alessandro@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="+39 333 1234567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Special Requests</label>
                  <textarea
                    value={formData.specialNotes}
                    onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Dietary restrictions, accessibility needs, special celebrations..."
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-lg hover:from-amber-800 hover:to-orange-800 transition font-bold text-lg disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Itinerary →'}
                </button>

                <p className="text-xs text-neutral-500 text-center">
                  By submitting, you agree to be contacted by our concierge team. No payment is required at this stage.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
