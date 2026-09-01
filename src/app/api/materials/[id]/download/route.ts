import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// GET /api/materials/[id]/download
// Streams a private Blob file through this Function after checking the
// requester is logged in. This is what makes private storage meaningful —
// the file is never reachable by a bare URL, only through this checkpoint.
//
// TODO: once subscription-gated access matters (not just "logged in"),
// check the user's active Subscription status here too, not just session.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const material = await db.material.findUnique({ where: { id: params.id } });
  if (!material) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const result = await get(material.fileUrl, { access: 'private' });

  if (!result || result.statusCode !== 200 || !result.stream) {
    return NextResponse.json({ error: 'File not found in storage' }, { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${material.title}.${material.fileType}"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store'
    }
  });
}
