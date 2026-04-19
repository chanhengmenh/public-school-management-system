export enum UserRole {
  admin = "admin",
  teacher = "teacher",
  student = "student",
}

export enum UserGender {
  male = "male",
  female = "female",
  other = "other",
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  gender?: UserGender | null;
  is_active: boolean;
  is_home_teacher: boolean;
  is_class_monitor: boolean;
  must_change_password: boolean;
  created_at: string;
}

export interface UserCreate {
  email: string;
  full_name: string;
  password?: string;
  role: UserRole;
  gender?: UserGender | null;
  is_home_teacher?: boolean;
  is_class_monitor?: boolean;
}

export interface UserUpdate {
  full_name?: string;
  email?: string;
  role?: UserRole;
  gender?: UserGender | null;
  is_active?: boolean;
  is_home_teacher?: boolean;
  is_class_monitor?: boolean;
  password?: string;
}
