import { db } from '@/lib/db';
import Link from 'next/link';

// Server component — fetches curricula and their levels directly.
// Phase 2: add subscription-status check here to show locked/unlocked state.
export default async function SubjectsPage() {
  const curricula = await db.curriculum.findMany({
    include: {
      educationLevels: {
        orderBy: { order: 'asc' },
        include: { subjects: true }
      }
    }
  });

  return (
    <main className="max-w-6xl mx-auto px-6 md:px-12 py-16">
      <Link href="/" className="text-sm text-ink/50">
        ← Back home
      </Link>
      <h1 className="font-display text-3xl mt-4 mb-10">Browse subjects</h1>

      {curricula.length === 0 && (
        <p className="text-ink/60 text-sm">
          No curricula seeded yet — run the Prisma seed script to populate CBC and 8-4-4
          levels and subjects.
        </p>
      )}

      {curricula.map((curriculum) => (
        <section key={curriculum.id} className="mb-14">
          <h2 className="font-display text-xl mb-6 border-b border-board/10 pb-3">
            {curriculum.name}
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {curriculum.educationLevels.map((level) => (
              <div key={level.id} className="border-l-2 border-board pl-4 py-1">
                <p className="font-display">{level.name}</p>
                <p className="text-sm text-ink/60 mt-1">
                  {level.subjects.length} subject{level.subjects.length !== 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
