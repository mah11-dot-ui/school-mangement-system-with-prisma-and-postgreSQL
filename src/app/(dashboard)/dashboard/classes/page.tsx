import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClassesManager } from "@/components/classes/classes-manager";

export const metadata = {
  title: "Classes | EduManage Pro",
};

export default async function ClassesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const classes = await prisma.class.findMany({
    include: {
      sections: {
        include: {
          _count: { select: { students: true } },
          teacher: { include: { user: { select: { name: true } } } },
        },
      },
      subjects: true,
      _count: { select: { sections: true, subjects: true } },
    },
    orderBy: { grade: "asc" },
  });

  const canManage = ["SUPER_ADMIN", "ADMIN"].includes(session.user.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Classes & Sections</h1>
        <p className="text-muted-foreground">Manage classes, sections, and subjects</p>
      </div>
      <ClassesManager classes={classes} canManage={canManage} />
    </div>
  );
}
