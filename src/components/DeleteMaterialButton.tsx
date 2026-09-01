'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteMaterialButton({ materialId }: { materialId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this material? This cannot be undone.')) return;
    setLoading(true);
    await fetch(`/api/materials/${materialId}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  );
}
