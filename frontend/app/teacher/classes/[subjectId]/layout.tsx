import SubjectTabs from "@/components/layouts/SubjectTabs";

export default async function TeacherSubjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-screen">
      <SubjectTabs role="teacher" subjectId={subjectId} />
      {children}
    </div>
  );
}
