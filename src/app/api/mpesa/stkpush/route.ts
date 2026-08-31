import { NextRequest, NextResponse } from 'next/server';
import { initiateStkPush } from '@/lib/mpesa';

// POST /api/mpesa/stkpush
// Body: { phone: string, amount: number, subscriptionId: string }
// Phase 2: validate the subscription belongs to the requesting user,
// call initiateStkPush, store the returned CheckoutRequestID on the
// Subscription row, and return it to the client for status polling.
export async function POST(req: NextRequest) {
  try {
    const { phone, amount, subscriptionId } = await req.json();

    if (!phone || !amount || !subscriptionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await initiateStkPush({
      phone,
      amount,
      accountReference: subscriptionId
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'STK push failed' }, { status: 500 });
  }
}
