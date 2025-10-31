export function generateCanonicalUrl(path: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}${path}`;
}
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{
    name: string;
    url: string;
}>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: crumb.url,
        })),
    };
}
export function generateFAQStructuredData(faqs: Array<{
    question: string;
    answer: string;
}>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}
export function generateArticleStructuredData(article: {
    title: string;
    description: string;
    author: string;
    publishedDate: string;
    modifiedDate?: string;
    imageUrl?: string;
    url: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        author: {
            '@type': 'Person',
            name: article.author,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Loopletter',
            logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
            },
        },
        datePublished: article.publishedDate,
        dateModified: article.modifiedDate || article.publishedDate,
        image: article.imageUrl,
        url: article.url,
    };
}
export function generateOrganizationStructuredData() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Loopletter',
        description: 'Email marketing platform for independent artists',
        url: process.env.NEXT_PUBLIC_APP_URL,
        logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
        sameAs: [
            'https://twitter.com/loopletter',
            'https://instagram.com/loopletter',
            'https://linkedin.com/company/loopletter',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'support@loopletter.co',
        },
    };
}
export function optimizeMetaDescription(description: string, maxLength: number = 160): string {
    if (description.length <= maxLength) {
        return description;
    }
    const truncated = description.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
        return truncated.substring(0, lastSpace) + '...';
    }
    return truncated + '...';
}
export function generateKeywords(content: string, artistName?: string): string[] {
    const baseKeywords = [
        'email marketing',
        'independent artists',
        'musician newsletter',
        'fan engagement',
        'music marketing',
    ];
    if (artistName) {
        baseKeywords.push(artistName, `${artistName} newsletter`, `${artistName} updates`, `${artistName} fan club`);
    }
    const contentWords = content
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 10);
    return [...baseKeywords, ...contentWords].slice(0, 15);
}
export function validateMetadata(metadata: any): {
    isValid: boolean;
    issues: string[];
} {
    const issues: string[] = [];
    if (!metadata.title) {
        issues.push('Missing title');
    }
    else if (metadata.title.length > 60) {
        issues.push('Title too long (max 60 characters)');
    }
    if (!metadata.description) {
        issues.push('Missing description');
    }
    else if (metadata.description.length > 160) {
        issues.push('Description too long (max 160 characters)');
    }
    if (!metadata.openGraph?.title) {
        issues.push('Missing Open Graph title');
    }
    if (!metadata.openGraph?.description) {
        issues.push('Missing Open Graph description');
    }
    if (!metadata.openGraph?.images?.length) {
        issues.push('Missing Open Graph image');
    }
    return {
        isValid: issues.length === 0,
        issues,
    };
}
