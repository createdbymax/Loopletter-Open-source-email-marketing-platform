import { AutomationManager } from "./automation-manager";
import { getOrCreateArtistByClerkId } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
export default async function AutomationsPage() {
    const user = await currentUser();
    if (!user) {
        return <div>Please sign in to access automations</div>;
    }
    const artist = await getOrCreateArtistByClerkId(user.id, user.emailAddresses[0]?.emailAddress || '', user.firstName || '');
    return <AutomationManager artist={artist}/>;
}
