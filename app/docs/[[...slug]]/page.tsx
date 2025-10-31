import { getPage, getPages } from '@/lib/source';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
interface PageProps {
    params: Promise<{
        slug?: string[];
    }>;
}
export default async function Page({ params }: PageProps) {
    const { slug } = await params;
    try {
        const page = getPage(slug);
        if (!page)
            notFound();
        const MDX = page.data.body;
        return (<div className="prose prose-gray max-w-none">
        <h1>{page.data.title}</h1>
        {page.data.description && (<p className="mb-8 text-lg text-muted-foreground">
            {page.data.description}
          </p>)}
        <MDX />
      </div>);
    }
    catch (error) {
        console.error('Error rendering docs page:', error);
        return (<div className="p-8">
        <h1>Documentation Error</h1>
        <p>There was an error loading this documentation page.</p>
      </div>);
    }
}
export async function generateStaticParams() {
    try {
        return getPages().map((page) => ({
            slug: page.slugs,
        }));
    }
    catch (error) {
        console.error('Error generating static params for docs:', error);
        return [];
    }
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = getPage(slug);
    if (!page)
        notFound();
    return {
        title: page.data.title,
        description: page.data.description,
        openGraph: {
            title: page.data.title,
            description: page.data.description,
            type: 'article',
            url: `/docs/${page.slugs.join('/')}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: page.data.title,
            description: page.data.description,
        },
    };
}
