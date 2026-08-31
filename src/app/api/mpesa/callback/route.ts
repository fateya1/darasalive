import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/mpesa/callback
// Safaricom calls this URL after the customer completes (or cancels/fails) the
// STK push prompt on their phone. Must respond fast — see Phase 1 notes on
// Vercel function timeouts.
//
// Phase 2 implementation sketch:
// 1. Parse body.Body.stkCallback — contains ResultCode, CheckoutRequestID,
//    and (on success) CallbackMetadata with the M-Pesa receipt number.
// 2. Find the Subscription by checkoutRequestId.
// 3. If ResultCode === 0: set status ACTIVE, startDate = now, endDate based on
//    plan.durationMonths, mpesaReceipt = receipt from metadata.
// 4. Else: set status FAILED.
// 5. Always return 200 with { ResultCode: 0 } quickly — Safaricom retries on
//    non-200 responses.
export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('M-Pesa callback received:', JSON.stringify(body));

  // TODO Phase 2: implement the logic described above using `db`.

  return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
}
