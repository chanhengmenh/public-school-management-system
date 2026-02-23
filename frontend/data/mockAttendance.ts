export interface ClassAttendanceRecord {
    id: string;
    name: string;
    present: number;
    absent: number;
    late: number;
    lastStatus: "Present" | "Absent" | "Late";
    rate: number;
}

export const mockClassAttendance: ClassAttendanceRecord[] = [
    { id: "STU-001", name: "Sok Dara", present: 45, absent: 2, late: 1, lastStatus: "Present", rate: 94 },
    { id: "STU-002", name: "Chan Bopha", present: 42, absent: 5, late: 3, lastStatus: "Late", rate: 85 },
    { id: "STU-003", name: "Chea Visal", present: 48, absent: 0, late: 2, lastStatus: "Present", rate: 98 },
    { id: "STU-004", name: "Keo Thida", present: 35, absent: 10, late: 5, lastStatus: "Absent", rate: 70 },
    { id: "STU-005", name: "Vann Sophea", present: 40, absent: 6, late: 4, lastStatus: "Present", rate: 80 },
];
