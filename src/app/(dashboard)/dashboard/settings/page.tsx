import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsPanel } from "@/components/settings/settings-panel";

export const metadata = {
  title: "Settings | EduManage Pro",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage school settings and configurations</p>
      </div>
      <SettingsPanel />
    </div>
  );
}
