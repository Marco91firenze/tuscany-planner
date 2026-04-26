'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const FEATURED_EXPERIENCES = [
  { emoji: '🏎️', title: 'Mugello Racing', subtitle: 'Test drive Ferraris on the legendary track' },
  { emoji: '🚁', title: 'Helicopter Tour', subtitle: 'Soar over Tuscan vineyards and villas' },
  { emoji: '🍷', title: 'Antinori Winery', subtitle: 'Historic cellars + premium tastings' },
  { emoji: '🛥️', title: 'Yacht Charter', subtitle: 'Multi-day coastal luxury voyage' },
  { emoji: '🍽️', title: 'Private Chef', subtitle: 'Michelin chef in your villa' },
  { emoji: '🐴', title: 'Horse Riding', subtitle: 'Through Chianti vineyards' },
];

export default function LandingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    partySize: 2,
    language: locale,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.checkIn || !formData.checkOut) {
      alert('Please select check-in and check-out dates');
      setSubmitting(false);
      return;
    }

    const checkIn = new Date(formData.checkIn + 'T00:00:00Z');
    const checkOut = new Date(formData.checkOut + 'T00:00:00Z');

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      alert('Invalid date format');
      setSubmitting(false);
      return;
    }

    if (checkIn >= checkOut) {
      alert('Check-out must be after check-in');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/trpc/trip.create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          partySize: parseInt(formData.partySize.toString()),
          language: formData.language,
        }),
      });

      const data = await res.json();
      if (data.result?.data?.id) {
        router.push(`/${locale}/plan/${data.result.data.id}`);
      } else {
        alert('Failed to create trip: ' + (data.error?.message || 'Unknown error'));
        setSubmitting(false);
      }
    } catch (error: any) {
      console.error('Error creating trip:', error);
      alert('Network error: ' + error.message);
      setSubmitting(false);
    }
  };

  // Default dates: 30 days from now, 5-day stay
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16">
          <div className="text-xl sm:text-2xl font-serif font-bold text-amber-900">
            Florence Premium Tours
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-amber-700 text-white rounded-lg text-sm font-medium hover:bg-amber-800 transition"
          >
            Plan Your Stay
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1920&auto=format&fit=crop"
            alt="Florence skyline"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-xs font-medium mb-4">
                LUXURY • PRIVATE • CURATED
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6 text-amber-950 leading-tight">
                Plan Your Perfect Tuscan Week
              </h1>
              <p className="text-lg sm:text-xl text-neutral-700 mb-8 leading-relaxed">
                Drag premium experiences onto your calendar. Fill your stay, unlock a complimentary private driver — your personal Tuscan adventure awaits.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-8 py-4 bg-amber-700 text-white rounded-lg font-bold hover:bg-amber-800 transition shadow-lg hover:shadow-xl"
                >
                  Start Planning →
                </button>
                <a
                  href="#experiences"
                  className="px-8 py-4 bg-white text-amber-900 rounded-lg font-bold hover:bg-amber-50 transition border-2 border-amber-200 text-center"
                >
                  Browse Experiences
                </a>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> No payment required
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> Concierge response in 4hr
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <img
                  src="/experiences/helicopter-flight.jpg"
                  alt="Helicopter Flight over Tuscany"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-xl">
                  <div className="text-xs text-neutral-500">Featured Experience</div>
                  <div className="font-serif font-bold text-amber-900">Helicopter over Tuscany 🚁</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experiences Preview */}
      <section id="experiences" className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-amber-950 mb-3">
              10 Curated Premium Experiences
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              From Mugello racing to Antinori winery tours — every experience is hand-picked for the discerning traveler.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURED_EXPERIENCES.map((exp) => (
              <div key={exp.title} className="bg-white p-6 rounded-xl border border-amber-100 hover:shadow-lg transition">
                <div className="text-4xl mb-3">{exp.emoji}</div>
                <h3 className="font-serif font-bold text-amber-900 mb-1">{exp.title}</h3>
                <p className="text-sm text-neutral-600">{exp.subtitle}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 bg-amber-700 text-white rounded-lg font-bold hover:bg-amber-800 transition"
            >
              Start Your Itinerary
            </button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gradient-to-br from-amber-100 to-orange-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center text-amber-950 mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '1', title: 'Set Your Stay', desc: 'Tell us your check-in & check-out dates and party size' },
              { num: '2', title: 'Build Your Calendar', desc: 'Drag premium experiences onto each day of your stay' },
              { num: '3', title: 'Unlock Your Perk', desc: 'Fill every day → complimentary private driver included' },
            ].map((step) => (
              <div key={step.num} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-10 h-10 bg-amber-700 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  {step.num}
                </div>
                <h3 className="font-serif font-bold text-amber-900 mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trip Setup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-serif font-bold text-amber-900">Plan Your Tuscan Stay</h2>
              <p className="text-sm text-neutral-600 mt-1">No payment, no commitment — just your dream week</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Check-in</label>
                  <input
                    type="date"
                    required
                    min={minDate}
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Check-out</label>
                  <input
                    type="date"
                    required
                    min={formData.checkIn || minDate}
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Party Size</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={formData.partySize}
                  onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Preferred Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="en">English</option>
                  <option value="it">Italiano</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="es">Español</option>
                  <option value="pt">Português</option>
                  <option value="ru">Русский</option>
                  <option value="zh">中文</option>
                  <option value="ja">日本語</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg font-medium hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-amber-700 text-white rounded-lg font-bold hover:bg-amber-800 transition disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Continue →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-amber-950 text-amber-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <div>© 2026 Florence Premium Tours Srl</div>
          <nav className="flex gap-6">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Cookies</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
