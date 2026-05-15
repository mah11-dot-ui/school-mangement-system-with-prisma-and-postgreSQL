"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    todayAttendance,
    totalStudentsForAttendance,
    pendingFees,
    totalRevenue,
    recentNotices,
    upcomingExams,
    recentActivities,
  ] = await Promise.all([
    prisma.student.count({ where: { isActive: true } }),
    prisma.teacher.count({ where: { isActive: true } }),
    prisma.class.count(),
    prisma.attendance.count({
      where: { date: today, status: "PRESENT" },
    }),
    prisma.attendance.count({ where: { date: today } }),
    prisma.fee.aggregate({
      where: { status: { in: ["PENDING", "OVERDUE"] } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
    }),
    prisma.notice.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, createdAt: true, visibility: true },
    }),
    prisma.exam.findMany({
      where: { startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
      take: 5,
      include: {
        academicYear: { select: { name: true } },
      },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, image: true, role: true } },
      },
    }),
  ]);

  // Monthly fee collection for chart
  const monthlyRevenue = await getMonthlyRevenue();

  // Attendance trend for last 7 days
  const attendanceTrend = await getAttendanceTrend();

  return {
    stats: {
      totalStudents,
      totalTeachers,
      totalClasses,
      attendanceRate: totalStudentsForAttendance > 0
        ? Math.round((todayAttendance / totalStudentsForAttendance) * 100)
        : 0,
      pendingFees: pendingFees._sum.amount || 0,
      totalRevenue: totalRevenue._sum.amount || 0,
    },
    recentNotices,
    upcomingExams,
    recentActivities,
    monthlyRevenue,
    attendanceTrend,
  };
}

async function getMonthlyRevenue() {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const revenue = await prisma.payment.aggregate({
      where: { paidAt: { gte: start, lte: end } },
      _sum: { amount: true },
    });

    months.push({
      name: start.toLocaleString("default", { month: "short" }),
      revenue: revenue._sum.amount || 0,
    });
  }
  return months;
}

async function getAttendanceTrend() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const [present, total] = await Promise.all([
      prisma.attendance.count({ where: { date, status: "PRESENT" } }),
      prisma.attendance.count({ where: { date } }),
    ]);

    days.push({
      name: date.toLocaleString("default", { weekday: "short" }),
      present,
      absent: total - present,
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
    });
  }
  return days;
}

export async function getStudentDashboard(studentId: string) {
  const [student, recentAttendance, recentResults, pendingFees, notices] =
    await Promise.all([
      prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: true,
          section: { include: { class: true } },
        },
      }),
      prisma.attendance.findMany({
        where: { studentId },
        orderBy: { date: "desc" },
        take: 30,
      }),
      prisma.result.findMany({
        where: { studentId },
        include: {
          exam: true,
          examSubject: { include: { subject: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.fee.findMany({
        where: { studentId, status: { in: ["PENDING", "OVERDUE"] } },
        include: { feeStructure: true },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      prisma.notice.findMany({
        where: {
          isPublished: true,
          OR: [{ visibility: "ALL" }, { visibility: "STUDENT" }],
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const presentDays = recentAttendance.filter((a) => a.status === "PRESENT").length;
  const attendanceRate = recentAttendance.length > 0
    ? Math.round((presentDays / recentAttendance.length) * 100)
    : 0;

  return { student, recentAttendance, recentResults, pendingFees, notices, attendanceRate };
}

export async function getTeacherDashboard(teacherId: string) {
  const [teacher, todayClasses, recentAttendance, notices] = await Promise.all([
    prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: true,
        subjects: { include: { subject: { include: { class: true } } } },
        classTeacher: { include: { class: true } },
      },
    }),
    prisma.routine.findMany({
      where: {
        teacherId,
        day: new Date().toLocaleString("en-US", { weekday: "long" }).toUpperCase() as never,
      },
      include: {
        section: { include: { class: true } },
        subject: true,
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.teacherAttendance.findMany({
      where: { teacherId },
      orderBy: { date: "desc" },
      take: 30,
    }),
    prisma.notice.findMany({
      where: {
        isPublished: true,
        OR: [{ visibility: "ALL" }, { visibility: "TEACHER" }],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return { teacher, todayClasses, recentAttendance, notices };
}
