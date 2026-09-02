'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';

interface EducationLevelOption {
  id: string;
  name: string;
  curriculumName: string;
}

interface ContentTypeOption {
  id: string;
  name: string;
}

interface ReviewItem {
  fileName: string;
  fileUrl: string;
  fileType: 'pdf' | 'docx';
  subjectId: string;
  title: string;
}

interface SubjectOption {
  id: string;
  name: string;
}

export default function BulkUploadForm({
  educationLevels,
  contentTypes
}: {
  educationLevels: EducationLevelOption[];
  contentTypes: ContentTypeOption[];
}) {
  const [levelId, setLevelId] = useState(educationLevels[0]?.id ?? '');
  const [contentTypeId, setContentTypeId] = useState(contentTypes[0]?.id ?? '');
  const [term, setTerm] = useState('');
  const [year, setYear] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [phase, setPhase] = useState<
    'idle' | 'uploading-zip' | 'processing' | 'review' | 'saving' | 'done' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  async function handleUploadAndProcess() {
    setError(null);
    if (!file) {
      setError('Choose a zip file first.');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Please choose a .zip file.');
      return;
    }

    try {
      setPhase('uploading-zip');
      const blob = await upload(`bulk-uploads/${Date.now()}-${file.name}`, file, {
        access: 'private',
        handleUploadUrl: '/api/materials/blob-upload'
      });

      setPhase('processing');
      const res = await fetch('/api/materials/bulk-upload/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zipBlobUrl: blob.url,
          educationLevelId: levelId,
          contentTypeId
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Failed to process zip');

      setSubjects(data.subjects);
      setSkipped(data.skipped ?? []);
      setItems(
        data.results.map((r: any) => ({
          fileName: r.fileName,
          fileUrl: r.fileUrl,
          fileType: r.fileType,
          subjectId: r.suggestedSubjectId ?? '',
          title: r.suggestedTitle
        }))
      );
      setPhase('review');
    } catch (err) {
      setPhase('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  function updateItem(index: number, patch: Partial<ReviewItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  async function handleConfirm() {
    const unmatched = items.filter((it) => !it.subjectId);
    if (unmatched.length > 0) {
      setError(
        `${unmatched.length} file(s) still need a subject assigned before saving.`
      );
      return;
    }

    setError(null);
    setPhase('saving');

    const res = await fetch('/api/materials/bulk-upload/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((it) => ({
          subjectId: it.subjectId,
          contentTypeId,
          title: it.title,
          fileUrl: it.fileUrl,
          fileType: it.fileType,
          term: term || null,
          year: year || null
        }))
      })
    });
    const data = await res.json();

    if (!res.ok) {
      setPhase('error');
      setError(data.error ?? 'Failed to save materials');
      return;
    }

    setSavedCount(data.created);
    setPhase('done');
  }

  if (phase === 'done') {
    return (
      <div className="max-w-lg">
        <p className="text-sm text-board">
          {savedCount} material{savedCount !== 1 ? 's' : ''} saved successfully.
        </p>
        <button
          onClick={() => {
            setPhase('idle');
            setItems([]);
            setFile(null);
          }}
          className="mt-4 text-sm border-b border-ink/40 hover:border-gold"
        >
          Upload another batch
        </button>
      </div>
    );
  }

  if (phase === 'review') {
    return (
      <div>
        {skipped.length > 0 && (
          <p className="text-sm text-ink/50 mb-4">
            Skipped {skipped.length} non-document file(s): {skipped.join(', ')}
          </p>
        )}
        <p className="text-sm text-ink/60 mb-4">
          Review the subject match for each file, then save. Files without a confident
          match are left blank — pick one before confirming.
        </p>
        <div className="space-y-3 max-w-3xl">
          {items.map((item, i) => (
            <div
              key={item.fileUrl}
              className={`grid grid-cols-[1fr_auto] gap-3 items-center border-l-2 pl-3 py-1 ${
                item.subjectId ? 'border-board' : 'border-red-400'
              }`}
            >
              <div>
                <input
                  value={item.title}
                  onChange={(e) => updateItem(i, { title: e.target.value })}
                  className="w-full border-b border-ink/20 py-1 bg-transparent text-sm focus:border-gold outline-none"
                />
                <p className="text-xs text-ink/40 mt-1">{item.fileName}</p>
              </div>
              <select
                value={item.subjectId}
                onChange={(e) => updateItem(i, { subjectId: e.target.value })}
                className="border-b border-ink/20 py-1 bg-transparent text-sm focus:border-gold outline-none"
              >
                <option value="">— choose subject —</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        <button
          onClick={handleConfirm}
          disabled={phase === ('saving' as typeof phase)}
          className="mt-6 bg-gold hover:bg-gold-dark disabled:opacity-50 text-ink px-6 py-3 rounded-full"
        >
          {phase === ('saving' as typeof phase)
            ? 'Saving…'
            : `Save ${items.length} material${items.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <label className="text-sm text-ink/60" htmlFor="level">
          Education level
        </label>
        <select
          id="level"
          value={levelId}
          onChange={(e) => setLevelId(e.target.value)}
          className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none"
        >
          {educationLevels.map((lvl) => (
            <option key={lvl.id} value={lvl.id}>
              {lvl.curriculumName} — {lvl.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-ink/60" htmlFor="bulk-content-type">
          Content type (applies to every file in this batch)
        </label>
        <select
          id="bulk-content-type"
          value={contentTypeId}
          onChange={(e) => setContentTypeId(e.target.value)}
          className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none"
        >
          {contentTypes.map((ct) => (
            <option key={ct.id} value={ct.id}>
              {ct.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-ink/60" htmlFor="bulk-term">
            Term (optional)
          </label>
          <input
            id="bulk-term"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Term 1"
            className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-ink/60" htmlFor="bulk-year">
            Year (optional)
          </label>
          <input
            id="bulk-year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2026"
            className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-ink/60" htmlFor="zip-file">
          Zip file
        </label>
        <input
          id="zip-file"
          type="file"
          accept=".zip"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full py-2 text-sm"
        />
        <p className="text-xs text-ink/40 mt-1">
          Organize files inside folders named after each subject for the most accurate
          matching (e.g. "Business Studies/paper1.docx").
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {phase === 'uploading-zip' && (
        <p className="text-sm text-board">Uploading zip…</p>
      )}
      {phase === 'processing' && (
        <p className="text-sm text-board">Extracting and matching files…</p>
      )}

      <button
        onClick={handleUploadAndProcess}
        disabled={phase === 'uploading-zip' || phase === 'processing'}
        className="bg-gold hover:bg-gold-dark disabled:opacity-50 text-ink px-6 py-3 rounded-full"
      >
        {phase === 'uploading-zip' || phase === 'processing'
          ? 'Please wait…'
          : 'Upload and process'}
      </button>
    </div>
  );
}
