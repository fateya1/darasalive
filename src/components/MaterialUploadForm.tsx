'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';

interface Subject {
  id: string;
  name: string;
  educationLevel: { name: string; curriculum: { name: string } };
}

interface ContentType {
  id: string;
  name: string;
}

export default function MaterialUploadForm({
  subjects,
  contentTypes
}: {
  subjects: Subject[];
  contentTypes: ContentType[];
}) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [contentTypeId, setContentTypeId] = useState(contentTypes[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [term, setTerm] = useState('');
  const [year, setYear] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [status, setStatus] = useState<'idle' | 'uploading' | 'saving' | 'done' | 'error'>(
    'idle'
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Choose a file first.');
      return;
    }
    if (!subjectId || !contentTypeId || !title.trim()) {
      setError('Subject, content type, and title are required.');
      return;
    }

    try {
      setStatus('uploading');

      // Uploads straight to Blob storage — the file never passes through
      // our serverless function, so there's no 4.5MB body-size limit here.
      const blob = await upload(
        `materials/${subjectId}/${contentTypeId}/${Date.now()}-${file.name}`,
        file,
        {
          access: 'public',
          handleUploadUrl: '/api/materials/blob-upload'
        }
      );

      setStatus('saving');

      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          contentTypeId,
          title: title.trim(),
          fileUrl: blob.url,
          fileType: file.name.endsWith('.pdf') ? 'pdf' : 'docx',
          term: term || null,
          year: year || null
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to save material');
      }

      setStatus('done');
      setTitle('');
      setTerm('');
      setYear('');
      setFile(null);
      (document.getElementById('material-file') as HTMLInputElement | null)?.value &&
        ((document.getElementById('material-file') as HTMLInputElement).value = '');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  }

  const grouped = subjects.reduce<Record<string, Subject[]>>((acc, s) => {
    const key = `${s.educationLevel.curriculum.name} — ${s.educationLevel.name}`;
    acc[key] = acc[key] ? [...acc[key], s] : [s];
    return acc;
  }, {});

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="text-sm text-ink/60" htmlFor="subject">
          Subject
        </label>
        <select
          id="subject"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none"
        >
          {Object.entries(grouped).map(([levelLabel, subs]) => (
            <optgroup key={levelLabel} label={levelLabel}>
              {subs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-ink/60" htmlFor="contentType">
          Content type
        </label>
        <select
          id="contentType"
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

      <div>
        <label className="text-sm text-ink/60" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Photosynthesis — Full Notes"
          className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-ink/60" htmlFor="term">
            Term (optional)
          </label>
          <input
            id="term"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Term 1"
            className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-ink/60" htmlFor="year">
            Year (optional)
          </label>
          <input
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2026"
            className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-ink/60" htmlFor="material-file">
          File (PDF or Word)
        </label>
        <input
          id="material-file"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {status === 'uploading' && (
        <p className="text-sm text-board">Uploading file…</p>
      )}
      {status === 'saving' && <p className="text-sm text-board">Saving material…</p>}
      {status === 'done' && (
        <p className="text-sm text-board">Material uploaded successfully.</p>
      )}

      <button
        type="submit"
        disabled={status === 'uploading' || status === 'saving'}
        className="bg-gold hover:bg-gold-dark disabled:opacity-50 text-ink px-6 py-3 rounded-full"
      >
        {status === 'uploading' || status === 'saving' ? 'Please wait…' : 'Upload material'}
      </button>
    </form>
  );
}
