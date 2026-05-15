import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudentForm } from "@/components/students/student-form";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Add Student | EduManage Pro",
};

export default async function NewStudentPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard/students");
  }

  const [sections, parents] = await Promise.all([
    prisma.section.findMany({
      include: { class: true },
      orderBy: [{ class: { grade: "asc" } }, { name: "asc" }],
    }),
    prisma.parent.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Student</h1>
        <p className="text-muted-foreground">Fill in the details to enroll a new student</p>
      </div>
      <StudentForm sections={sections} parents={parents} />
    </div>
  );
}
