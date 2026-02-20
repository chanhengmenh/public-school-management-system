export type Role = 'admin' | 'teacher' | 'student' | 'parent' | 'monitor' | 'home-class-teacher';

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}
