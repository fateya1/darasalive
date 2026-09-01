import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// DELETE /api/materials/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionUser();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const material = await db.material.findUnique({ where: { id: params.id } });
  if (!material) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Remove the underlying file first, then the database record — if the
  // Blob delete fails, we'd rather keep the DB row (so it's retryable)
  // than end up with an orphaned file and no record of it.
  try {
    await del(material.fileUrl);
  } catch (err) {
    console.error('Failed to delete blob, proceeding to delete DB record anyway:', err);
  }

  await db.material.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
