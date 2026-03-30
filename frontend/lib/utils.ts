import {
  Microscope,
  Calculator,
  BookOpen,
  FlaskConical,
  Globe,
  Library,
  BookOpenText,
  type LucideIcon,
} from 'lucide-react';

export function cn(...classes: string[]) { return classes.filter(Boolean).join(' ') }

// ─── Subject Theme Mapping ───────────────────────────────────────────

export interface SubjectTheme {
  /** Background for icon containers, cards (e.g. 'bg-blue-50') */
  bg: string;
  /** Text color for icons and headings (e.g. 'text-blue-600') */
  text: string;
  /** Progress bar fill color (e.g. 'bg-blue-500') */
  progressFill: string;
  /** Left border accent for schedule blocks (e.g. 'border-l-blue-500') */
  borderL: string;
  /** Subtle border for cards/blocks (e.g. 'border-blue-100') */
  border: string;
  /** Darker text for schedule block headings (e.g. 'text-blue-800') */
  headingText: string;
  /** Badge background for grade pills (e.g. 'bg-blue-100') */
  badgeBg: string;
  /** Badge text for grade pills (e.g. 'text-blue-700') */
  badgeText: string;
}

const slateTheme: SubjectTheme = {
  bg: 'bg-slate-50',
  text: 'text-slate-600',
  progressFill: 'bg-slate-500',
  borderL: 'border-l-slate-500',
  border: 'border-slate-200',
  headingText: 'text-slate-900',
  badgeBg: 'bg-slate-100',
  badgeText: 'text-slate-700',
};

const purpleTheme: SubjectTheme = {
  bg: 'bg-purple-50',
  text: 'text-purple-600',
  progressFill: 'bg-purple-500',
  borderL: 'border-l-purple-500',
  border: 'border-purple-200',
  headingText: 'text-purple-900',
  badgeBg: 'bg-purple-100',
  badgeText: 'text-purple-700',
};

const emeraldTheme: SubjectTheme = {
  bg: 'bg-emerald-50',
  text: 'text-emerald-600',
  progressFill: 'bg-emerald-500',
  borderL: 'border-l-emerald-500',
  border: 'border-emerald-200',
  headingText: 'text-emerald-900',
  badgeBg: 'bg-emerald-100',
  badgeText: 'text-emerald-700',
};

const subjectThemeMap: Record<string, SubjectTheme> = {
  physics: emeraldTheme,
  chemistry: emeraldTheme,
  biology: emeraldTheme,
  'advanced math': purpleTheme,
  math: purpleTheme,
  art: purpleTheme,
  'english literature': slateTheme,
  'english lit': slateTheme,
  english: slateTheme,
  geography: slateTheme,
  history: slateTheme,
};

const defaultTheme: SubjectTheme = slateTheme;

/**
 * Returns a consistent Tailwind color theme for a given subject name.
 * Lookup is case-insensitive. Falls back to a neutral slate theme.
 */
export function getSubjectTheme(subject: string): SubjectTheme {
  return subjectThemeMap[subject.toLowerCase()] ?? defaultTheme;
}

// ─── Subject Icon Mapping ────────────────────────────────────────────

const subjectIconMap: Record<string, LucideIcon> = {
  physics: Microscope,
  'advanced math': Calculator,
  math: Calculator,
  'english literature': BookOpen,
  'english lit': BookOpen,
  english: BookOpen,
  chemistry: FlaskConical,
  geography: Globe,
  history: Library,
};

/**
 * Returns the appropriate Lucide icon for a given subject name.
 * Lookup is case-insensitive. Falls back to a generic book icon.
 */
export function getSubjectIcon(subject: string): LucideIcon {
  return subjectIconMap[subject.toLowerCase()] ?? BookOpenText;
}

// ─── Time Formatting ─────────────────────────────────────────────────

/**
 * Converts an ISO 8601 timestamp to a human-readable relative time string.
 * e.g. "just now", "5 mins ago", "2 hours ago", "Yesterday", "Last Week"
 */
export function formatTimeAgo(isoTimestamp: string): string {
  const now = Date.now();
  const then = new Date(isoTimestamp).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return 'just now';

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'Last Week';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return new Date(isoTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}