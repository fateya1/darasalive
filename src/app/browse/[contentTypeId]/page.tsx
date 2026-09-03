import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import MaterialsByTypeBrowser from '@/components/MaterialsByTypeBrowser';
import { getContentTypeStyle, COLOR_CLASSES } from '@/lib/contentTypeStyles';

export default async function ContentTypePage({
  params
}: {
  params: { contentTypeId: string };
}) {
  const contentType = await db.contentType.findUnique({
    where: { id: params.contentTypeId }
  });

  if (!contentType) notFound();

  const { icon: Icon, color } = getContentTypeStyle(contentType.name, 0);
  const classes = COLOR_CLASSES[color];

  const session = await getSessionUser();

  const activeSubscription = session
    ? session.role === 'ADMIN'
      ? true
      : await db.subscription.findFirst({
          where: {
            userId: session.userId,
            status: 'ACTIVE',
            endDate: { gt: new Date() }
          },
          orderBy: { createdAt: 'desc' }
        })
    : null;

  const materials = activeSubscription
    ? await db.material.findMany({
        where: { contentTypeId: contentType.id },
        include: { subject: { include: { educationLevel: true } } },
        orderBy: { uploadedAt: 'desc' }
      })
    : [];

  return (
    <main className="max-w-4xl mx-auto px-6 md:px-12 py-16">
      <Link href="/browse" className="text-sm text-ink/50">
        ← Browse by type
      </Link>

      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center mt-4 ${classes.bg}`}
      >
        <Icon className={`w-5 h-5 ${classes.text}`} strokeWidth={1.75} />
      </div>
      <h1 className="font-display text-3xl mt-3 mb-10">{contentType.name}</h1>

      {!session && (
        <div className="border-l-2 border-gold pl-4 py-2">
          <p className="text-sm text-ink/70">Log in to see what's available.</p>
          <div className="flex gap-4 mt-3 text-sm">
            <Link href="/login" className="border-b border-ink/40 hover:border-gold">
              Log in
            </Link>
            <Link href="/register" className="border-b border-ink/40 hover:border-gold">
              Create an account
            </Link>
          </div>
        </div>
      )}

      {session && !activeSubscription && (
        <div className="border-l-2 border-gold pl-4 py-2">
          <p className="text-sm text-ink/70">
            Your subscription isn't active yet — subscribe to unlock materials for every
            subject.
          </p>
          <Link
            href="/register"
            className="inline-block mt-3 text-sm border-b border-ink/40 hover:border-gold"
          >
            View plans
          </Link>
        </div>
      )}

      {session && activeSubscription && (
        <>
          {materials.length === 0 ? (
            <p className="text-sm text-ink/60">
              Nothing uploaded under {contentType.name} yet — check back soon.
            </p>
          ) : (
            <MaterialsByTypeBrowser
              materials={materials.map((m) => ({
                id: m.id,
                title: m.title,
                term: m.term,
                year: m.year,
                subjectName: m.subject.name,
                levelName: m.subject.educationLevel.name
              }))}
            />
          )}
        </>
      )}
    </main>
  );
}
