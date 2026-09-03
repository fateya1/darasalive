import { Library, Users, BadgeCheck } from 'lucide-react';
import { db } from '@/lib/db';
import UploadTabs from '@/components/UploadTabs';
import AdminMaterialsBrowser from '@/components/AdminMaterialsBrowser';

// Route itself is already protected by src/middleware.ts (ADMIN role only).
export default async function AdminPage() {
  const [
    materialsCount,
    usersCount,
    activeSubscriptionsCount,
    subjects,
    contentTypes,
    materials,
    educationLevels
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
      orderBy: { uploadedAt: 'desc' }
    }),
    db.educationLevel.findMany({
      include: { curriculum: true },
      orderBy: { order: 'asc' }
    })
  ]);

  return (
    <main className="max-w-6xl mx-auto px-6 md:px-12 py-16">
      <h1 className="font-display text-3xl mb-2">Admin</h1>
      <p className="text-ink/60 mb-10">Upload materials, review users, check payments.</p>

      <div className="grid md:grid-cols-3 gap-4 mb-16">
        <div className="relative bg-chalk border border-board/10 rounded-lg p-6 pt-7 overflow-hidden">
          <span className="absolute top-0 left-0 right-0 h-1.5 bg-sky" />
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-sky">
            <Library className="w-6 h-6 text-white" strokeWidth={1.75} />
          </div>
          <p className="font-display text-3xl mt-4">{materialsCount}</p>
          <p className="text-sm text-ink/50 mt-1">Materials — notes, exams, schemes uploaded</p>
        </div>
        <div className="relative bg-chalk border border-board/10 rounded-lg p-6 pt-7 overflow-hidden">
          <span className="absolute top-0 left-0 right-0 h-1.5 bg-sage" />
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-sage">
            <Users className="w-6 h-6 text-white" strokeWidth={1.75} />
          </div>
          <p className="font-display text-3xl mt-4">{usersCount}</p>
          <p className="text-sm text-ink/50 mt-1">Users — students and teachers registered</p>
        </div>
        <div className="relative bg-chalk border border-board/10 rounded-lg p-6 pt-7 overflow-hidden">
          <span className="absolute top-0 left-0 right-0 h-1.5 bg-gold" />
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gold">
            <BadgeCheck className="w-6 h-6 text-white" strokeWidth={1.75} />
          </div>
          <p className="font-display text-3xl mt-4">{activeSubscriptionsCount}</p>
          <p className="text-sm text-ink/50 mt-1">Active subscriptions — paid and unlocked</p>
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
        <UploadTabs
          subjects={subjects}
          contentTypes={contentTypes}
          educationLevels={educationLevels.map((lvl) => ({
            id: lvl.id,
            name: lvl.name,
            curriculumName: lvl.curriculum.name
          }))}
        />
      )}

      <h2 className="font-display text-xl mt-16 mb-6 border-b border-board/10 pb-3">
        Uploaded materials
      </h2>

      {materials.length === 0 ? (
        <p className="text-sm text-ink/60">Nothing uploaded yet.</p>
      ) : (
        <AdminMaterialsBrowser
          materials={materials.map((m) => ({
            id: m.id,
            title: m.title,
            term: m.term,
            year: m.year,
            subjectName: m.subject.name,
            contentTypeName: m.contentType.name
          }))}
        />
      )}
    </main>
  );
}
