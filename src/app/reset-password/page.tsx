'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.');
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push('/login'), 2000);
  }

  if (!token) {
    return (
      <main className="max-w-sm mx-auto px-6 py-24">
        <h1 className="font-display text-2xl mb-4">Invalid link</h1>
        <p className="text-sm text-ink/60">
          This reset link is missing its token.{' '}
          <Link href="/forgot-password" className="border-b border-ink/40">
            Request a new one
          </Link>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-display text-2xl mb-8">Set a new password</h1>

      {done ? (
        <p className="text-sm text-board">
          Password updated. Redirecting you to log in…
        </p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-ink/60" htmlFor="password">
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-ink py-3 rounded-full mt-4"
          >
            {loading ? 'Please wait…' : 'Update password'}
          </button>
        </form>
      )}
    </main>
  );
}
