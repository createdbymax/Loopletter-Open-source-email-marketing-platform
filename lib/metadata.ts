import { Metadata } from 'next';
import { Artist } from './types';

// Base metadata configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const SITE_NAME = 'Loopletter';
const SITE_DESCRIPTION = 'The email platform built for independent artists. Build direct relationships with your fans through email marketing that actually works.';

// Default metadata for the application
export const defaultMetadata: Metadata = {
    title: {
        template: `%s | ${SITE_NAME}`,
        default: `${SITE_NAME} - Email Marketing for Independent Artists`,
    },
    description: SITE_DESCRIPTION,
    keywords: [
        'email marketing',
        'independent artists',
        'musician email',
        'fan engagement',
        'artist newsletter',
        'music marketing',
        'email campaigns',
        'artist tools',
        'music promotion',
        'fan communication'
    ],
    authors: [{ name: 'Loopletter Team' }],
    creator: 'Loopletter',
    publisher: 'Loopletter',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(BASE_URL),
    alternates: {
        canonical: BASE_URL,
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: BASE_URL,
        siteName: SITE_NAME,
        title: `${SITE_NAME} - Email Marketing for Independent Artists`,
        description: SITE_DESCRIPTION,
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: `${SITE_NAME} - Email Marketing for Independent Artists`,
                type: 'image/png',
            },
        ],
        emails: ['hello@loopletter.com'],
        phoneNumbers: [],
        faxNumbers: [],
        alternateLocale: ['en_GB', 'en_CA'],
        countryName: 'United States',
    },
    twitter: {
        card: 'summary_large_image',
        title: `${SITE_NAME} - Email Marketing for Independent Artists`,
        description: SITE_DESCRIPTION,
        images: ['/og-image.png'],
        creator: '@loopletter',
        site: '@loopletter',
        creatorId: '@loopletter',
        siteId: '@loopletter',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
    },
};

// Generate metadata for artist subscription pages
export function generateArtistSubscriptionMetadata(artist: Artist): Metadata {
    const title = `Subscribe to ${artist.name}`;
    const description = `Join ${artist.name}'s inner circle and get exclusive updates, early access to new music, and behind-the-scenes content. Subscribe now for VIP access.`;
    const url = `${BASE_URL}/f/${artist.slug}/subscribe`;

    return {
        title,
        description,
        keywords: [
            artist.name,
            `${artist.name} newsletter`,
            `${artist.name} updates`,
            `${artist.name} fan club`,
            'music updates',
            'exclusive content',
            'artist newsletter',
            'music subscription',
            'fan updates',
            'music news'
        ],
        alternates: {
            canonical: url,
        },
        openGraph: {
            type: 'website',
            locale: 'en_US',
            url,
            siteName: SITE_NAME,
            title,
            description,
            images: [
                {
                    url: artist.settings?.subscription_page_settings?.header?.artist_image_url || '/og-artist-default.png',
                    width: 1200,
                    height: 630,
                    alt: `Subscribe to ${artist.name} - ${SITE_NAME}`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [artist.settings?.subscription_page_settings?.header?.artist_image_url || '/og-artist-default.png'],
        },
        other: {
            'artist:name': artist.name,
            'artist:slug': artist.slug,
            'music:genre': artist.bio || '',
        },
    };
}

// Generate metadata for dashboard pages
export function generateDashboardMetadata(
    pageTitle: string,
    pageDescription?: string
): Metadata {
    const title = `${pageTitle} - Dashboard`;
    const description = pageDescription || `Manage your ${pageTitle.toLowerCase()} on ${SITE_NAME}. Professional email marketing tools for independent artists.`;

    return {
        title,
        description,
        robots: {
            index: false, // Dashboard pages should not be indexed
            follow: false,
        },
        openGraph: {
            type: 'website',
            title,
            description,
            images: ['/og-dashboard.png'],
        },
    };
}

// Generate metadata for marketing pages
export function generateMarketingMetadata(
    pageTitle: string,
    pageDescription: string,
    pagePath: string,
    keywords?: string[]
): Metadata {
    const url = `${BASE_URL}${pagePath}`;

    return {
        title: pageTitle,
        description: pageDescription,
        keywords: keywords || [
            'email marketing',
            'independent artists',
            'music marketing',
            'artist tools',
        ],
        alternates: {
            canonical: url,
        },
        openGraph: {
            type: 'website',
            locale: 'en_US',
            url,
            siteName: SITE_NAME,
            title: pageTitle,
            description: pageDescription,
            images: ['/og-image.png'],
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: pageDescription,
            images: ['/og-image.png'],
        },
    };
}

// Generate structured data for artist pages
export function generateArtistStructuredData(artist: Artist) {
    return {
        '@context': 'https://schema.org',
        '@type': 'MusicGroup',
        name: artist.name,
        description: artist.bio || `${artist.name} is an independent artist using ${SITE_NAME} to connect with fans.`,
        url: `${BASE_URL}/f/${artist.slug}/subscribe`,
        sameAs: [
            artist.settings?.social_links?.website,
            artist.settings?.social_links?.spotify,
            artist.settings?.social_links?.instagram,
        ].filter(Boolean),
        contactPoint: {
            '@type': 'ContactPoint',
            email: artist.email,
            contactType: 'fan mail',
        },
    };
}

// Generate structured data for the main site
export function generateSiteStructuredData() {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: BASE_URL,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free tier available',
        },
        creator: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: BASE_URL,
        },
    };
}