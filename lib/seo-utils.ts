// SEO utility functions for Loopletter

// Generate canonical URL
export function generateCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}${path}`;
}

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
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

// Generate FAQ structured data
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
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

// Generate article structured data for blog posts
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

// Generate organization structured data
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
      email: 'support@loopletter.com',
    },
  };
}

// Clean and optimize meta descriptions
export function optimizeMetaDescription(description: string, maxLength: number = 160): string {
  if (description.length <= maxLength) {
    return description;
  }
  
  // Truncate at word boundary
  const truncated = description.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

// Generate keywords from text content
export function generateKeywords(content: string, artistName?: string): string[] {
  const baseKeywords = [
    'email marketing',
    'independent artists',
    'musician newsletter',
    'fan engagement',
    'music marketing',
  ];
  
  if (artistName) {
    baseKeywords.push(
      artistName,
      `${artistName} newsletter`,
      `${artistName} updates`,
      `${artistName} fan club`
    );
  }
  
  // Extract relevant keywords from content (simplified)
  const contentWords = content
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 10);
  
  return [...baseKeywords, ...contentWords].slice(0, 15);
}

// Validate metadata completeness
export function validateMetadata(metadata: any): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!metadata.title) {
    issues.push('Missing title');
  } else if (metadata.title.length > 60) {
    issues.push('Title too long (max 60 characters)');
  }
  
  if (!metadata.description) {
    issues.push('Missing description');
  } else if (metadata.description.length > 160) {
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