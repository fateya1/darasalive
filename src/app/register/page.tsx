'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get('plan') ?? 'monthly';

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    plan: initialPlan
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stkStatus, setStkStatus] = useState<string | null>(null);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      // Account created — now trigger the M-Pesa STK push for the chosen plan.
      setStkStatus('Sending the M-Pesa prompt to your phone…');
      const stkRes = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: data.msisdn,
          amount: data.amount,
          subscriptionId: data.subscriptionId
        })
      });

      if (!stkRes.ok) {
        setStkStatus(
          'Account created, but we could not reach M-Pesa just now. You can retry payment from your account.'
        );
        setLoading(false);
        return;
      }

      setStkStatus('Check your phone and enter your M-Pesa PIN to complete payment.');
      // Phase 2: poll subscription status or listen for the callback result
      // instead of a flat redirect, so the UI reflects ACTIVE/FAILED state.
      setTimeout(() => router.push('/subjects'), 3000);
    } catch {
      setError('Network error — please check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-display text-2xl mb-8">Create your account</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm text-ink/60" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            value={form.name}
            onChange={update('name')}
            className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-ink/60" htmlFor="phone">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            placeholder="07XXXXXXXX"
            required
            value={form.phone}
            onChange={update('phone')}
            className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-ink/60" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-ink/60" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={update('password')}
            className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-ink/60" htmlFor="plan">
            Plan
          </label>
          <select
            id="plan"
            name="plan"
            value={form.plan}
            onChange={update('plan')}
            className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none"
          >
            <option value="monthly">Monthly — KES 300</option>
            <option value="semi-annual">Semi-annual — KES 400</option>
            <option value="annual">Annual — KES 700</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {stkStatus && <p className="text-sm text-board">{stkStatus}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-ink py-3 rounded-full mt-4"
        >
          {loading ? 'Please wait…' : 'Continue to payment'}
        </button>
      </form>
      <p className="text-sm text-ink/60 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="border-b border-ink/40">
          Log in
        </Link>
      </p>
    </main>
  );
}
