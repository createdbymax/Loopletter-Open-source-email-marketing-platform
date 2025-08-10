import { Metadata } from 'next';
import { DataSubjectRequestForm } from '@/components/privacy/data-subject-request-form';

export const metadata: Metadata = {
  title: 'Data Subject Request - Loopletter',
  description: 'Exercise your privacy rights under GDPR and CCPA regulations',
};

interface PrivacyRequestPageProps {
  searchParams: Promise<{
    artist?: string;
  }>;
}

export default async function PrivacyRequestPage({ searchParams }: PrivacyRequestPageProps) {
  const { artist: artistId } = await searchParams;

  if (!artistId) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Data Subject Request</h1>
          <p className="text-muted-foreground mb-8">
            Invalid or missing artist identifier. Please use the correct link provided by the artist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Data Subject Request</h1>
          <p className="text-muted-foreground">
            Exercise your privacy rights under GDPR and CCPA regulations
          </p>
        </div>

        <DataSubjectRequestForm 
          artistId={artistId}
          onRequestSubmitted={(requestId) => {
            console.log('Request submitted:', requestId);
          }}
        />

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            This form is provided in compliance with GDPR and CCPA regulations.
            <br />
            For questions about our privacy practices, please contact our Data Protection Officer.
          </p>
        </div>
      </div>
    </div>
  );
}