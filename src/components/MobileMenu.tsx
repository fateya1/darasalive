'use client';

import { useState } from 'react';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

interface NavUser {
  name: string;
  role: string;
}

export default function MobileMenu({ user }: { user: NavUser | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="p-2 -mr-2"
      >
        <div className="w-6 space-y-1.5">
          <span
            className={`block h-0.5 bg-ink transition-transform ${
              open ? 'translate-y-2 rotate-45' : ''
            }`}
          />
          <span className={`block h-0.5 bg-ink transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span
            className={`block h-0.5 bg-ink transition-transform ${
              open ? '-translate-y-2 -rotate-45' : ''
            }`}
          />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 bg-chalk border-t border-board/10 px-6 py-6 flex flex-col gap-4 text-sm z-50">
          <Link href="/subjects" onClick={() => setOpen(false)}>
            Browse subjects
          </Link>
          <Link href="/browse" onClick={() => setOpen(false)}>
            Browse by type
          </Link>

          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link href="/admin" onClick={() => setOpen(false)}>
                  Admin
                </Link>
              )}
              <Link href="/account" onClick={() => setOpen(false)}>
                My account
              </Link>
              <span className="text-ink/50">
                {user.name} · {user.role.toLowerCase()}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)}>
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="bg-gold hover:bg-gold-dark text-ink px-4 py-2 rounded-full transition-colors inline-block w-fit"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
