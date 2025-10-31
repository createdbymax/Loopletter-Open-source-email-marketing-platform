import Link from 'next/link';
import { Metadata } from 'next';
import { errorMetadataConfig } from '@/lib/metadata-config';
export const metadata: Metadata = errorMetadataConfig[404];
export default function NotFound() {
    return (<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎵</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          
          <p className="text-gray-600 mb-8">
            Looks like this page hit a wrong note. Let's get you back to making music connections.
          </p>
          
          <div className="space-y-4">
            <Link href="/" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
              Go Home
            </Link>
            
            <Link href="/dashboard" className="block w-full text-gray-600 hover:text-gray-800 font-medium py-3 px-6 rounded-xl border border-gray-300 hover:border-gray-400 transition-colors">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>);
}
