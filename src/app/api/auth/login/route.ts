import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyPassword, createSessionToken, SESSION_COOKIE } from '@/lib/auth';

const loginSchema = z.object({
  identifier: z.string().min(3, 'Enter your email or phone'),
  password: z.string().min(1, 'Password is required')
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const { identifier, password } = parsed.data;

  const user = await db.user.findFirst({
    where: { OR: [{ email: identifier }, { phone: identifier }] }
  });

  // Same error for "no such user" and "wrong password" — don't reveal
  // which one it was, that's an account-enumeration leak.
  const invalid = () =>
    NextResponse.json({ error: 'Incorrect email/phone or password' }, { status: 401 });

  if (!user) return invalid();

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return invalid();

  const token = await createSessionToken({ userId: user.id, role: user.role });

  const res = NextResponse.json({ userId: user.id, role: user.role });

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  });

  return res;
}
