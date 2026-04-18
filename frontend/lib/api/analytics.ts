import { client } from "./client";
import { AdminOverview, StudentScoreTrend, ClassAnalytics, ClassRanking } from "../../types/school.types";

export const analyticsApi = {
  getAdminOverview: () => client.get<AdminOverview>("/analytics/admin/overview"),
  
  getStudentScoreTrend: (studentId: number) => 
    client.get<StudentScoreTrend>(`/analytics/student/${studentId}/score-trend`),
  
  getClassAverages: (classId: number) => 
    client.get<ClassAnalytics>(`/analytics/class/${classId}/averages`),
  
  getHomeTeacherRanking: (classId: number) => 
    client.get<ClassRanking>(`/analytics/home-teacher/${classId}/ranking`),
};
