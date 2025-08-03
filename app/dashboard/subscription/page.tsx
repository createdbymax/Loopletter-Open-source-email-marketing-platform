import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { generateDashboardMetadata } from "@/lib/metadata";
import { getOrCreateArtistByClerkId } from "@/lib/db";
import SubscriptionManager from "./subscription-manager";

export const metadata = generateDashboardMetadata(
  "Fan Signup",
  "Manage your subscription page, customize your fan signup experience, and generate embeddable widgets to grow your fanbase."
);

export default async function SubscriptionPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Get the actual artist data from the database
  const artist = await getOrCreateArtistByClerkId(
    userId,
    user.primaryEmailAddress?.emailAddress || '',
    user.fullName || 'Artist'
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fan Subscription</h1>
        <p className="text-gray-600 mt-2">
          Share your subscription page and embed widgets to grow your fanbase
        </p>
      </div>

      <SubscriptionManager artist={artist} />
    </div>
  );
}
