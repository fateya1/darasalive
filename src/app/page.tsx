import Link from 'next/link';

const contentTypes = [
  { name: 'Notes', note: 'Topic-by-topic, written for revision, not first-time teaching.' },
  { name: 'Exams', note: 'Past papers and original sets, marked by term and year.' },
  { name: 'Marking schemes', note: 'Full working, not just final answers.' },
  { name: 'Lesson plans', note: 'For teachers — ready to adapt to your class.' },
  { name: 'Schemes of work', note: 'Termly coverage mapped to the syllabus.' }
];

const plans = [
  { name: 'Monthly', price: 300, unit: '/ month' },
  { name: 'Semi-annual', price: 400, unit: '/ 6 months', featured: true },
  { name: 'Annual', price: 700, unit: '/ year' }
];

export default function LandingPage() {
  return (
    <main>
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 max-w-6xl mx-auto">
        <span className="font-display text-xl">DarasaLive</span>
        <div className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/subjects">Browse subjects</Link>
          <Link href="/login">Log in</Link>
          <Link
            href="/register"
            className="bg-gold hover:bg-gold-dark text-ink px-4 py-2 rounded-full transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-board text-chalk">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-display text-4xl md:text-5xl leading-tight">
              Every grade, every subject, ready to revise
            </h1>
            <p className="mt-6 text-chalk/80 max-w-md">
              Notes, exams, lesson plans and schemes of work for CBC and 8-4-4 — from
              Pre-Primary through Senior School. Pay with M-Pesa, unlock everything.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/register"
                className="bg-gold hover:bg-gold-dark text-ink px-6 py-3 rounded-full font-medium transition-colors"
              >
                Start revising
              </Link>
              <Link
                href="/subjects"
                className="border border-chalk/40 hover:border-chalk px-6 py-3 rounded-full transition-colors"
              >
                Browse subjects
              </Link>
            </div>
          </div>

          {/* Class register card — the signature visual element */}
          <div className="bg-chalk text-ink rounded-lg p-6 shadow-xl">
            <p className="text-sm text-ink/60 mb-4">Today's register</p>
            <ul className="divide-y divide-ink/10">
              {['Pre-Primary 1–2', 'Grade 1 – 6', 'Junior School (7–9)', 'Senior School', 'Form 1 – 4 (8-4-4)'].map(
                (level) => (
                  <li key={level} className="flex items-center justify-between py-3 text-sm">
                    <span>{level}</span>
                    <span className="text-ink/40">present</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Content types */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-20">
        <h2 className="font-display text-2xl md:text-3xl mb-10 max-w-lg">
          What's on the shelf
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4">
          {contentTypes.map((c) => (
            <div key={c.name} className="border-l-2 border-board pl-4 py-1">
              <p className="font-display text-lg">{c.name}</p>
              <p className="text-sm text-ink/60 mt-2">{c.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-board/5 border-t border-b border-board/10">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-20">
          <h2 className="font-display text-2xl md:text-3xl mb-10 max-w-lg">
            One subscription, full access
          </h2>
          <div className="grid md:grid-cols-3 gap-px bg-board/10">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`bg-chalk p-8 ${p.featured ? 'ring-1 ring-gold' : ''}`}
              >
                <p className="text-sm text-ink/60">{p.name}</p>
                <p className="font-display text-4xl mt-3">
                  KES {p.price}
                  <span className="text-base text-ink/50">{p.unit}</span>
                </p>
                <Link
                  href={`/register?plan=${p.name.toLowerCase()}`}
                  className="mt-6 inline-block text-sm border-b border-ink/40 hover:border-gold"
                >
                  Choose {p.name.toLowerCase()}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 md:px-12 py-10 text-sm text-ink/50 flex justify-between">
        <span>DarasaLive</span>
        <span>Built for CBC and 8-4-4 learners in Kenya</span>
      </footer>
    </main>
  );
}
