'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      router.push(data.role === 'ADMIN' ? '/admin' : '/subjects');
      router.refresh();
    } catch {
      setError('Network error — please check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-display text-2xl mb-8">Log in</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm text-ink/60" htmlFor="identifier">
            Email or phone
          </label>
          <input
            id="identifier"
            name="identifier"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <p className="text-sm">
          <Link href="/forgot-password" className="text-ink/50 border-b border-ink/30">
            Forgot your password?
          </Link>
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-board disabled:opacity-50 text-chalk py-3 rounded-full mt-4"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="text-sm text-ink/60 mt-6">
        New here?{' '}
        <Link href="/register" className="border-b border-ink/40">
          Create an account
        </Link>
      </p>
    </main>
  );
}
