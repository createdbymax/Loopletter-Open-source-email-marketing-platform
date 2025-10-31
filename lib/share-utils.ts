export interface ShareUrlOptions {
    baseUrl?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    ref?: string;
}
export function generateEarlyAccessUrl(options: ShareUrlOptions = {}): string {
    const { baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://loopletter.co', utm_source, utm_medium, utm_campaign, ref } = options;
    const url = new URL(baseUrl);
    url.searchParams.set('early-access', 'true');
    if (utm_source)
        url.searchParams.set('utm_source', utm_source);
    if (utm_medium)
        url.searchParams.set('utm_medium', utm_medium);
    if (utm_campaign)
        url.searchParams.set('utm_campaign', utm_campaign);
    if (ref)
        url.searchParams.set('ref', ref);
    return url.toString();
}
export const shareUrls = {
    social: (platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin' = 'twitter') => generateEarlyAccessUrl({
        utm_source: platform,
        utm_medium: 'social',
        utm_campaign: 'early_access'
    }),
    email: (source: string = 'email_signature') => generateEarlyAccessUrl({
        utm_source: source,
        utm_medium: 'email',
        utm_campaign: 'early_access'
    }),
    referral: (referrerName?: string) => generateEarlyAccessUrl({
        utm_source: 'referral',
        utm_medium: 'direct',
        utm_campaign: 'early_access',
        ref: referrerName
    }),
    campaign: (campaignName: string) => generateEarlyAccessUrl({
        utm_source: 'marketing',
        utm_medium: 'campaign',
        utm_campaign: campaignName
    }),
    press: (publication?: string) => generateEarlyAccessUrl({
        utm_source: publication || 'press',
        utm_medium: 'press',
        utm_campaign: 'early_access'
    })
};
export const socialShareUrls = {
    twitter: (customText?: string) => {
        const text = customText || "Just discovered Loopletter - the email marketing platform built specifically for artists! 🎵 Finally, a way to own your audience instead of chasing algorithms.";
        const url = shareUrls.social('twitter');
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    },
    facebook: () => {
        const url = shareUrls.social('facebook');
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    },
    linkedin: (customText?: string) => {
        const text = customText || "Loopletter: Email marketing platform built for artists. Stop chasing algorithms, start building a fanbase that belongs to you.";
        const url = shareUrls.social('linkedin');
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`;
    }
};
export async function copyEarlyAccessUrl(options: ShareUrlOptions = {}): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.clipboard) {
        return false;
    }
    try {
        const url = generateEarlyAccessUrl(options);
        await navigator.clipboard.writeText(url);
        return true;
    }
    catch (error) {
        console.error('Failed to copy URL:', error);
        return false;
    }
}
