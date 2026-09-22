import { redirect } from "next/navigation";
import { getCurrentAdminSession } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getCurrentAdminSession();

  if (!session) {
    redirect("/login");
  }

  return <AdminDashboard adminEmail={session.email} />;
}
