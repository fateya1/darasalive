import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { db } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  // Always return the same generic response whether or not the email
  // exists — confirming account existence here is an enumeration leak.
  const genericResponse = () =>
    NextResponse.json({
      message: 'If an account exists for that email, a reset link has been sent.'
    });

  if (!parsed.success) return genericResponse();

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return genericResponse();

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt }
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get('host')}`;
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (err) {
    // Log but don't reveal to the caller — still return the generic message
    // so we don't leak whether the email step specifically failed.
    console.error('Failed to send password reset email:', err);
  }

  return genericResponse();
}
