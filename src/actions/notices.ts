"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { NoticeVisibility } from "@prisma/client";

export async function getNotices(params: {
  visibility?: NoticeVisibility;
  published?: boolean;
  page?: number;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const { visibility, published, page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  // Build visibility filter based on user role
  const visibilityFilter = getVisibilityFilter(session.user.role as string);

  const where = {
    ...(visibility && { visibility }),
    ...(published !== undefined && { isPublished: published }),
    ...(!["SUPER_ADMIN", "ADMIN"].includes(session.user.role) && {
      isPublished: true,
      visibility: { in: visibilityFilter },
    }),
  };

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notice.count({ where }),
  ]);

  return {
    data: notices,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

function getVisibilityFilter(role: string): NoticeVisibility[] {
  const base: NoticeVisibility[] = ["ALL"];
  switch (role) {
    case "TEACHER":
      return [...base, "TEACHER"];
    case "STUDENT":
      return [...base, "STUDENT"];
    case "PARENT":
      return [...base, "PARENT"];
    case "ADMIN":
    case "ACCOUNTANT":
      return [...base, "ADMIN"];
    default:
      return base;
  }
}

export async function createNotice(data: {
  schoolId: string;
  title: string;
  content: string;
  visibility: NoticeVisibility;
  publishedAt?: Date;
  expiresAt?: Date;
  isPublished?: boolean;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!["SUPER_ADMIN", "ADMIN", "TEACHER"].includes(session.user.role)) {
    throw new Error("Insufficient permissions");
  }

  try {
    const notice = await prisma.notice.create({
      data: {
        ...data,
        createdBy: session.user.id,
      },
    });

    revalidatePath("/dashboard/notices");
    return { success: true, data: notice };
  } catch {
    return { error: "Failed to create notice" };
  }
}

export async function updateNotice(id: string, data: Partial<{
  title: string;
  content: string;
  visibility: NoticeVisibility;
  isPublished: boolean;
  expiresAt: Date;
}>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const notice = await prisma.notice.update({
      where: { id },
      data,
    });

    revalidatePath("/dashboard/notices");
    return { success: true, data: notice };
  } catch {
    return { error: "Failed to update notice" };
  }
}

export async function deleteNotice(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    throw new Error("Insufficient permissions");
  }

  try {
    await prisma.notice.delete({ where: { id } });
    revalidatePath("/dashboard/notices");
    return { success: true };
  } catch {
    return { error: "Failed to delete notice" };
  }
}
