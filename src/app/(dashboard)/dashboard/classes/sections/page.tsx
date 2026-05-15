import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Sections | EduManage Pro" };

export default async function SectionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const sections = await prisma.section.findMany({
    include: {
      class: true,
      teacher: { include: { user: { select: { name: true } } } },
      _count: { select: { students: true } },
    },
    orderBy: [{ class: { grade: "asc" } }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sections</h1>
        <p className="text-muted-foreground">All class sections ({sections.length} total)</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{section.class.name} — Section {section.name}</h3>
                <Badge variant="secondary">{section._count.students}/{section.capacity}</Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Class Teacher: {section.teacher?.user.name || "Not assigned"}</p>
                {section.roomNo && <p>Room: {section.roomNo}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
