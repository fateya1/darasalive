import {
  NotebookPen,
  ClipboardList,
  Target,
  CheckSquare,
  Presentation,
  CalendarRange,
  Award,
  FileText
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ContentTypeStyle {
  icon: LucideIcon;
  color: 'gold' | 'sage' | 'sky' | 'terracotta' | 'plum' | 'teal';
}

const STYLE_BY_NAME: Record<string, ContentTypeStyle> = {
  Notes: { icon: NotebookPen, color: 'sky' },
  Exams: { icon: ClipboardList, color: 'terracotta' },
  'Termly Exams': { icon: ClipboardList, color: 'plum' },
  Mocks: { icon: Target, color: 'gold' },
  'Marking Scheme': { icon: CheckSquare, color: 'sage' },
  'Lesson Plan': { icon: Presentation, color: 'teal' },
  'Scheme of Work': { icon: CalendarRange, color: 'sky' },
  'CBE Assessment': { icon: Award, color: 'terracotta' }
};

const FALLBACK_COLORS: ContentTypeStyle['color'][] = [
  'gold',
  'sage',
  'sky',
  'terracotta',
  'plum',
  'teal'
];

export function getContentTypeStyle(name: string, index: number): ContentTypeStyle {
  return (
    STYLE_BY_NAME[name] ?? {
      icon: FileText,
      color: FALLBACK_COLORS[index % FALLBACK_COLORS.length]
    }
  );
}

export const COLOR_CLASSES: Record<
  ContentTypeStyle['color'],
  { bg: string; text: string; border: string; stripe: string }
> = {
  gold: {
    bg: 'bg-gold',
    text: 'text-white',
    border: 'group-hover:border-gold',
    stripe: 'bg-gold'
  },
  sage: {
    bg: 'bg-sage',
    text: 'text-white',
    border: 'group-hover:border-sage',
    stripe: 'bg-sage'
  },
  sky: {
    bg: 'bg-sky',
    text: 'text-white',
    border: 'group-hover:border-sky',
    stripe: 'bg-sky'
  },
  terracotta: {
    bg: 'bg-terracotta',
    text: 'text-white',
    border: 'group-hover:border-terracotta',
    stripe: 'bg-terracotta'
  },
  plum: {
    bg: 'bg-plum',
    text: 'text-white',
    border: 'group-hover:border-plum',
    stripe: 'bg-plum'
  },
  teal: {
    bg: 'bg-teal',
    text: 'text-white',
    border: 'group-hover:border-teal',
    stripe: 'bg-teal'
  }
};
