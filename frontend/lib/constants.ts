export const APP_NAME = 'LMS Frontend';

export const ROLES = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
} as const;

export const SUB_ROLES = {
    NORMAL: 'normal',
    MONITOR: 'class_monitor',
    HOMEROOM: 'homeroom_teacher',
} as const;

export const ROLE_REDIRECTS = {
    [ROLES.ADMIN]: '/admin',
    [ROLES.TEACHER]: '/teacher',
    [ROLES.STUDENT]: '/student',
};