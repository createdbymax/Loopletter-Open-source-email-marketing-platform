import { Metadata } from 'next';
import { utilityMetadataConfig } from '@/lib/metadata-config';

export const metadata: Metadata = utilityMetadataConfig.preferences;

export default function PreferencesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}