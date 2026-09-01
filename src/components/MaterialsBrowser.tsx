'use client';

import { useMemo, useState } from 'react';

interface MaterialItem {
  id: string;
  title: string;
  term: string | null;
  year: string | null;
  contentTypeName: string;
}

export default function MaterialsBrowser({ materials }: { materials: MaterialItem[] }) {
  const [query, setQuery] = useState('');
  const [contentType, setContentType] = useState('all');

  const contentTypes = useMemo(
    () => Array.from(new Set(materials.map((m) => m.contentTypeName))).sort(),
    [materials]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((m) => {
      const matchesQuery = !q || m.title.toLowerCase().includes(q);
      const matchesType = contentType === 'all' || m.contentTypeName === contentType;
      return matchesQuery && matchesType;
    });
  }, [materials, query, contentType]);

  const grouped = useMemo(
    () =>
      filtered.reduce<Record<string, MaterialItem[]>>((acc, m) => {
        acc[m.contentTypeName] = acc[m.contentTypeName]
          ? [...acc[m.contentTypeName], m]
          : [m];
        return acc;
      }, {}),
    [filtered]
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search materials…"
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
        Object.entries(grouped).map(([contentTypeName, items]) => (
          <section key={contentTypeName} className="mb-10">
            <h2 className="font-display text-lg mb-4 border-b border-board/10 pb-2">
              {contentTypeName}
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
