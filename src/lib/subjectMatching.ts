function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

interface SubjectOption {
  id: string;
  name: string;
}

/**
 * Tries to match a zip entry to one of the given subjects, checking the
 * entry's immediate parent folder first (organized zips are often
 * structured as "Subject Name/file.docx"), then falling back to the
 * filename itself. Prefers longer subject-name matches to avoid a short
 * name (e.g. "Art") wrongly matching inside a longer, more specific one.
 */
export function matchSubject(
  entryPath: string,
  subjects: SubjectOption[]
): SubjectOption | null {
  const segments = entryPath.split('/').filter(Boolean);
  const fileName = segments[segments.length - 1] ?? '';
  const parentFolder = segments.length > 1 ? segments[segments.length - 2] : '';

  const candidates = [...subjects].sort((a, b) => b.name.length - a.name.length);

  if (parentFolder) {
    const normalizedParent = normalize(parentFolder);
    const exact = candidates.find((s) => normalize(s.name) === normalizedParent);
    if (exact) return exact;
  }

  const normalizedFile = normalize(fileName);
  const inFile = candidates.find((s) => normalizedFile.includes(normalize(s.name)));
  if (inFile) return inFile;

  if (parentFolder) {
    const normalizedParent = normalize(parentFolder);
    const inFolder = candidates.find((s) => normalizedParent.includes(normalize(s.name)));
    if (inFolder) return inFolder;
  }

  return null;
}

export function titleFromFileName(fileName: string) {
  return fileName
    .replace(/\.(pdf|docx?|PDF|DOCX?)$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function fileTypeFromName(fileName: string): 'pdf' | 'docx' | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'docx';
  return null;
}

export function mimeTypeFor(fileType: 'pdf' | 'docx') {
  return fileType === 'pdf'
    ? 'application/pdf'
    : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
}
