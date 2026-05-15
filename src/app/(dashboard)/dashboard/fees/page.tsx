import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFees, getFeeStats } from "@/actions/fees";
import { FeesManager } from "@/components/fees/fees-manager";

export const metadata = {
  title: "Fees | EduManage Pro",
};

export default async function FeesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const [feesData, stats] = await Promise.all([
    getFees({ page: 1, limit: 10 }),
    getFeeStats(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fee Management</h1>
        <p className="text-muted-foreground">Track and collect student fees</p>
      </div>
      <FeesManager initialFees={feesData.data} stats={stats} meta={feesData.meta} />
    </div>
  );
}
