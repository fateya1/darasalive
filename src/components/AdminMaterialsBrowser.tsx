'use client';

import { useMemo, useState } from 'react';
import DeleteMaterialButton from './DeleteMaterialButton';

interface AdminMaterialItem {
  id: string;
  title: string;
  term: string | null;
  year: string | null;
  subjectName: string;
  contentTypeName: string;
}

export default function AdminMaterialsBrowser({
  materials
}: {
  materials: AdminMaterialItem[];
}) {
  const [query, setQuery] = useState('');
  const [contentType, setContentType] = useState('all');

  const contentTypes = useMemo(
    () => Array.from(new Set(materials.map((m) => m.contentTypeName))).sort(),
    [materials]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((m) => {
      const matchesQuery =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.subjectName.toLowerCase().includes(q);
      const matchesType = contentType === 'all' || m.contentTypeName === contentType;
      return matchesQuery && matchesType;
    });
  }, [materials, query, contentType]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title or subject…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none text-sm"
        />
        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          className="border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none text-sm"
        >
          <option value="all">All types</option>
          {contentTypes.map((ct) => (
            <option key={ct} value={ct}>
              {ct}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink/60">No materials match your search.</p>
      ) : (
        <div className="divide-y divide-board/10">
          {filtered.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-4 text-sm">
              <div>
                <p className="font-medium">{m.title}</p>
                <p className="text-ink/50 mt-1">
                  {m.subjectName} · {m.contentTypeName}
                  {m.term ? ` · ${m.term}` : ''}
                  {m.year ? ` · ${m.year}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href={`/api/materials/${m.id}/download`}
                  className="border-b border-ink/40 hover:border-gold"
                >
                  Download
                </a>
                <DeleteMaterialButton materialId={m.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
