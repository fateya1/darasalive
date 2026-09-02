import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { get, put } from '@vercel/blob';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import {
  matchSubject,
  titleFromFileName,
  fileTypeFromName,
  mimeTypeFor
} from '@/lib/subjectMatching';

// POST /api/materials/bulk-upload/process
// Body: { zipBlobUrl: string, educationLevelId: string, contentTypeId: string }
//
// Extracts the zip, tries to match each contained file to a subject in the
// given education level, and re-uploads every file individually to its own
// private Blob path. Returns suggestions for the admin to review — nothing
// is written to the Material table yet, that happens in /confirm.
export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { zipBlobUrl, educationLevelId, contentTypeId } = await req.json();

  if (!zipBlobUrl || !educationLevelId || !contentTypeId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const subjects = await db.subject.findMany({
    where: { educationLevelId },
    select: { id: true, name: true }
  });

  if (subjects.length === 0) {
    return NextResponse.json(
      { error: 'No subjects found for that education level' },
      { status: 400 }
    );
  }

  // Fetch the uploaded zip back from Blob storage.
  const zipBlob = await get(zipBlobUrl, { access: 'private' });
  if (!zipBlob?.stream) {
    return NextResponse.json({ error: 'Could not read uploaded zip' }, { status: 500 });
  }

  const chunks: Uint8Array[] = [];
  const reader = zipBlob.stream.getReader();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const zipBuffer = Buffer.concat(chunks);

  const zip = await JSZip.loadAsync(zipBuffer);

  const results: Array<{
    fileName: string;
    fileUrl: string;
    fileType: 'pdf' | 'docx';
    suggestedSubjectId: string | null;
    suggestedSubjectName: string | null;
    suggestedTitle: string;
  }> = [];

  const skipped: string[] = [];

  for (const [entryPath, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;

    const fileName = entryPath.split('/').pop() ?? entryPath;
    const fileType = fileTypeFromName(fileName);

    if (!fileType) {
      skipped.push(fileName);
      continue;
    }

    const buffer = await entry.async('nodebuffer');
    const match = matchSubject(entryPath, subjects);

    const blob = await put(
      `materials/bulk/${Date.now()}-${fileName}`,
      buffer,
      {
        access: 'private',
        contentType: mimeTypeFor(fileType),
        addRandomSuffix: true
      }
    );

    results.push({
      fileName,
      fileUrl: blob.url,
      fileType,
      suggestedSubjectId: match?.id ?? null,
      suggestedSubjectName: match?.name ?? null,
      suggestedTitle: titleFromFileName(fileName)
    });
  }

  return NextResponse.json({
    contentTypeId,
    subjects,
    results,
    skipped
  });
}
