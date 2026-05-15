import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Class Routine | EduManage Pro" };

const DAYS = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"] as const;

export default async function RoutinePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const routines = await prisma.routine.findMany({
    include: {
      section: { include: { class: true } },
      subject: true,
    },
    orderBy: [{ day: "asc" }, { startTime: "asc" }],
  });

  const byDay = DAYS.reduce((acc, day) => {
    acc[day] = routines.filter((r) => r.day === day);
    return acc;
  }, {} as Record<string, typeof routines>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Class Routine</h1>
        <p className="text-muted-foreground">Weekly class schedule</p>
      </div>

      <div className="grid gap-4">
        {DAYS.map((day) => (
          <Card key={day}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base capitalize">{day.toLowerCase()}</CardTitle>
            </CardHeader>
            <CardContent>
              {byDay[day].length === 0 ? (
                <p className="text-sm text-muted-foreground">No classes scheduled</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {byDay[day].map((r) => (
                    <div key={r.id} className="p-3 rounded-lg border bg-muted/30 min-w-[160px]">
                      <p className="font-medium text-sm">{r.subject.name}</p>
                      <p className="text-xs text-muted-foreground">{r.section.class.name} - {r.section.name}</p>
                      <p className="text-xs text-primary mt-1">{r.startTime} – {r.endTime}</p>
                      {r.room && <p className="text-xs text-muted-foreground">Room: {r.room}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
