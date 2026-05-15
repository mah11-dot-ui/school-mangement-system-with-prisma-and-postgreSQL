import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Teacher Salary | EduManage Pro" };

export default async function SalaryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) redirect("/dashboard");

  const salaries = await prisma.salary.findMany({
    include: {
      teacher: { include: { user: { select: { name: true } } } },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    take: 30,
  });

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Salary Management</h1>
        <p className="text-muted-foreground">Teacher salary records</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Teacher</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Month</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Basic</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Allowances</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Deductions</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Net</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {salaries.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No salary records</td></tr>
              ) : (
                salaries.map((s) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{s.teacher.user.name}</td>
                    <td className="px-4 py-3">{months[s.month - 1]} {s.year}</td>
                    <td className="px-4 py-3">{formatCurrency(s.basicSalary)}</td>
                    <td className="px-4 py-3 text-green-600">+{formatCurrency(s.allowances)}</td>
                    <td className="px-4 py-3 text-red-600">-{formatCurrency(s.deductions)}</td>
                    <td className="px-4 py-3 font-bold">{formatCurrency(s.netSalary)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={s.isPaid ? "success" : "warning"}>
                        {s.isPaid ? "Paid" : "Pending"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
