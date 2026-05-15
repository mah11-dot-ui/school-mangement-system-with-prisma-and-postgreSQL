import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, FileText, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Exams | EduManage Pro" };

export default async function ExamsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const exams = await prisma.exam.findMany({
    include: {
      academicYear: { select: { name: true } },
      subjects: { include: { subject: true } },
      _count: { select: { results: true } },
    },
    orderBy: { startDate: "desc" },
  });

  const canManage = ["SUPER_ADMIN", "ADMIN", "TEACHER"].includes(session.user.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground">Manage examinations ({exams.length} total)</p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href="/dashboard/exams/new"><Plus className="h-4 w-4 mr-2" />Create Exam</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {exams.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No exams yet</CardContent></Card>
        ) : exams.map((exam) => (
          <Card key={exam.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{exam.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{exam.type}</Badge>
                      <Badge variant="secondary">{exam.academicYear.name}</Badge>
                      <Badge variant={exam.isPublished ? "success" : "warning"}>
                        {exam.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="text-center">
                    <p className="font-bold text-foreground">{exam.subjects.length}</p>
                    <p className="text-xs">Subjects</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-foreground">{exam._count.results}</p>
                    <p className="text-xs">Results</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(exam.startDate)} – {formatDate(exam.endDate)}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/exams/${exam.id}`}>View</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/exams/results?examId=${exam.id}`}>Results</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
