import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-display text-2xl mb-8">Log in</h1>
      {/* Phase 2: wire this form to POST /api/auth/login, set session cookie via lib/auth.ts */}
      <form className="space-y-4">
        <div>
          <label className="text-sm text-ink/60" htmlFor="email">
            Email or phone
          </label>
          <input
            id="email"
            name="email"
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
            className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-board text-chalk py-3 rounded-full mt-4"
        >
          Log in
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
