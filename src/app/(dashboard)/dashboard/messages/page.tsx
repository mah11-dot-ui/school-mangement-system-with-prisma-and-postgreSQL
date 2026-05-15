import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MessagesView } from "@/components/messages/messages-view";

export const metadata = {
  title: "Messages | EduManage Pro",
};

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [received, sent] = await Promise.all([
    prisma.message.findMany({
      where: { receiverId: session.user.id },
      include: {
        sender: { select: { name: true, image: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.message.findMany({
      where: { senderId: session.user.id },
      include: {
        receiver: { select: { name: true, image: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  // Get users to message
  const users = await prisma.user.findMany({
    where: {
      id: { not: session.user.id },
      isActive: true,
    },
    select: { id: true, name: true, email: true, role: true, image: true },
    take: 50,
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Communicate with students, teachers, and parents</p>
      </div>
      <MessagesView
        received={received}
        sent={sent}
        users={users}
        currentUserId={session.user.id}
      />
    </div>
  );
}
