import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { initiateStkPush } from '@/lib/mpesa';

const PLAN_NAME_BY_KEY: Record<string, string> = {
  monthly: 'Monthly',
  'semi-annual': 'Semi-annual',
  annual: 'Annual'
};

const schema = z.object({ plan: z.enum(['monthly', 'semi-annual', 'annual']) });

function toMsisdn(localPhone: string) {
  return `254${localPhone.slice(1)}`;
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const planRow = await db.subscriptionPlan.findUnique({
    where: { name: PLAN_NAME_BY_KEY[parsed.data.plan] }
  });
  if (!planRow) {
    return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });
  }

  const subscription = await db.subscription.create({
    data: { userId: user.id, planId: planRow.id, status: 'PENDING' }
  });

  const msisdn = toMsisdn(user.phone);

  try {
    const result = await initiateStkPush({
      phone: msisdn,
      amount: planRow.priceKes,
      accountReference: subscription.id
    });

    if (result.CheckoutRequestID) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: { checkoutRequestId: result.CheckoutRequestID }
      });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Could not reach M-Pesa' }, { status: 502 });
  }

  return NextResponse.json({ subscriptionId: subscription.id });
}
