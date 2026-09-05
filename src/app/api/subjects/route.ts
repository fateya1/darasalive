import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

const schema = z.object({
  educationLevelId: z.string().min(1),
  name: z.string().min(2, 'Subject name is too short')
});

// POST /api/subjects
// Admin-only. Lets the admin add a subject to an education level directly,
// without needing a developer/SQL to unblock the upload dropdowns.
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

  const { educationLevelId, name } = parsed.data;

  const existing = await db.subject.findFirst({
    where: { educationLevelId, name: { equals: name.trim(), mode: 'insensitive' } }
  });
  if (existing) {
    return NextResponse.json(
      { error: 'That subject already exists for this level' },
      { status: 409 }
    );
  }

  const subject = await db.subject.create({
    data: { educationLevelId, name: name.trim() }
  });

  return NextResponse.json(subject, { status: 201 });
}
