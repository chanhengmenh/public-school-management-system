export interface TermData {
  overall: number;
  letterGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  subjects: Record<string, number>;
}

export interface StudentRankProfile {
  id: string;
  studentId: string;
  name: string;
  avatar?: string;
  sem1: TermData;
  sem2: TermData | null;
  yearly: TermData | null;
}

function calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

function createStudent(id: string, num: number, name: string, initials: string, scores: number[]): StudentRankProfile {
  const titles = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Art'];
  const subjects: Record<string, number> = {};
  let total = 0;
  titles.forEach((title, i) => {
    subjects[title] = scores[i];
    total += scores[i];
  });
  const overall = Number((total / scores.length).toFixed(1));

  return {
    id,
    studentId: `STU-0${num < 10 ? '0' + num : num}`,
    name,
    avatar: initials,
    sem1: {
      overall,
      letterGrade: calculateGrade(overall),
      subjects
    },
    sem2: null,
    yearly: null
  };
}

export const mockClass10A: StudentRankProfile[] = [
  createStudent('s1', 1, 'Alex Johnson', 'AJ', [95, 88, 92, 85, 90, 89, 94]),
  createStudent('s2', 2, 'Sarah Williams', 'SW', [98, 90, 96, 88, 92, 94, 91]),
  createStudent('s3', 3, 'Michael Brown', 'MB', [85, 91, 84, 86, 78, 80, 85]),
  createStudent('s4', 4, 'Emily Davis', 'ED', [100, 91, 95, 97, 88, 90, 96]),
  createStudent('s5', 5, 'David Wilson', 'DW', [80, 85, 82, 79, 86, 84, 88]),
  createStudent('s6', 6, 'Jessica Garcia', 'JG', [92, 89, 91, 94, 95, 96, 90]),
  createStudent('s7', 7, 'James Martinez', 'JM', [78, 80, 75, 82, 70, 72, 79]),
  createStudent('s8', 8, 'Sophia Taylor', 'ST', [88, 85, 86, 90, 91, 89, 92]),
  createStudent('s9', 9, 'William Anderson', 'WA', [91, 93, 89, 88, 85, 87, 82]),
  createStudent('s10', 10, 'Olivia Thomas', 'OT', [95, 94, 98, 96, 92, 90, 95]),
  createStudent('s11', 11, 'Ethan Jackson', 'EJ', [82, 84, 81, 79, 80, 82, 85]),
  createStudent('s12', 12, 'Ava White', 'AW', [89, 90, 88, 85, 91, 93, 94]),
  createStudent('s13', 13, 'Daniel Harris', 'DH', [93, 87, 90, 89, 86, 85, 88]),
  createStudent('s14', 14, 'Mia Martin', 'MM', [96, 95, 97, 92, 94, 95, 93]),
  createStudent('s15', 15, 'Matthew Thompson', 'MT', [84, 82, 85, 81, 86, 88, 80]),
  createStudent('s16', 16, 'Isabella Garcia', 'IG', [90, 88, 86, 92, 95, 91, 89]),
  createStudent('s17', 17, 'Joseph Robinson', 'JR', [81, 79, 80, 83, 85, 82, 84]),
  createStudent('s18', 18, 'Charlotte Clark', 'CC', [94, 92, 95, 96, 98, 97, 95]),
  createStudent('s19', 19, 'David Lewis', 'DL', [87, 86, 89, 85, 82, 84, 80]),
  createStudent('s20', 20, 'Amelia Lee', 'AL', [97, 98, 96, 94, 95, 92, 98]),
];
