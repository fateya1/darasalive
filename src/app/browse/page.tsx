import Link from 'next/link';
import { db } from '@/lib/db';

export default async function BrowseByTypePage() {
  const contentTypes = await db.contentType.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { materials: true } } }
  });

  return (
    <main className="max-w-4xl mx-auto px-6 md:px-12 py-16">
      <h1 className="font-display text-3xl mb-2">Browse by type</h1>
      <p className="text-ink/60 mb-10">
        Mocks, termly exams, schemes of work, lesson plans, and CBA assessments — across
        every subject.
      </p>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-px bg-board/10">
        {contentTypes.map((ct) => (
          <Link
            key={ct.id}
            href={`/browse/${ct.id}`}
            className="bg-chalk p-6 hover:bg-board/5 transition-colors"
          >
            <p className="font-display text-lg">{ct.name}</p>
            <p className="text-sm text-ink/50 mt-2">
              {ct._count.materials} material{ct._count.materials !== 1 ? 's' : ''}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
