import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword, createSessionToken, SESSION_COOKIE } from '@/lib/auth';

const PLAN_NAME_BY_KEY: Record<string, string> = {
  monthly: 'Monthly',
  'semi-annual': 'Semi-annual',
  annual: 'Annual'
};

const registerSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  phone: z
    .string()
    .regex(/^0[71]\d{8}$/, 'Enter a valid Kenyan phone number, e.g. 07XXXXXXXX'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  plan: z.enum(['monthly', 'semi-annual', 'annual'])
});

function toMsisdn(localPhone: string) {
  // 07XXXXXXXX / 01XXXXXXXX -> 2547XXXXXXXX / 2541XXXXXXXX, the format
  // Daraja's STK Push expects.
  return `254${localPhone.slice(1)}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const { name, phone, email, password, plan } = parsed.data;

  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { phone }] }
  });
  if (existing) {
    return NextResponse.json(
      { error: 'An account with that email or phone already exists' },
      { status: 409 }
    );
  }

  const planRow = await db.subscriptionPlan.findUnique({
    where: { name: PLAN_NAME_BY_KEY[plan] }
  });
  if (!planRow) {
    return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  const user = await db.user.create({
    data: { name, phone, email, passwordHash }
  });

  const subscription = await db.subscription.create({
    data: { userId: user.id, planId: planRow.id, status: 'PENDING' }
  });

  const token = await createSessionToken({ userId: user.id, role: user.role });

  const res = NextResponse.json({
    userId: user.id,
    subscriptionId: subscription.id,
    amount: planRow.priceKes,
    msisdn: toMsisdn(phone)
  });

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });

  return res;
}
