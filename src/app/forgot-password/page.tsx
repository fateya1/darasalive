'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    setStatus('sent');
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-display text-2xl mb-8">Reset your password</h1>

      {status === 'sent' ? (
        <p className="text-sm text-board">
          If an account exists for that email, a reset link has been sent. Check your
          inbox.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-ink/60" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-board disabled:opacity-50 text-chalk py-3 rounded-full mt-4"
          >
            {status === 'loading' ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}

      <p className="text-sm text-ink/60 mt-6">
        <Link href="/login" className="border-b border-ink/40">
          Back to log in
        </Link>
      </p>
    </main>
  );
}
