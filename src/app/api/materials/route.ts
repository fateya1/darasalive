import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// GET /api/materials?subjectId=...&contentTypeId=...
// Phase 2: add a subscription-status check before returning fileUrl —
// active subscribers get the real Blob URL, everyone else gets a locked flag.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get('subjectId') ?? undefined;
  const contentTypeId = searchParams.get('contentTypeId') ?? undefined;

  const materials = await db.material.findMany({
    where: { subjectId, contentTypeId },
    orderBy: { uploadedAt: 'desc' }
  });

  return NextResponse.json(materials);
}

// POST /api/materials
// Body: { subjectId, contentTypeId, title, fileUrl, fileType, term?, year? }
// Restricted to admins — called after a successful Blob upload to record
// the material's metadata against the uploaded file.
export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const data = await req.json();

  const material = await db.material.create({ data });

  return NextResponse.json(material, { status: 201 });
}
