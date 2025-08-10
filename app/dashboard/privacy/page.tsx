import { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import { PrivacyDashboard } from '@/components/privacy/privacy-dashboard';

export const metadata: Metadata = {
  title: 'Privacy Compliance - Loopletter',
  description: 'Manage GDPR and CCPA compliance, data subject requests, and privacy settings',
};

export default async function PrivacyPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const artist = await getOrCreateArtistByClerkId(userId, '', '');

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Privacy Compliance</h1>
        <p className="text-muted-foreground mt-2">
          Manage GDPR and CCPA compliance, data subject requests, and privacy settings
        </p>
      </div>

      <PrivacyDashboard artistId={artist.id} />
    </div>
  );
}