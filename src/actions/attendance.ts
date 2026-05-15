"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { AttendanceStatus } from "@prisma/client";

export async function getAttendanceBySection(sectionId: string, date: Date) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const students = await prisma.student.findMany({
    where: { sectionId, isActive: true },
    include: {
      user: { select: { name: true, image: true } },
      attendances: {
        where: { date: startOfDay },
        take: 1,
      },
    },
    orderBy: { rollNumber: "asc" },
  });

  return students.map((student) => ({
    studentId: student.id,
    name: student.user.name,
    image: student.user.image,
    rollNumber: student.rollNumber,
    status: student.attendances[0]?.status || null,
    attendanceId: student.attendances[0]?.id || null,
  }));
}

export async function saveAttendance(
  sectionId: string,
  date: Date,
  records: { studentId: string; status: AttendanceStatus; note?: string }[]
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!["SUPER_ADMIN", "ADMIN", "TEACHER"].includes(session.user.role)) {
    throw new Error("Insufficient permissions");
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  try {
    await prisma.$transaction(
      records.map((record) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: record.studentId,
              date: startOfDay,
            },
          },
          create: {
            studentId: record.studentId,
            sectionId,
            date: startOfDay,
            status: record.status,
            note: record.note,
            takenBy: session.user.id,
          },
          update: {
            status: record.status,
            note: record.note,
            takenBy: session.user.id,
          },
        })
      )
    );

    revalidatePath("/dashboard/attendance");
    return { success: true };
  } catch {
    return { error: "Failed to save attendance" };
  }
}

export async function getAttendanceReport(params: {
  sectionId?: string;
  studentId?: string;
  month: number;
  year: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const { sectionId, studentId, month, year } = params;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const where = {
    date: { gte: startDate, lte: endDate },
    ...(sectionId && { sectionId }),
    ...(studentId && { studentId }),
  };

  const attendances = await prisma.attendance.findMany({
    where,
    include: {
      student: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
    orderBy: [{ date: "asc" }, { student: { rollNumber: "asc" } }],
  });

  return attendances;
}

export async function getStudentAttendanceSummary(studentId: string, month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const attendances = await prisma.attendance.findMany({
    where: {
      studentId,
      date: { gte: startDate, lte: endDate },
    },
  });

  const summary = {
    total: attendances.length,
    present: attendances.filter((a) => a.status === "PRESENT").length,
    absent: attendances.filter((a) => a.status === "ABSENT").length,
    late: attendances.filter((a) => a.status === "LATE").length,
    excused: attendances.filter((a) => a.status === "EXCUSED").length,
  };

  return {
    ...summary,
    percentage: summary.total > 0
      ? Math.round((summary.present / summary.total) * 100)
      : 0,
  };
}
