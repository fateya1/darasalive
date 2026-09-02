'use client';

import { useState } from 'react';
import MaterialUploadForm from './MaterialUploadForm';
import BulkUploadForm from './BulkUploadForm';

interface Subject {
  id: string;
  name: string;
  educationLevel: { name: string; curriculum: { name: string } };
}

interface ContentType {
  id: string;
  name: string;
}

interface EducationLevelOption {
  id: string;
  name: string;
  curriculumName: string;
}

export default function UploadTabs({
  subjects,
  contentTypes,
  educationLevels
}: {
  subjects: Subject[];
  contentTypes: ContentType[];
  educationLevels: EducationLevelOption[];
}) {
  const [tab, setTab] = useState<'single' | 'bulk'>('single');

  return (
    <div>
      <div className="flex gap-6 mb-8 text-sm border-b border-board/10">
        <button
          onClick={() => setTab('single')}
          className={`pb-3 -mb-px border-b-2 ${
            tab === 'single' ? 'border-gold' : 'border-transparent text-ink/50'
          }`}
        >
          Single file
        </button>
        <button
          onClick={() => setTab('bulk')}
          className={`pb-3 -mb-px border-b-2 ${
            tab === 'bulk' ? 'border-gold' : 'border-transparent text-ink/50'
          }`}
        >
          Bulk upload (zip)
        </button>
      </div>

      {tab === 'single' ? (
        <MaterialUploadForm subjects={subjects} contentTypes={contentTypes} />
      ) : (
        <BulkUploadForm educationLevels={educationLevels} contentTypes={contentTypes} />
      )}
    </div>
  );
}
