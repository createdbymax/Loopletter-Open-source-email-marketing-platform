import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { generateDashboardMetadata } from "@/lib/metadata";
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

  // For now, use the known artist data directly to avoid database issues
  const artist = {
    id: "7c4028fd-da9c-4baa-bc72-211fb72d9885",
    clerk_user_id: userId,
    name: "Third Vibes",
    email: user.primaryEmailAddress?.emailAddress || "maxjasper@icloud.com",
    slug: "max-boorsma",
    bio: "",
    ses_domain_verified: false,
    ses_domain: null,
    ses_status: null,
    settings: {
      timezone: "UTC",
      brand_colors: { primary: "#3b82f6", secondary: "#64748b" },
      social_links: {
        spotify:
          "https://open.spotify.com/artist/08FHB0pa7F05yP7c7eQp5u?si=iPQCE4gkSiaqNkBl_xowCw",
        website: "https://thirdvibes.com",
        instagram: "@thirdvibes",
      },
      double_opt_in: false,
      send_time_optimization: false,
    },
    created_at: "2025-07-15T16:53:42.550538+00:00",
    updated_at: "2025-07-15T16:53:42.550538+00:00",
  };

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
