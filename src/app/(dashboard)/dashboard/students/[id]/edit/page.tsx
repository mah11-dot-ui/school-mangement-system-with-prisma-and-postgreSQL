import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentForm } from "@/components/students/student-form";

export const metadata = { title: "Edit Student | EduManage Pro" };

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) redirect("/dashboard/students");

  const { id } = await params;

  const [student, sections, parents] = await Promise.all([
    prisma.student.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.section.findMany({
      include: { class: true },
      orderBy: [{ class: { grade: "asc" } }, { name: "asc" }],
    }),
    prisma.parent.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  if (!student) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Student</h1>
        <p className="text-muted-foreground">Update student information</p>
      </div>
      <StudentForm sections={sections} parents={parents} student={student} />
    </div>
  );
}
