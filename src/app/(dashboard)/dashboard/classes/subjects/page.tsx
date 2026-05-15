import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export const metadata = { title: "Subjects | EduManage Pro" };

export default async function SubjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const subjects = await prisma.subject.findMany({
    include: {
      class: { select: { name: true, grade: true } },
      teacherSubjects: {
        include: { teacher: { include: { user: { select: { name: true } } } } },
        take: 1,
      },
    },
    orderBy: [{ class: { grade: "asc" } }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
        <p className="text-muted-foreground">All subjects ({subjects.length} total)</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <Card key={subject.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{subject.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{subject.code}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{subject.class.name}</Badge>
                    {subject.isOptional && <Badge variant="secondary">Optional</Badge>}
                  </div>
                  {subject.teacherSubjects[0] && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Teacher: {subject.teacherSubjects[0].teacher.user.name}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
