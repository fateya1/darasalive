// Phase 2: gate this route in middleware.ts — only Role.ADMIN should reach it.
export default function AdminPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 md:px-12 py-16">
      <h1 className="font-display text-3xl mb-2">Admin</h1>
      <p className="text-ink/60 mb-10">Upload materials, review users, check payments.</p>

      <div className="grid md:grid-cols-3 gap-px bg-board/10">
        <div className="bg-chalk p-6">
          <p className="text-sm text-ink/60">Materials</p>
          <p className="font-display text-3xl mt-2">—</p>
          <p className="text-sm text-ink/50 mt-1">Upload notes, exams, schemes of work</p>
        </div>
        <div className="bg-chalk p-6">
          <p className="text-sm text-ink/60">Users</p>
          <p className="font-display text-3xl mt-2">—</p>
          <p className="text-sm text-ink/50 mt-1">Students and teachers registered</p>
        </div>
        <div className="bg-chalk p-6">
          <p className="text-sm text-ink/60">Active subscriptions</p>
          <p className="font-display text-3xl mt-2">—</p>
          <p className="text-sm text-ink/50 mt-1">Paid and currently unlocked</p>
        </div>
      </div>

      <p className="text-sm text-ink/50 mt-10">
        Phase 2: build the material upload form here (title, subject, content type, file →
        Vercel Blob), plus tables for users and subscriptions backed by Prisma queries
        against the models in prisma/schema.prisma.
      </p>
    </main>
  );
}
