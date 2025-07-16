import { Metadata } from 'next';
import { utilityMetadataConfig } from '@/lib/metadata-config';

export const metadata: Metadata = utilityMetadataConfig.unsubscribe;

export default function UnsubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}