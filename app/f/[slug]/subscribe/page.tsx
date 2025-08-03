
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
        <div className="min-h-screen bg-gray-950 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          {/* Subtle glow effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
            <div className="max-w-lg w-full">
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
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg w-full">
            <div className="bg-gray-900/50 border-gray-800/50 backdrop-blur-xl shadow-2xl rounded-xl p-8 text-center">
              <h1 className="text-2xl font-bold text-white mb-4">
                Artist Not Found
              </h1>
              <p className="text-gray-400 mb-6">
                We couldn&apos;t find an artist with this link. The artist may not have set up their subscription page yet.
              </p>
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25"
              >
                Go to Loopletter
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
      title: 'Subscribe | Loopletter',
      description: 'Subscribe to get exclusive updates from your favorite artist.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}