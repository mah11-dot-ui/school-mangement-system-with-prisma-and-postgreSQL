import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStudents } from "@/actions/students";
import { StudentsTable } from "@/components/students/students-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Students | EduManage Pro",
};

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string; sectionId?: string }>;
}

export default async function StudentsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const { search, page, sectionId } = params;

  const data = await getStudents({
    search,
    sectionId,
    page: page ? parseInt(page) : 1,
    limit: 10,
  });

  const canCreate = ["SUPER_ADMIN", "ADMIN"].includes(session.user.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage all students ({data.meta.total} total)
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/dashboard/students/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Link>
          </Button>
        )}
      </div>

      <StudentsTable
        data={data.data}
        meta={data.meta}
        canEdit={canCreate}
      />
    </div>
  );
}
