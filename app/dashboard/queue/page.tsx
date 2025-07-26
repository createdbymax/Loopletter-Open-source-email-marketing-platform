import { generateDashboardMetadata } from "@/lib/metadata";
import { QueueStatus } from "@/components/queue-status";

export const metadata = generateDashboardMetadata(
  "Email Queue",
  "Monitor and manage your email sending queue status and performance."
);

export default function QueuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Queue Management</h1>
        <p className="text-gray-600 mt-2">
          Monitor your email sending queue, track job progress, and manage queue operations.
        </p>
      </div>
      
      <QueueStatus />
    </div>
  );
}