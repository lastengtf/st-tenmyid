import { getAllApps } from "@/lib/kv";
import { PortalView } from "@/components/portal/portal-view";

// Revalidate frequently or dynamic rendering for fresh links
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const apps = await getAllApps();

  return <PortalView apps={apps} />;
}
