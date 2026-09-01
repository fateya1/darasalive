import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;

  const resetToken = await db.passwordResetToken.findUnique({ where: { token } });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt < new Date()
  ) {
    return NextResponse.json(
      { error: 'This reset link is invalid or has expired. Request a new one.' },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);

  await db.$transaction([
    db.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() }
    })
  ]);

  return NextResponse.json({ ok: true });
}
