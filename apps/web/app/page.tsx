'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    partySize: 1,
    language: 'en',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);

    if (checkIn >= checkOut) {
      alert('Check-out date must be after check-in date');
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
        router.push(`/plan/${data.result.data.id}`);
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Failed to create trip. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="container flex justify-between items-center h-16">
          <div className="text-2xl font-serif font-bold text-primary">Tuscany Planner</div>
          <nav className="hidden md:flex gap-8">
            <a href="#experiences" className="text-sm hover:text-primary transition">
              Experiences
            </a>
            <a href="#" className="text-sm hover:text-primary transition">
              Language
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 to-secondary opacity-30"></div>
        <div className="container relative h-full flex flex-col justify-center py-20 md:py-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-neutral-900">
                Plan Your Perfect Tuscan Week
              </h1>
              <p className="text-lg text-neutral-600 mb-8">
                Curated luxury experiences. One click away. Fill your calendar, unlock your private driver.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-4 bg-primary text-white rounded-lg font-medium hover:bg-primaryDark transition"
              >
                Start Planning
              </button>
            </div>
            <div className="relative h-96 md:h-full hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-20 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-serif font-bold mb-6">Plan Your Stay</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Check-in Date</label>
                <input
                  type="date"
                  required
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Check-out Date</label>
                <input
                  type="date"
                  required
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Party Size</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.partySize}
                  onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="en">English</option>
                  <option value="it">Italiano</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="es">Español</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-neutral-100 border-t border-neutral-200 py-8">
        <div className="container flex justify-between items-center text-sm text-neutral-600">
          <div>© 2026 Florence Premium Tours Srl</div>
          <nav className="flex gap-6">
            <a href="#" className="hover:text-primary transition">
              Privacy
            </a>
            <a href="#" className="hover:text-primary transition">
              Terms
            </a>
            <a href="#" className="hover:text-primary transition">
              Cookies
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
