import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';
import LogoutButton from './LogoutButton';
import MobileMenu from './MobileMenu';

export default async function Navbar() {
  const session = await getSessionUser();

  const user = session
    ? await db.user.findUnique({
        where: { id: session.userId },
        select: { name: true, role: true }
      })
    : null;

  return (
    <nav className="relative flex items-center justify-between px-6 md:px-12 py-6 max-w-6xl mx-auto">
      <Link href="/" className="font-display text-xl">
        DarasaLive
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm">
        <Link href="/subjects">Browse subjects</Link>
        <Link href="/browse">Browse by type</Link>

        {user ? (
          <>
            {user.role === 'ADMIN' && <Link href="/admin">Admin</Link>}
            <Link href="/account">My account</Link>
            <span className="text-ink/50">
              {user.name} · {user.role.toLowerCase()}
            </span>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link
              href="/register"
              className="bg-gold hover:bg-gold-dark text-ink px-4 py-2 rounded-full transition-colors"
            >
              Get started
            </Link>
          </>
        )}
      </div>

      <MobileMenu user={user} />
    </nav>
  );
}
