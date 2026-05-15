import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeacherForm } from "@/components/teachers/teacher-form";

export const metadata = { title: "Add Teacher | EduManage Pro" };

export default async function NewTeacherPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) redirect("/dashboard");

  const subjects = await prisma.subject.findMany({
    include: { class: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Teacher</h1>
        <p className="text-muted-foreground">Fill in the details to add a new teacher</p>
      </div>
      <TeacherForm subjects={subjects} />
    </div>
  );
}
