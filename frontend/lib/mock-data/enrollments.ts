import type { EnrollmentData } from '@/types/school.types';

// ─── Enrollments & Subject Materials ────────────────────────────────
// Dynamically routes users (alex_id vs sarah_id) to their specific material views.

export const MOCK_ENROLLMENTS_DB: Record<string, EnrollmentData> = {
  // ── ALEX (Grade 11 Science) ──

  'alex_id-physics': {
    userId: 'alex_id',
    subjectId: 'physics',
    subjectName: 'Physics',
    teacher: 'Mr. Tan Wei',
    weeks: [
      {
        title: 'Week 9 — Latest',
        items: [
          { id: 1, title: 'Chapter 9: Refraction Concepts', type: 'Lecture Notes · PDF', size: '2.4 MB', iconName: 'FileText', color: 'text-blue-500', bg: 'bg-blue-50' },
          { id: 2, title: 'Refraction Lab Safety', type: 'Spreadsheet · XLSX', size: '140 KB', iconName: 'FileSpreadsheet', color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ],
      },
      {
        title: 'Week 8',
        items: [
          { id: 3, title: 'Chapter 8: Waves', type: 'Lecture Notes · PDF', size: '1.8 MB', iconName: 'FileText', color: 'text-blue-500', bg: 'bg-blue-50' },
          { id: 4, title: 'Wave Interference Slides', type: 'Presentation · PPTX', size: '5.1 MB', iconName: 'Presentation', color: 'text-orange-500', bg: 'bg-orange-50' },
        ],
      },
    ],
  },

  'alex_id-advanced-math': {
    userId: 'alex_id',
    subjectId: 'advanced-math',
    subjectName: 'Advanced Math',
    teacher: 'Ms. Nurul Huda',
    weeks: [
      {
        title: 'Week 9 — Latest',
        items: [
          { id: 5, title: 'Calculus IV: Integrals', type: 'Lecture Notes · PDF', size: '3.1 MB', iconName: 'FileText', color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { id: 6, title: 'Integration Formulas', type: 'Spreadsheet · XLSX', size: '50 KB', iconName: 'FileSpreadsheet', color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ],
      },
    ],
  },


  // ── SARAH (Grade 10 Arts) ──

  'sarah_id-history': {
    userId: 'sarah_id',
    subjectId: 'history',
    subjectName: 'History',
    teacher: 'Mrs. Davis',
    weeks: [
      {
        title: 'Week 4 — Latest',
        items: [
          { id: 101, title: 'The Industrial Revolution', type: 'Lecture Notes · PDF', size: '4.2 MB', iconName: 'FileText', color: 'text-red-500', bg: 'bg-red-50' },
          { id: 102, title: 'Economic Impact Charts', type: 'Spreadsheet · CSV', size: '300 KB', iconName: 'FileSpreadsheet', color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ],
      },
      {
        title: 'Week 3',
        items: [
          { id: 103, title: 'French Revolution Timeline', type: 'Presentation · PPTX', size: '8.4 MB', iconName: 'Presentation', color: 'text-amber-500', bg: 'bg-amber-50' },
        ],
      },
    ],
  },

  'sarah_id-art': {
    userId: 'sarah_id',
    subjectId: 'art',
    subjectName: 'Art',
    teacher: 'Mr. Ross',
    weeks: [
      {
        title: 'Term Project',
        items: [
          { id: 104, title: 'Portfolio Submission Guidelines', type: 'Document · PDF', size: '1.2 MB', iconName: 'FileText', color: 'text-purple-500', bg: 'bg-purple-50' },
          { id: 105, title: 'Gallery References', type: 'Gallery Archive · ZIP', size: '45.0 MB', iconName: 'Presentation', color: 'text-pink-500', bg: 'bg-pink-50' },
        ],
      },
    ],
  },

};

export function getEnrollmentData(userId: string, subjectId: string): EnrollmentData | null {
  const key = `${userId}-${subjectId}`;
  return MOCK_ENROLLMENTS_DB[key] || null;
}
