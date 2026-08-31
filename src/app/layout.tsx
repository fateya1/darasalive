import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '500', '600']
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600']
});

export const metadata: Metadata = {
  title: 'DarasaLive — Revision materials for every learner',
  description:
    'Notes, exams, lesson plans and schemes of work for CBC and 8-4-4, from Pre-Primary to Senior School.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-body bg-chalk text-ink">{children}</body>
    </html>
  );
}
