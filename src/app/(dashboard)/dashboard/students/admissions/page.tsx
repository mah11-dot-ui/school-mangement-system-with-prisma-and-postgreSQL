import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, GraduationCap, Calendar, Hash } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Admissions | EduManage Pro" };

export default async function AdmissionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const students = await prisma.student.findMany({
    where: { isActive: true },
    include: {
      user: { select: { name: true, email: true } },
      section: { include: { class: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admissions</h1>
          <p className="text-muted-foreground">Recent student admissions</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/students/new">
            <Plus className="h-4 w-4 mr-2" /> New Admission
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {students.map((student) => (
          <Card key={student.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{student.user.name}</p>
                    <p className="text-sm text-muted-foreground">{student.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Hash className="h-3 w-3" />
                    {student.admissionNo}
                  </div>
                  <div>
                    {student.section
                      ? <Badge variant="secondary">{student.section.class.name} - {student.section.name}</Badge>
                      : <Badge variant="outline">Unassigned</Badge>}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(student.createdAt)}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/students/${student.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
