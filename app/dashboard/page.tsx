import { generateDashboardMetadata } from "@/lib/metadata";
import { DashboardOverview } from "./dashboard-overview";

export const metadata = generateDashboardMetadata(
  "Dashboard",
  "Your LoopLetter dashboard. Manage campaigns, track fans, analyze performance, and grow your music career with email marketing."
);

export default function DashboardPage() {
  return <DashboardOverview />;
}