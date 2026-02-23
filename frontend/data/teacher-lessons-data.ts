
export interface TeacherLesson {
    id: string;
    title: string;
    subject: string;
    classId: string; // e.g., "c1", "c2"
    className: string; // e.g., "10-A", "10-B"
    type: "PDF" | "Video" | "Image" | "Document" | "Other";
    size: string;
    uploadDate: string;
    downloads: number;
}

export const teacherLessonsData: TeacherLesson[] = [
    {
        id: "RES-001",
        title: "Algebra II - Chapter 4: Polynomials",
        subject: "Mathematics",
        classId: "c1",
        className: "10-A",
        type: "PDF",
        size: "2.4 MB",
        uploadDate: "2024-03-10",
        downloads: 24
    },
    {
        id: "RES-002",
        title: "World War II - Cause and Effect",
        subject: "History",
        classId: "c1",
        className: "10-A",
        type: "Video",
        size: "145 MB",
        uploadDate: "2024-03-12",
        downloads: 18
    },
    {
        id: "RES-003",
        title: "Introduction to Organic Chemistry",
        subject: "Chemistry",
        classId: "c2",
        className: "10-B",
        type: "PDF",
        size: "3.1 MB",
        uploadDate: "2024-03-15",
        downloads: 30
    },
    {
        id: "RES-004",
        title: "Physics - Laws of Motion",
        subject: "Physics",
        classId: "c2",
        className: "10-B",
        type: "PDF",
        size: "1.8 MB",
        uploadDate: "2024-03-18",
        downloads: 22
    },
    {
        id: "RES-005",
        title: "English Literature - Shakespeare",
        subject: "English",
        classId: "c3",
        className: "9-A",
        type: "Document",
        size: "500 KB",
        uploadDate: "2024-03-20",
        downloads: 45
    },
    {
        id: "RES-006",
        title: "Biology - Cell Structure",
        subject: "Biology",
        classId: "c4",
        className: "9-B",
        type: "PDF",
        size: "4.2 MB",
        uploadDate: "2024-03-22",
        downloads: 38
    }
];
