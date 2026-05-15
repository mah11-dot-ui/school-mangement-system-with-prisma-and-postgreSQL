import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/actions/dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Dashboard | EduManage Pro",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, id } = session.user;

  if (role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { userId: id },
    });
    if (student) {
      const { getStudentDashboard } = await import("@/actions/dashboard");
      const data = await getStudentDashboard(student.id);
      return <StudentDashboard data={data} />;
    }
  }

  if (role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: id },
    });
    if (teacher) {
      const { getTeacherDashboard } = await import("@/actions/dashboard");
      const data = await getTeacherDashboard(teacher.id);
      return <TeacherDashboard data={data} />;
    }
  }

  // Admin, Super Admin, Accountant
  const stats = await getDashboardStats();
  return <AdminDashboard stats={stats} />;
}
