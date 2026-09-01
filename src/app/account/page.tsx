import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';
import RenewSubscription from '@/components/RenewSubscription';

function formatDate(d: Date | null) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium' }).format(d);
}

export default async function AccountPage() {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect('/login');

  const subscription = await db.subscription.findFirst({
    where: { userId: user.id },
    include: { plan: true },
    orderBy: { createdAt: 'desc' }
  });

  const isActive =
    subscription?.status === 'ACTIVE' &&
    subscription.endDate &&
    subscription.endDate > new Date();

  return (
    <main className="max-w-2xl mx-auto px-6 md:px-12 py-16">
      <h1 className="font-display text-3xl mb-10">My account</h1>

      <section className="mb-12">
        <h2 className="font-display text-lg mb-4 border-b border-board/10 pb-2">
          Profile
        </h2>
        <dl className="text-sm space-y-2">
          <div className="flex justify-between">
            <dt className="text-ink/50">Name</dt>
            <dd>{user.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/50">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/50">Phone</dt>
            <dd>{user.phone}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/50">Role</dt>
            <dd>{user.role}</dd>
          </div>
        </dl>
      </section>

      {user.role !== 'ADMIN' && (
        <section>
          <h2 className="font-display text-lg mb-4 border-b border-board/10 pb-2">
            Subscription
          </h2>

          {!subscription ? (
            <p className="text-sm text-ink/60">No subscription on record.</p>
          ) : (
            <dl className="text-sm space-y-2 mb-6">
              <div className="flex justify-between">
                <dt className="text-ink/50">Plan</dt>
                <dd>{subscription.plan.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/50">Status</dt>
                <dd>{isActive ? 'Active' : subscription.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/50">Started</dt>
                <dd>{formatDate(subscription.startDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/50">Expires</dt>
                <dd>{formatDate(subscription.endDate)}</dd>
              </div>
            </dl>
          )}

          {!isActive && <RenewSubscription />}
        </section>
      )}
    </main>
  );
}
