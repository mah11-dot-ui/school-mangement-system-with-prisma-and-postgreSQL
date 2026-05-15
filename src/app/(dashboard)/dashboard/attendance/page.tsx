import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AttendanceManager } from "@/components/attendance/attendance-manager";

export const metadata = {
  title: "Attendance | EduManage Pro",
};

export default async function AttendancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const sections = await prisma.section.findMany({
    include: {
      class: { select: { name: true, grade: true } },
    },
    orderBy: [{ class: { grade: "asc" } }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">Take and manage daily attendance</p>
      </div>
      <AttendanceManager sections={sections} />
    </div>
  );
}
