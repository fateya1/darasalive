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
  { bg: string; text: string; border: string }
> = {
  gold: { bg: 'bg-gold/10', text: 'text-gold-dark', border: 'group-hover:border-gold' },
  sage: { bg: 'bg-sage/10', text: 'text-sage', border: 'group-hover:border-sage' },
  sky: { bg: 'bg-sky/10', text: 'text-sky', border: 'group-hover:border-sky' },
  terracotta: {
    bg: 'bg-terracotta/10',
    text: 'text-terracotta',
    border: 'group-hover:border-terracotta'
  },
  plum: { bg: 'bg-plum/10', text: 'text-plum', border: 'group-hover:border-plum' },
  teal: { bg: 'bg-teal/10', text: 'text-teal', border: 'group-hover:border-teal' }
};
