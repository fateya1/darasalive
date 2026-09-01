import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface StkCallbackItem {
  Name: string;
  Value?: string | number;
}

interface StkCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: { Item: StkCallbackItem[] };
}

function getMetadataValue(items: StkCallbackItem[] | undefined, name: string) {
  return items?.find((i) => i.Name === name)?.Value;
}

// POST /api/mpesa/callback
// Safaricom calls this after the customer completes, cancels, or fails the
// STK push prompt. Must always respond fast with 200 — Safaricom retries on
// non-200 responses, and a slow response can cause duplicate retries.
export async function POST(req: NextRequest) {
  let body: { Body?: { stkCallback?: StkCallback } };

  try {
    body = await req.json();
  } catch {
    // Malformed body — nothing to do, but still ack so Safaricom doesn't retry.
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }

  const callback = body.Body?.stkCallback;
  if (!callback?.CheckoutRequestID) {
    console.error('M-Pesa callback missing CheckoutRequestID:', JSON.stringify(body));
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }

  const subscription = await db.subscription.findFirst({
    where: { checkoutRequestId: callback.CheckoutRequestID },
    include: { plan: true }
  });

  if (!subscription) {
    // No matching row — could be a stale/duplicate callback, or the STK
    // push update never saved. Log it for investigation, still ack.
    console.error(
      `No subscription found for CheckoutRequestID ${callback.CheckoutRequestID}`
    );
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }

  if (callback.ResultCode === 0) {
    // Success — pull the M-Pesa receipt number from the metadata array.
    const receipt = getMetadataValue(
      callback.CallbackMetadata?.Item,
      'MpesaReceiptNumber'
    );

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + subscription.plan.durationMonths);

    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        startDate,
        endDate,
        mpesaReceipt: receipt ? String(receipt) : null
      }
    });
  } else {
    // Non-zero ResultCode covers cancellation (1032), insufficient funds
    // (1), timeout (1037), and other failure paths — all treated as FAILED.
    // ResultDesc has the human-readable reason if you want to surface it.
    await db.subscription.update({
      where: { id: subscription.id },
      data: { status: 'FAILED' }
    });
    console.log(
      `Subscription ${subscription.id} payment failed: ${callback.ResultDesc}`
    );
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
}
