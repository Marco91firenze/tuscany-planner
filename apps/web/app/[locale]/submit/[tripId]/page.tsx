'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SubmitPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.tripId as string;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialNotes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/trpc/inquiry.submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            tripId,
            contactName: formData.name,
            contactEmail: formData.email,
            contactPhone: formData.phone,
            specialNotes: formData.specialNotes,
          },
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
    }
  };

  if (submitted) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-4xl font-serif font-bold mb-6">Thank You!</h1>
        <p className="text-lg text-neutral-600 mb-8">
          Your itinerary has been submitted. Our concierge will contact you within 4 hours with your all-inclusive package quote.
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primaryDark transition"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container py-20 max-w-md mx-auto">
      <h1 className="text-3xl font-serif font-bold mb-8">Complete Your Booking</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Special Requests</label>
          <textarea
            value={formData.specialNotes}
            onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primaryDark transition font-medium"
        >
          Submit Itinerary
        </button>
      </form>
    </div>
  );
}
