import { redirect } from 'next/navigation';
import { UserRound, Mail, Phone, ShieldCheck, CircleCheck, Clock, CircleX } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';
import RenewSubscription from '@/components/RenewSubscription';

function formatDate(d: Date | null) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium' }).format(d);
}

const STATUS_STYLE = {
  ACTIVE: { icon: CircleCheck, color: 'text-sage', bg: 'bg-sage', label: 'Active' },
  PENDING: { icon: Clock, color: 'text-gold-dark', bg: 'bg-gold', label: 'Pending' },
  FAILED: { icon: CircleX, color: 'text-terracotta', bg: 'bg-terracotta', label: 'Failed' },
  EXPIRED: { icon: CircleX, color: 'text-ink/50', bg: 'bg-ink/30', label: 'Expired' }
} as const;

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

  const statusKey = isActive ? 'ACTIVE' : subscription?.status ?? 'PENDING';
  const status = STATUS_STYLE[statusKey as keyof typeof STATUS_STYLE];
  const StatusIcon = status.icon;

  return (
    <main className="max-w-2xl mx-auto px-6 md:px-12 py-16">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-board">
          <UserRound className="w-7 h-7 text-chalk" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="font-display text-2xl">{user.name}</h1>
          <p className="text-sm text-ink/50">My account</p>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="font-display text-lg mb-4 border-b border-board/10 pb-2">
          Profile
        </h2>
        <dl className="text-sm space-y-3">
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-2 text-ink/50">
              <Mail className="w-4 h-4" strokeWidth={1.75} /> Email
            </dt>
            <dd>{user.email}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-2 text-ink/50">
              <Phone className="w-4 h-4" strokeWidth={1.75} /> Phone
            </dt>
            <dd>{user.phone}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-2 text-ink/50">
              <ShieldCheck className="w-4 h-4" strokeWidth={1.75} /> Role
            </dt>
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
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${status.bg}`}
                >
                  <StatusIcon className="w-5 h-5 text-white" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-display">{subscription.plan.name}</p>
                  <p className={`text-sm ${status.color}`}>{status.label}</p>
                </div>
              </div>
              <dl className="text-sm space-y-2">
                <div className="flex justify-between">
                  <dt className="text-ink/50">Started</dt>
                  <dd>{formatDate(subscription.startDate)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink/50">Expires</dt>
                  <dd>{formatDate(subscription.endDate)}</dd>
                </div>
              </dl>
            </div>
          )}

          {!isActive && <RenewSubscription />}
        </section>
      )}
    </main>
  );
}
