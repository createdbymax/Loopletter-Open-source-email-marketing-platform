'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const navigation = [
  {
    title: 'Getting Started',
    href: '/docs/getting-started',
    items: [
      { title: 'Overview', href: '/docs/getting-started' },
      { title: 'Profile Setup', href: '/docs/getting-started/profile-setup' },
    ],
  },
  {
    title: 'Campaigns',
    href: '/docs/campaigns',
    items: [
      { title: 'Creating Campaigns', href: '/docs/campaigns/creating-campaigns' },
      { title: 'A/B Testing', href: '/docs/campaigns/ab-testing' },
      { title: 'Scheduling', href: '/docs/campaigns/scheduling' },
    ],
  },
  {
    title: 'Audience',
    href: '/docs/audience',
    items: [
      { title: 'Importing Fans', href: '/docs/audience/importing-fans' },
      { title: 'Segmentation', href: '/docs/audience/segmentation' },
      { title: 'Management', href: '/docs/audience/management' },
    ],
  },
  {
    title: 'Analytics',
    href: '/docs/analytics',
    items: [
      { title: 'Overview', href: '/docs/analytics' },
      { title: 'Campaign Performance', href: '/docs/analytics/campaigns' },
      { title: 'Deliverability', href: '/docs/analytics/deliverability' },
    ],
  },
  {
    title: 'Domain Setup',
    href: '/docs/domain-setup',
    items: [
      { title: 'Getting Started', href: '/docs/domain-setup' },
      { title: 'DNS Configuration', href: '/docs/domain-setup/dns' },
      { title: 'Troubleshooting', href: '/docs/domain-setup/troubleshooting' },
    ],
  },
  {
    title: 'Automation',
    href: '/docs/automation',
    items: [
      { title: 'Overview', href: '/docs/automation' },
      { title: 'Welcome Series', href: '/docs/automation/welcome-series' },
      { title: 'Triggers', href: '/docs/automation/triggers' },
    ],
  },
  {
    title: 'Team Management',
    href: '/docs/team',
    items: [
      { title: 'Overview', href: '/docs/team' },
      { title: 'Roles & Permissions', href: '/docs/team/roles' },
      { title: 'Invitations', href: '/docs/team/invitations' },
    ],
  },
  {
    title: 'Integrations',
    href: '/docs/integrations',
    items: [
      { title: 'Overview', href: '/docs/integrations' },
      { title: 'API', href: '/docs/integrations/api' },
      { title: 'Webhooks', href: '/docs/integrations/webhooks' },
    ],
  },
  {
    title: 'Troubleshooting',
    href: '/docs/troubleshooting',
    items: [
      { title: 'Common Issues', href: '/docs/troubleshooting' },
      { title: 'FAQ', href: '/docs/troubleshooting/faq' },
      { title: 'Contact Support', href: '/docs/troubleshooting/support' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<string[]>(() => {
    // Auto-open the section that contains the current page
    const currentSection = navigation.find(section => 
      pathname.startsWith(section.href) || 
      section.items?.some(item => pathname === item.href)
    );
    return currentSection ? [currentSection.title] : [];
  });

  const toggleSection = (title: string) => {
    setOpenSections(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  return (
    <aside className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-4">
        <nav className="space-y-2">
          {navigation.map((section) => {
            const isOpen = openSections.includes(section.title);
            const isActive = pathname.startsWith(section.href);
            
            return (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground"
                  )}
                >
                  <span>{section.title}</span>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {isOpen && section.items && (
                  <div className="ml-4 mt-1 space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "block rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                          pathname === item.href && "bg-accent text-accent-foreground font-medium"
                        )}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}