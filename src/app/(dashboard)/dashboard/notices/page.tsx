import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNotices } from "@/actions/notices";
import { NoticesManager } from "@/components/notices/notices-manager";

export const metadata = {
  title: "Notices | EduManage Pro",
};

export default async function NoticesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await getNotices({ page: 1, limit: 20 });
  const canCreate = ["SUPER_ADMIN", "ADMIN", "TEACHER"].includes(session.user.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notice Board</h1>
        <p className="text-muted-foreground">Manage and publish school notices</p>
      </div>
      <NoticesManager
        initialData={data.data}
        canCreate={canCreate}
        userRole={session.user.role}
      />
    </div>
  );
}
