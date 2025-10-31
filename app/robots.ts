import { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://loopletter.co';
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/dashboard/*',
                    '/api/*',
                    '/admin/*',
                    '/team/*',
                    '/unsubscribe/*',
                    '/preferences/*',
                    '/_next/*',
                    '/static/*',
                ],
            },
            {
                userAgent: 'GPTBot',
                allow: '/',
                disallow: [
                    '/dashboard/*',
                    '/api/*',
                    '/admin/*',
                    '/team/*',
                    '/unsubscribe/*',
                    '/preferences/*',
                ],
            },
            {
                userAgent: 'ChatGPT-User',
                allow: '/',
                disallow: [
                    '/dashboard/*',
                    '/api/*',
                    '/admin/*',
                    '/team/*',
                    '/unsubscribe/*',
                    '/preferences/*',
                ],
            },
            {
                userAgent: 'CCBot',
                allow: '/',
                disallow: [
                    '/dashboard/*',
                    '/api/*',
                    '/admin/*',
                    '/team/*',
                    '/unsubscribe/*',
                    '/preferences/*',
                ],
            },
            {
                userAgent: 'anthropic-ai',
                allow: '/',
                disallow: [
                    '/dashboard/*',
                    '/api/*',
                    '/admin/*',
                    '/team/*',
                    '/unsubscribe/*',
                    '/preferences/*',
                ],
            },
            {
                userAgent: 'Claude-Web',
                allow: '/',
                disallow: [
                    '/dashboard/*',
                    '/api/*',
                    '/admin/*',
                    '/team/*',
                    '/unsubscribe/*',
                    '/preferences/*',
                ],
            },
            {
                userAgent: 'Google-Extended',
                disallow: '/',
            },
            {
                userAgent: 'PerplexityBot',
                disallow: '/',
            },
            {
                userAgent: 'YouBot',
                disallow: '/',
            },
            {
                userAgent: 'FacebookBot',
                disallow: '/',
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
