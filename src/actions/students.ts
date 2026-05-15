"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { studentSchema, studentUpdateSchema } from "@/lib/validations/student";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { generateAdmissionNo } from "@/lib/utils";

export async function getStudents(params: {
  search?: string;
  sectionId?: string;
  classId?: string;
  page?: number;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const { search, sectionId, classId, page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const where = {
    ...(search && {
      OR: [
        { user: { name: { contains: search, mode: "insensitive" as const } } },
        { admissionNo: { contains: search, mode: "insensitive" as const } },
        { rollNumber: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(sectionId && { sectionId }),
    ...(classId && { section: { classId } }),
    isActive: true,
  };

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, image: true } },
        section: {
          include: {
            class: { select: { name: true, grade: true } },
          },
        },
        parent: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.student.count({ where }),
  ]);

  return {
    data: students,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getStudentById(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      section: {
        include: {
          class: true,
        },
      },
      parent: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
      attendances: {
        orderBy: { date: "desc" },
        take: 30,
      },
      results: {
        include: {
          exam: true,
          examSubject: {
            include: { subject: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      fees: {
        include: {
          feeStructure: true,
          payments: true,
        },
        orderBy: { dueDate: "desc" },
        take: 10,
      },
    },
  });
}

export async function createStudent(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    throw new Error("Insufficient permissions");
  }

  const rawData = Object.fromEntries(formData.entries());
  const parsed = studentSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password, admissionNo, ...studentData } = parsed.data;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Email already in use" };
  }

  // Check admission number
  const existingAdmission = await prisma.student.findUnique({
    where: { admissionNo: admissionNo || generateAdmissionNo() },
  });
  if (existingAdmission) {
    return { error: "Admission number already exists" };
  }

  const hashedPassword = await bcrypt.hash(password || "Student@123", 12);

  try {
    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "STUDENT",
        },
      });

      return tx.student.create({
        data: {
          userId: user.id,
          admissionNo: admissionNo || generateAdmissionNo(),
          rollNumber: studentData.rollNumber,
          sectionId: studentData.sectionId || null,
          parentId: studentData.parentId || null,
          dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : null,
          gender: studentData.gender || null,
          bloodGroup: studentData.bloodGroup || null,
          religion: studentData.religion || null,
          nationality: studentData.nationality || "Bangladeshi",
          phone: studentData.phone || null,
          address: studentData.address || null,
          emergencyContact: studentData.emergencyContact || null,
          medicalInfo: studentData.medicalInfo || null,
        },
        include: {
          user: { select: { name: true, email: true } },
          section: { include: { class: true } },
        },
      });
    });

    revalidatePath("/dashboard/students");
    return { success: true, data: student };
  } catch {
    return { error: "Failed to create student" };
  }
}

export async function updateStudent(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const rawData = Object.fromEntries(formData.entries());
  const parsed = studentUpdateSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, ...studentData } = parsed.data;

  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) return { error: "Student not found" };

    await prisma.$transaction(async (tx) => {
      if (name || email) {
        await tx.user.update({
          where: { id: student.userId },
          data: {
            ...(name && { name }),
            ...(email && { email }),
          },
        });
      }

      await tx.student.update({
        where: { id },
        data: {
          rollNumber: studentData.rollNumber,
          sectionId: studentData.sectionId || null,
          parentId: studentData.parentId || null,
          dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : undefined,
          gender: studentData.gender || undefined,
          bloodGroup: studentData.bloodGroup || null,
          religion: studentData.religion || null,
          nationality: studentData.nationality || undefined,
          phone: studentData.phone || null,
          address: studentData.address || null,
          emergencyContact: studentData.emergencyContact || null,
          medicalInfo: studentData.medicalInfo || null,
        },
      });
    });

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${id}`);
    return { success: true };
  } catch {
    return { error: "Failed to update student" };
  }
}

export async function deleteStudent(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    throw new Error("Insufficient permissions");
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) return { error: "Student not found" };

    // Soft delete
    await prisma.$transaction([
      prisma.student.update({ where: { id }, data: { isActive: false } }),
      prisma.user.update({ where: { id: student.userId }, data: { isActive: false } }),
    ]);

    revalidatePath("/dashboard/students");
    return { success: true };
  } catch {
    return { error: "Failed to delete student" };
  }
}
