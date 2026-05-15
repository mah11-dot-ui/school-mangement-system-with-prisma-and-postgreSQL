import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getStudentById } from "@/actions/students";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, GraduationCap, Phone, MapPin, Calendar, Droplets } from "lucide-react";
import { getInitials, formatDate, formatCurrency } from "@/lib/utils";

export const metadata = { title: "Student Profile | EduManage Pro" };

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) notFound();

  const presentDays = student.attendances.filter((a) => a.status === "PRESENT").length;
  const attendanceRate = student.attendances.length > 0
    ? Math.round((presentDays / student.attendances.length) * 100)
    : 0;

  const totalFees = student.fees.reduce((s, f) => s + f.amount, 0);
  const paidFees = student.fees.reduce((s, f) => s + f.payments.reduce((p, pay) => p + pay.amount, 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/students"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Student Profile</h1>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/students/${id}/edit`}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Link>
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={student.photo || ""} />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {getInitials(student.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{student.user.name}</h2>
              <p className="text-muted-foreground">{student.user.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary">#{student.admissionNo}</Badge>
                {student.section && (
                  <Badge variant="outline">
                    {student.section.class.name} - Section {student.section.name}
                  </Badge>
                )}
                {student.rollNumber && <Badge variant="outline">Roll: {student.rollNumber}</Badge>}
                <Badge variant={student.isActive ? "success" : "destructive"}>
                  {student.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Attendance", value: `${attendanceRate}%`, color: attendanceRate >= 75 ? "text-green-600" : "text-red-600" },
                { label: "Total Fees", value: formatCurrency(totalFees), color: "text-foreground" },
                { label: "Paid", value: formatCurrency(paidFees), color: "text-green-600" },
              ].map((stat) => (
                <div key={stat.label} className="p-3 bg-muted/30 rounded-lg">
                  <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Personal Info</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: Calendar, label: "Date of Birth", value: student.dateOfBirth ? formatDate(student.dateOfBirth) : "—" },
                  { icon: GraduationCap, label: "Gender", value: student.gender || "—" },
                  { icon: Droplets, label: "Blood Group", value: student.bloodGroup || "—" },
                  { icon: Phone, label: "Phone", value: student.phone || "—" },
                  { icon: MapPin, label: "Address", value: student.address || "—" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground w-28">{item.label}</span>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Parent/Guardian</CardTitle></CardHeader>
              <CardContent>
                {student.parent ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-28">Name</span>
                      <span className="text-sm font-medium">{student.parent.user.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-28">Email</span>
                      <span className="text-sm font-medium">{student.parent.user.email}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No parent assigned</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Recent Attendance — {attendanceRate}% ({presentDays}/{student.attendances.length} days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {student.attendances.map((a) => (
                  <div key={a.id} className={`px-2 py-1 rounded text-xs font-medium ${
                    a.status === "PRESENT" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                    a.status === "ABSENT"  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                    a.status === "LATE"    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {formatDate(a.date, "dd MMM")} — {a.status}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader><CardTitle className="text-base">Exam Results</CardTitle></CardHeader>
            <CardContent>
              {student.results.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No results yet</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-muted-foreground">Exam</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Subject</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Marks</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.results.map((r) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="py-2">{r.exam.name}</td>
                        <td className="py-2">{r.examSubject.subject.name}</td>
                        <td className="py-2">{r.marksObtained}/{r.examSubject.totalMarks}</td>
                        <td className="py-2">
                          <Badge variant={r.grade === "F" ? "destructive" : "success"}>{r.grade}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader><CardTitle className="text-base">Fee History</CardTitle></CardHeader>
            <CardContent>
              {student.fees.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No fee records</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-muted-foreground">Fee Type</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Due Date</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.fees.map((f) => (
                      <tr key={f.id} className="border-b last:border-0">
                        <td className="py-2">{f.feeStructure.name}</td>
                        <td className="py-2">{formatCurrency(f.amount)}</td>
                        <td className="py-2">{formatDate(f.dueDate)}</td>
                        <td className="py-2">
                          <Badge variant={
                            f.status === "PAID" ? "success" :
                            f.status === "OVERDUE" ? "destructive" :
                            f.status === "PARTIAL" ? "info" : "warning"
                          }>{f.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
