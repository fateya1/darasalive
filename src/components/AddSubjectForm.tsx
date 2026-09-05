'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EducationLevelOption {
  id: string;
  name: string;
  curriculumName: string;
}

export default function AddSubjectForm({
  educationLevels
}: {
  educationLevels: EducationLevelOption[];
}) {
  const router = useRouter();
  const [levelId, setLevelId] = useState(educationLevels[0]?.id ?? '');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setStatus('saving');
    setError(null);

    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ educationLevelId: levelId, name })
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus('error');
      setError(data.error ?? 'Something went wrong');
      return;
    }

    setStatus('done');
    setName('');
    router.refresh();
    setTimeout(() => setStatus('idle'), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
      <select
        value={levelId}
        onChange={(e) => setLevelId(e.target.value)}
        className="border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none text-sm sm:w-64"
      >
        {educationLevels.map((lvl) => (
          <option key={lvl.id} value={lvl.id}>
            {lvl.curriculumName} — {lvl.name}
          </option>
        ))}
      </select>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Subject name, e.g. Home Science"
        className="flex-1 border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none text-sm"
      />
      <button
        type="submit"
        disabled={status === 'saving'}
        className="bg-gold hover:bg-gold-dark disabled:opacity-50 text-ink px-5 py-2 rounded-full text-sm whitespace-nowrap"
      >
        {status === 'saving' ? 'Adding…' : 'Add subject'}
      </button>
      {status === 'done' && <span className="text-sm text-sage self-center">Added.</span>}
      {error && <span className="text-sm text-red-600 self-center">{error}</span>}
    </form>
  );
}
