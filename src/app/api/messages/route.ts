import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const messageSchema = z.object({
  receiverId: z.string().min(1),
  subject: z.string().optional(),
  content: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId: parsed.data.receiverId,
        subject: parsed.data.subject,
        content: parsed.data.content,
      },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: parsed.data.receiverId,
        title: "New Message",
        message: `You have a new message from ${session.user.name}`,
        type: "INFO",
        link: "/dashboard/messages",
      },
    });

    return NextResponse.json({ success: true, data: message });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
