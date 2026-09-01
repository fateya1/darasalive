import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/subscriptions/[id]/status
// Polled by the register page after STK push to find out whether the
// customer completed, cancelled, or failed the M-Pesa prompt.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const subscription = await db.subscription.findUnique({
    where: { id: params.id },
    select: { status: true }
  });

  if (!subscription) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ status: subscription.status });
}
