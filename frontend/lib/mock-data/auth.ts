export interface MockUser {
  id: string;
  email: string;
  password?: string;
  role: 'admin' | 'teacher' | 'student';
  subRole: string;
  name: string;
}

export const MOCK_DB: MockUser[] = [
  {
    id: 'admin_001',
    email: 'admin@iams.local',
    password: 'password123',
    role: 'admin',
    subRole: 'normal',
    name: 'System Admin'
  },
  {
    id: 'teacher_001',
    email: 'teacher@iams.local',
    password: 'password123',
    role: 'teacher',
    subRole: 'normal',
    name: 'Mr. Tan Wei'
  },
  {
    id: 'teacher_002',
    email: 'hometeacher@iams.local',
    password: 'password123',
    role: 'teacher',
    subRole: 'home_teacher',
    name: 'Ms. Jean'
  },
  {
    id: 'alex_id',
    email: 'student@iams.local',
    password: 'password123',
    role: 'student',
    subRole: 'normal',
    name: 'Alex Johnson'
  },
  {
    id: 'sarah_id',
    email: 'monitor@iams.local',
    password: 'password123',
    role: 'student',
    subRole: 'monitor',
    name: 'Sarah Wilson'
  }
];

export async function authenticateUser(email: string, password?: string): Promise<Omit<MockUser, 'password'> | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  const user = MOCK_DB.find(u => u.email === email && u.password === password);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
}
