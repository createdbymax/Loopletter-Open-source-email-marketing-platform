import { docs, meta } from '@/.source';
import { createMDXSource } from 'fumadocs-mdx';
import { loader } from 'fumadocs-core/source';
export const source = loader({
    baseUrl: '/docs',
    source: createMDXSource(docs, meta),
});
export const getPage = source.getPage;
export const getPages = source.getPages;
export const pageTree = {
    name: 'Loopletter Docs',
    children: [
        {
            type: 'page',
            name: 'Introduction',
            url: '/docs',
        },
        {
            type: 'folder',
            name: 'Getting Started',
            children: [
                {
                    type: 'page',
                    name: 'Overview',
                    url: '/docs/getting-started',
                },
                {
                    type: 'page',
                    name: 'Profile Setup',
                    url: '/docs/getting-started/profile-setup',
                },
            ],
        },
        {
            type: 'folder',
            name: 'Campaigns',
            children: [
                {
                    type: 'page',
                    name: 'Creating Campaigns',
                    url: '/docs/campaigns/creating-campaigns',
                },
                {
                    type: 'page',
                    name: 'A/B Testing',
                    url: '/docs/campaigns/ab-testing',
                },
                {
                    type: 'page',
                    name: 'Scheduling',
                    url: '/docs/campaigns/scheduling',
                },
            ],
        },
        {
            type: 'folder',
            name: 'Audience',
            children: [
                {
                    type: 'page',
                    name: 'Importing Fans',
                    url: '/docs/audience/importing-fans',
                },
                {
                    type: 'page',
                    name: 'Segmentation',
                    url: '/docs/audience/segmentation',
                },
                {
                    type: 'page',
                    name: 'Management',
                    url: '/docs/audience/management',
                },
            ],
        },
        {
            type: 'folder',
            name: 'Analytics',
            children: [
                {
                    type: 'page',
                    name: 'Overview',
                    url: '/docs/analytics',
                },
                {
                    type: 'page',
                    name: 'Campaign Performance',
                    url: '/docs/analytics/campaigns',
                },
                {
                    type: 'page',
                    name: 'Deliverability',
                    url: '/docs/analytics/deliverability',
                },
            ],
        },
        {
            type: 'folder',
            name: 'Domain Setup',
            children: [
                {
                    type: 'page',
                    name: 'Getting Started',
                    url: '/docs/domain-setup',
                },
                {
                    type: 'page',
                    name: 'DNS Configuration',
                    url: '/docs/domain-setup/dns',
                },
                {
                    type: 'page',
                    name: 'Troubleshooting',
                    url: '/docs/domain-setup/troubleshooting',
                },
            ],
        },
        {
            type: 'folder',
            name: 'Automation',
            children: [
                {
                    type: 'page',
                    name: 'Overview',
                    url: '/docs/automation',
                },
                {
                    type: 'page',
                    name: 'Welcome Series',
                    url: '/docs/automation/welcome-series',
                },
                {
                    type: 'page',
                    name: 'Triggers',
                    url: '/docs/automation/triggers',
                },
            ],
        },
        {
            type: 'folder',
            name: 'Team Management',
            children: [
                {
                    type: 'page',
                    name: 'Overview',
                    url: '/docs/team',
                },
                {
                    type: 'page',
                    name: 'Roles & Permissions',
                    url: '/docs/team/roles',
                },
                {
                    type: 'page',
                    name: 'Invitations',
                    url: '/docs/team/invitations',
                },
            ],
        },
        {
            type: 'folder',
            name: 'Integrations',
            children: [
                {
                    type: 'page',
                    name: 'Overview',
                    url: '/docs/integrations',
                },
                {
                    type: 'page',
                    name: 'API',
                    url: '/docs/integrations/api',
                },
                {
                    type: 'page',
                    name: 'Webhooks',
                    url: '/docs/integrations/webhooks',
                },
            ],
        },
        {
            type: 'folder',
            name: 'Troubleshooting',
            children: [
                {
                    type: 'page',
                    name: 'Common Issues',
                    url: '/docs/troubleshooting',
                },
                {
                    type: 'page',
                    name: 'FAQ',
                    url: '/docs/troubleshooting/faq',
                },
                {
                    type: 'page',
                    name: 'Contact Support',
                    url: '/docs/troubleshooting/support',
                },
            ],
        },
    ],
};
