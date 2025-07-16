import { notFound } from 'next/navigation';
import { getArtistBySlug } from '@/lib/db';
import { generateArtistSubscriptionMetadata, generateArtistStructuredData } from '@/lib/metadata';
import SubscriptionForm from './subscription-form';

interface SubscribePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SubscribePage({ params }: SubscribePageProps) {
  try {
    const resolvedParams = await params;
    const artistSlug = resolvedParams.slug;
    
    const artist = await getArtistBySlug(artistSlug);
    const structuredData = generateArtistStructuredData(artist);
    
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto">
              <SubscriptionForm artist={artist} />
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error('Error loading artist:', error);
    
    // Instead of notFound(), show a helpful message
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Artist Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                We couldn&apos;t find an artist with this link. The artist may not have set up their subscription page yet.
              </p>
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Go to LoopLetter
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export async function generateMetadata({ params }: SubscribePageProps) {
  try {
    const resolvedParams = await params;
    const artist = await getArtistBySlug(resolvedParams.slug);
    
    return generateArtistSubscriptionMetadata(artist);
  } catch {
    return {
      title: 'Subscribe | LoopLetter',
      description: 'Subscribe to get exclusive updates from your favorite artist.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}