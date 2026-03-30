import { mockClass10A } from './home-class';

export interface StudentContactProfile {
  id: string;
  studentId: string;
  name: string;
  avatar?: string;
  gender: 'Boy' | 'Girl';
  dob: string;
  parentName: string;
  phone: string;
  email: string;
}

export const generateMockPeople = (): StudentContactProfile[] => {
  const firstNamesM = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles'];
  const firstNamesF = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'];

  return mockClass10A.map((student, idx) => {
    // Generate demographic data deterministically based on index
    const isMale = idx % 2 === 0;
    const gender = isMale ? 'Boy' : 'Girl';
    
    // Year around 15-16 years old for Grade 10 (born ~2010 - 2011)
    const year = 2010 + (idx % 2);
    const month = (idx % 12) + 1;
    const day = (idx % 28) + 1;
    const dob = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Parent Name synced with student last name
    const nameParts = student.name.split(' ');
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Smith';
    const pFirst = isMale ? firstNamesF[(idx + 1) % 10] : firstNamesM[(idx + 1) % 10]; // Mother for boy, Father for girl pattern
    const parentName = `${pFirst} ${lastName}`;

    // Contact Logic
    const phone = `(555) 01${idx.toString().padStart(2, '0')}-${(idx*11).toString().padStart(4, '0')}`;
    const email = `${pFirst.toLowerCase()}.${lastName.toLowerCase()}@email.mock`;

    return {
      id: student.id,
      studentId: student.studentId,
      name: student.name,
      avatar: student.avatar,
      gender,
      dob,
      parentName,
      phone,
      email
    };
  });
};

export const mockPeople10A = generateMockPeople();
