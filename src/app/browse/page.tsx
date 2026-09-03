import Link from 'next/link';
import { db } from '@/lib/db';
import { getContentTypeStyle, COLOR_CLASSES } from '@/lib/contentTypeStyles';

export default async function BrowseByTypePage() {
  const contentTypes = await db.contentType.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { materials: true } } }
  });

  return (
    <main className="max-w-4xl mx-auto px-6 md:px-12 py-16">
      <h1 className="font-display text-3xl mb-2">Browse by type</h1>
      <p className="text-ink/60 mb-10">
        Mocks, termly exams, schemes of work, lesson plans, and CBE assessments — across
        every subject.
      </p>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {contentTypes.map((ct, i) => {
          const { icon: Icon, color } = getContentTypeStyle(ct.name, i);
          const classes = COLOR_CLASSES[color];
          return (
            <Link
              key={ct.id}
              href={`/browse/${ct.id}`}
              className={`group bg-chalk border border-board/10 rounded-lg p-6 transition-colors ${classes.border}`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center ${classes.bg}`}
              >
                <Icon className={`w-5 h-5 ${classes.text}`} strokeWidth={1.75} />
              </div>
              <p className="font-display text-lg mt-4">{ct.name}</p>
              <p className="text-sm text-ink/50 mt-1">
                {ct._count.materials} material{ct._count.materials !== 1 ? 's' : ''}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
