export default function RegisterPage() {
  return (
    <main className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-display text-2xl mb-8">Create your account</h1>
      {/* Phase 2: wire to POST /api/auth/register, then redirect into the M-Pesa
          STK push flow (see lib/mpesa.ts) with the selected plan. */}
      <form className="space-y-4">
        <div>
          <label className="text-sm text-ink/60" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            name="name"
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
        <div>
          <label className="text-sm text-ink/60" htmlFor="plan">
            Plan
          </label>
          <select
            id="plan"
            name="plan"
            className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none"
          >
            <option value="monthly">Monthly — KES 300</option>
            <option value="semi-annual">Semi-annual — KES 400</option>
            <option value="annual">Annual — KES 700</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-gold hover:bg-gold-dark text-ink py-3 rounded-full mt-4"
        >
          Continue to payment
        </button>
      </form>
    </main>
  );
}
