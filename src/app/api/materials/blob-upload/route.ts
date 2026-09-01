import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getSessionUser } from '@/lib/auth';

const ALLOWED_CONTENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// POST /api/materials/blob-upload
// Called by @vercel/blob/client's upload() before the browser sends the
// actual file — this issues a short-lived client token scoped to one
// pathname, so the file itself never passes through our function.
// Requires BLOB_READ_WRITE_TOKEN in the environment (read automatically
// from process.env by the SDK — no need to pass it explicitly).
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await getSessionUser();
        if (!session || session.role !== 'ADMIN') {
          throw new Error('Not authorized');
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          addRandomSuffix: true,
          maximumSizeInBytes: 25 * 1024 * 1024 // 25MB
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Metadata is saved separately by the client via POST /api/materials
        // once upload() resolves, so nothing needed here — this callback
        // exists mainly for logging/auditing if useful later.
        console.log('Blob upload completed:', blob.url);
      }
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: (err as Error).message ?? 'Upload token request failed' },
      { status: 401 }
    );
  }
}
