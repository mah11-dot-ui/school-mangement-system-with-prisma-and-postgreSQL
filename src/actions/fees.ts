"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { PaymentMethod } from "@prisma/client";

export async function getFees(params: {
  studentId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const { studentId, status, page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const where = {
    ...(studentId && { studentId }),
    ...(status && { status: status as never }),
  };

  const [fees, total] = await Promise.all([
    prisma.fee.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { name: true } },
            section: { include: { class: true } },
          },
        },
        feeStructure: true,
        payments: { orderBy: { paidAt: "desc" } },
      },
      skip,
      take: limit,
      orderBy: { dueDate: "asc" },
    }),
    prisma.fee.count({ where }),
  ]);

  return {
    data: fees,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function createFeeStructure(data: {
  schoolId: string;
  classId?: string;
  academicYearId?: string;
  name: string;
  amount: number;
  dueDate?: number;
  frequency: string;
  description?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
    throw new Error("Insufficient permissions");
  }

  try {
    const feeStructure = await prisma.feeStructure.create({ data });
    revalidatePath("/dashboard/fees");
    return { success: true, data: feeStructure };
  } catch {
    return { error: "Failed to create fee structure" };
  }
}

export async function collectPayment(data: {
  feeId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  note?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
    throw new Error("Insufficient permissions");
  }

  try {
    const fee = await prisma.fee.findUnique({
      where: { id: data.feeId },
      include: { payments: true },
    });

    if (!fee) return { error: "Fee not found" };

    const totalPaid = fee.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = fee.amount + fee.fine - fee.discount - totalPaid;

    if (data.amount > remaining) {
      return { error: "Payment amount exceeds remaining balance" };
    }

    const payment = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          feeId: data.feeId,
          amount: data.amount,
          method: data.method,
          transactionId: data.transactionId,
          collectedBy: session.user.id,
          note: data.note,
        },
      });

      // Update fee status
      const newTotalPaid = totalPaid + data.amount;
      const newStatus =
        newTotalPaid >= fee.amount + fee.fine - fee.discount
          ? "PAID"
          : "PARTIAL";

      await tx.fee.update({
        where: { id: data.feeId },
        data: { status: newStatus },
      });

      return payment;
    });

    revalidatePath("/dashboard/fees");
    return { success: true, data: payment };
  } catch {
    return { error: "Failed to process payment" };
  }
}

export async function getFeeStats() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [totalCollected, totalPending, totalOverdue, recentPayments] =
    await Promise.all([
      prisma.payment.aggregate({ _sum: { amount: true } }),
      prisma.fee.aggregate({
        where: { status: "PENDING" },
        _sum: { amount: true },
      }),
      prisma.fee.aggregate({
        where: { status: "OVERDUE" },
        _sum: { amount: true },
      }),
      prisma.payment.findMany({
        orderBy: { paidAt: "desc" },
        take: 10,
        include: {
          fee: {
            include: {
              student: {
                include: { user: { select: { name: true } } },
              },
              feeStructure: { select: { name: true } },
            },
          },
        },
      }),
    ]);

  return {
    totalCollected: totalCollected._sum.amount || 0,
    totalPending: totalPending._sum.amount || 0,
    totalOverdue: totalOverdue._sum.amount || 0,
    recentPayments,
  };
}
