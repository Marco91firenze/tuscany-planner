import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Geist } from 'geist/font';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tuscany Planner - Luxury Experiences in Florence',
  description: 'Plan your perfect week in Tuscany with curated premium experiences',
  openGraph: {
    title: 'Tuscany Planner',
    description: 'Plan your perfect Tuscan week',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={Geist.className}>
        <div className="min-h-screen flex flex-col bg-white">
          {children}
        </div>
      </body>
    </html>
  );
}
