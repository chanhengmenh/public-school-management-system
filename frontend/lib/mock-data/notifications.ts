import type { Notification } from '@/types/school.types';

// ─── Notifications ───────────────────────────────────────────────────
// Source: app/student/notifications/page.tsx
// Timestamps converted from relative strings to ISO 8601

export const mockNotifications: Notification[] = [
  {
    id: 1,
    recipientId: 'PUBLIC',
    title: 'Mid-Term Exams Update',
    message:
      'The schedule for the upcoming mid-term exams has been updated. Please review the new timetable in the Schedule tab.',
    sender: 'System',
    timestamp: '2026-03-28T10:00:00Z',
    iconType: 'announcement',
    isRead: false,
  },
  {
    id: 2,
    recipientId: 'alex_id',
    title: 'New Assignment: Lab Report',
    message:
      'Mr. Tan Wei has posted a new assignment for Physics: Refraction Lab Report. Due in 3 days.',
    sender: 'Mr. Tan Wei',
    timestamp: '2026-03-28T08:10:00Z',
    iconType: 'assignment',
    isRead: false,
  },
  {
    id: 3,
    recipientId: 'PUBLIC',
    title: 'Location Changed',
    message:
      'Advanced Math class on Wednesday has been moved to Room 201 at 10:00 AM.',
    sender: 'Ms. Nurul Huda',
    timestamp: '2026-03-27T14:00:00Z',
    iconType: 'alert',
    isRead: false,
  },
  {
    id: 4,
    recipientId: 'alex_id',
    title: 'Grade Posted',
    message:
      'Your grade for "Chapter 3 Quiz" has been posted. You scored 94/100.',
    sender: 'System',
    timestamp: '2026-03-27T09:30:00Z',
    iconType: 'grade',
    isRead: false,
  },
  {
    id: 5,
    recipientId: 'PUBLIC',
    title: 'Welcome to the New Term',
    message:
      'Welcome back to the new academic year! Make sure to set up your profile and check your enrolled classes.',
    sender: 'System',
    timestamp: '2026-03-21T09:00:00Z',
    iconType: 'general',
    isRead: true,
  },
  {
    id: 6,
    recipientId: 'sarah_id',
    title: 'Library Books Due Reminder',
    message:
      'Please return your Art History book by Friday to avoid late fees. - Librarian',
    sender: 'Librarian',
    timestamp: '2026-03-21T11:00:00Z',
    iconType: 'alert',
    isRead: true,
  },
];
