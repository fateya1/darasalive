'use client';

import { useMemo, useState } from 'react';

interface MaterialItem {
  id: string;
  title: string;
  term: string | null;
  year: string | null;
  subjectName: string;
  levelName: string;
}

export default function MaterialsByTypeBrowser({
  materials
}: {
  materials: MaterialItem[];
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return materials;
    return materials.filter(
      (m) =>
        m.title.toLowerCase().includes(q) || m.subjectName.toLowerCase().includes(q)
    );
  }, [materials, query]);

  const grouped = useMemo(
    () =>
      filtered.reduce<Record<string, MaterialItem[]>>((acc, m) => {
        const key = `${m.subjectName} — ${m.levelName}`;
        acc[key] = acc[key] ? [...acc[key], m] : [m];
        return acc;
      }, {}),
    [filtered]
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search by title or subject…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none text-sm mb-8"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-ink/60">No materials match your search.</p>
      ) : (
        Object.entries(grouped).map(([groupLabel, items]) => (
          <section key={groupLabel} className="mb-10">
            <h2 className="font-display text-lg mb-4 border-b border-board/10 pb-2">
              {groupLabel}
            </h2>
            <div className="divide-y divide-board/10">
              {items.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p>{m.title}</p>
                    <p className="text-ink/50 mt-1">
                      {m.term ? `${m.term} ` : ''}
                      {m.year ?? ''}
                    </p>
                  </div>
                  <a
                    href={`/api/materials/${m.id}/download`}
                    className="border-b border-ink/40 hover:border-gold"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
