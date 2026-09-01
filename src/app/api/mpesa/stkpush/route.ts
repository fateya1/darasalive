import { NextRequest, NextResponse } from 'next/server';
import { initiateStkPush } from '@/lib/mpesa';
import { db } from '@/lib/db';

// POST /api/mpesa/stkpush
// Body: { phone: string, amount: number, subscriptionId: string }
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

    // Save the CheckoutRequestID so the callback (which only gets sent this
    // ID, nothing else identifying) can find its way back to this row.
    if (result.CheckoutRequestID) {
      await db.subscription.update({
        where: { id: subscriptionId },
        data: { checkoutRequestId: result.CheckoutRequestID }
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'STK push failed' }, { status: 500 });
  }
}
