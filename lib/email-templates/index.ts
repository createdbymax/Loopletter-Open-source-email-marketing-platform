import musicReleaseTemplate from './music-release.json';
import showAnnouncementTemplate from './show-announcement.json';
import merchandiseTemplate from './merchandise.json';
import newsletterTemplate from './newsletter.json';
import blankTemplate from './blank.json';
import artistPromoTemplate from './artist-promo.json';
export interface EmailTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    content: any;
}
export const emailTemplates: EmailTemplate[] = [
    {
        id: 'blank',
        name: 'Blank Template',
        description: 'Start with a clean slate and design your email from scratch',
        category: 'Basic',
        content: blankTemplate
    },
    {
        id: 'music-release',
        name: 'Music Release',
        description: 'Announce your new single, EP, or album with streaming links and artwork',
        category: 'Music',
        content: musicReleaseTemplate
    },
    {
        id: 'show-announcement',
        name: 'Show Announcement',
        description: 'Promote your upcoming concerts and live performances with venue details',
        category: 'Events',
        content: showAnnouncementTemplate
    },
    {
        id: 'merchandise',
        name: 'Merchandise',
        description: 'Showcase your latest merch drops with product images and pricing',
        category: 'Commerce',
        content: merchandiseTemplate
    },
    {
        id: 'newsletter',
        name: 'Artist Newsletter',
        description: 'Keep your fans updated with news, tour dates, and more',
        category: 'Updates',
        content: newsletterTemplate
    },
    {
        id: 'artist-promo',
        name: 'Artist Promo',
        description: 'Promote your artist with a visually striking, image-focused email',
        category: 'Promo',
        content: artistPromoTemplate
    }
];
export function getEmailTemplate(id: string): EmailTemplate | undefined {
    return emailTemplates.find(template => template.id === id);
}
export function getEmailTemplateContent(id: string): unknown {
    if (id === 'blank') {
        return blankTemplate;
    }
    const template = getEmailTemplate(id);
    return template ? template.content : blankTemplate;
}
