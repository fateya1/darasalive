import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

const itemSchema = z.object({
  subjectId: z.string().min(1),
  contentTypeId: z.string().min(1),
  title: z.string().min(1),
  fileUrl: z.string().min(1),
  fileType: z.enum(['pdf', 'docx']),
  term: z.string().optional().nullable(),
  year: z.string().optional().nullable()
});

const schema = z.object({ items: z.array(itemSchema).min(1) });

// POST /api/materials/bulk-upload/confirm
// Body: { items: [...] } — the reviewed and admin-corrected batch from
// /process. Creates one Material row per item in a single transaction.
export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const created = await db.$transaction(
    parsed.data.items.map((item) =>
      db.material.create({
        data: {
          subjectId: item.subjectId,
          contentTypeId: item.contentTypeId,
          title: item.title,
          fileUrl: item.fileUrl,
          fileType: item.fileType,
          term: item.term || null,
          year: item.year || null
        }
      })
    )
  );

  return NextResponse.json({ created: created.length });
}
