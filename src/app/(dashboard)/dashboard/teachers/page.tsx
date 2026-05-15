import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TeachersTable } from "@/components/teachers/teachers-table";

export const metadata = {
  title: "Teachers | EduManage Pro",
};

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function TeachersPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const where = params.search
    ? {
        OR: [
          { user: { name: { contains: params.search, mode: "insensitive" as const } } },
          { employeeId: { contains: params.search, mode: "insensitive" as const } },
        ],
        isActive: true,
      }
    : { isActive: true };

  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, image: true } },
        subjects: {
          include: { subject: { include: { class: true } } },
          take: 3,
        },
        classTeacher: { include: { class: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.teacher.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground">Manage all teachers ({total} total)</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/teachers/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
          </Link>
        </Button>
      </div>
      <TeachersTable
        data={teachers}
        meta={{ page, limit, total, totalPages: Math.ceil(total / limit) }}
      />
    </div>
  );
}
