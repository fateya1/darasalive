import { db } from '@/lib/db';
import MaterialUploadForm from '@/components/MaterialUploadForm';
import DeleteMaterialButton from '@/components/DeleteMaterialButton';

// Route itself is already protected by src/middleware.ts (ADMIN role only).
export default async function AdminPage() {
  const [
    materialsCount,
    usersCount,
    activeSubscriptionsCount,
    subjects,
    contentTypes,
    materials
  ] = await Promise.all([
    db.material.count(),
    db.user.count(),
    db.subscription.count({ where: { status: 'ACTIVE' } }),
    db.subject.findMany({
      include: { educationLevel: { include: { curriculum: true } } },
      orderBy: [{ educationLevel: { order: 'asc' } }, { name: 'asc' }]
    }),
    db.contentType.findMany({ orderBy: { name: 'asc' } }),
    db.material.findMany({
      include: { subject: true, contentType: true },
      orderBy: { uploadedAt: 'desc' },
      take: 50
    })
  ]);

  return (
    <main className="max-w-6xl mx-auto px-6 md:px-12 py-16">
      <h1 className="font-display text-3xl mb-2">Admin</h1>
      <p className="text-ink/60 mb-10">Upload materials, review users, check payments.</p>

      <div className="grid md:grid-cols-3 gap-px bg-board/10 mb-16">
        <div className="bg-chalk p-6">
          <p className="text-sm text-ink/60">Materials</p>
          <p className="font-display text-3xl mt-2">{materialsCount}</p>
          <p className="text-sm text-ink/50 mt-1">Notes, exams, schemes of work uploaded</p>
        </div>
        <div className="bg-chalk p-6">
          <p className="text-sm text-ink/60">Users</p>
          <p className="font-display text-3xl mt-2">{usersCount}</p>
          <p className="text-sm text-ink/50 mt-1">Students and teachers registered</p>
        </div>
        <div className="bg-chalk p-6">
          <p className="text-sm text-ink/60">Active subscriptions</p>
          <p className="font-display text-3xl mt-2">{activeSubscriptionsCount}</p>
          <p className="text-sm text-ink/50 mt-1">Paid and currently unlocked</p>
        </div>
      </div>

      <h2 className="font-display text-xl mb-6 border-b border-board/10 pb-3">
        Upload a material
      </h2>

      {subjects.length === 0 ? (
        <p className="text-sm text-ink/60">
          No subjects seeded yet — run the Prisma seed script before uploading materials.
        </p>
      ) : (
        <MaterialUploadForm subjects={subjects} contentTypes={contentTypes} />
      )}

      <h2 className="font-display text-xl mt-16 mb-6 border-b border-board/10 pb-3">
        Uploaded materials
      </h2>

      {materials.length === 0 ? (
        <p className="text-sm text-ink/60">Nothing uploaded yet.</p>
      ) : (
        <div className="divide-y divide-board/10">
          {materials.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-4 text-sm">
              <div>
                <p className="font-medium">{m.title}</p>
                <p className="text-ink/50 mt-1">
                  {m.subject.name} · {m.contentType.name}
                  {m.term ? ` · ${m.term}` : ''}
                  {m.year ? ` · ${m.year}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href={`/api/materials/${m.id}/download`}
                  className="border-b border-ink/40 hover:border-gold"
                >
                  Download
                </a>
                <DeleteMaterialButton materialId={m.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
