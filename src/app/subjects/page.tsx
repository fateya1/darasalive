import { db } from '@/lib/db';
import Link from 'next/link';
import { GraduationCap, BookOpen } from 'lucide-react';

type TierColor = 'sage' | 'sky' | 'gold' | 'plum' | 'teal' | 'terracotta';

const BORDER_CLASS: Record<TierColor, string> = {
  sage: 'border-sage',
  sky: 'border-sky',
  gold: 'border-gold',
  plum: 'border-plum',
  teal: 'border-teal',
  terracotta: 'border-terracotta'
};

function levelColor(levelName: string): TierColor {
  const n = levelName.toLowerCase();
  if (n.includes('pre-primary')) return 'sage';
  if (n.includes('senior school')) return 'plum';
  if (n.includes('grade 7') || n.includes('grade 8') || n.includes('grade 9')) return 'gold';
  if (n.startsWith('grade')) return 'sky';
  if (n.startsWith('form')) return 'terracotta';
  if (n.startsWith('standard')) return 'teal';
  return 'sky';
}

// Server component — fetches curricula and their levels directly.
export default async function SubjectsPage() {
  const curricula = await db.curriculum.findMany({
    include: {
      educationLevels: {
        orderBy: { order: 'asc' },
        include: { subjects: { orderBy: { name: 'asc' } } }
      }
    }
  });

  return (
    <main className="max-w-6xl mx-auto px-6 md:px-12 py-16">
      <h1 className="font-display text-3xl mb-10">Browse subjects</h1>

      {curricula.length === 0 && (
        <p className="text-ink/60 text-sm">
          No curricula seeded yet — run the Prisma seed script to populate CBC and 8-4-4
          levels and subjects.
        </p>
      )}

      {curricula.map((curriculum) => {
        const CurriculumIcon = curriculum.name === 'CBC' ? GraduationCap : BookOpen;
        return (
          <section key={curriculum.id} className="mb-14">
            <div className="flex items-center gap-3 mb-6 border-b border-board/10 pb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-board">
                <CurriculumIcon className="w-4.5 h-4.5 text-chalk" strokeWidth={1.75} />
              </div>
              <h2 className="font-display text-xl">{curriculum.name}</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
              {curriculum.educationLevels.map((level) => (
                <div
                  key={level.id}
                  className={`border-l-4 pl-4 py-1 ${BORDER_CLASS[levelColor(level.name)]}`}
                >
                  <p className="font-display">{level.name}</p>
                  <ul className="mt-2 space-y-1">
                    {level.subjects.map((subject) => (
                      <li key={subject.id}>
                        <Link
                          href={`/subjects/${subject.id}`}
                          className="text-sm text-ink/70 hover:text-ink border-b border-transparent hover:border-gold"
                        >
                          {subject.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
