import { Metadata } from 'next';
import { generateDashboardMetadata, generateMarketingMetadata } from './metadata';

// Dashboard page metadata configurations
export const dashboardMetadataConfig = {
  overview: generateDashboardMetadata(
    'Dashboard',
    'Your LoopLetter dashboard. Manage campaigns, track fans, analyze performance, and grow your music career with email marketing.'
  ),
  
  campaigns: generateDashboardMetadata(
    'Campaigns',
    'Create and manage email campaigns. Send newsletters, announcements, and updates to your fans with professional email marketing tools.'
  ),
  
  'campaigns/create': generateDashboardMetadata(
    'Create Campaign',
    'Create a new email campaign. Choose templates, customize content, and send professional emails to your fanbase.'
  ),
  
  fans: generateDashboardMetadata(
    'Audience',
    'Manage your fan database. View subscribers, track engagement, segment your audience, and grow your fanbase.'
  ),
  
  subscription: generateDashboardMetadata(
    'Fan Signup',
    'Manage your subscription page, customize your fan signup experience, and generate embeddable widgets to grow your fanbase.'
  ),
  
  segments: generateDashboardMetadata(
    'Segments',
    'Create and manage audience segments. Target specific groups of fans with personalized email campaigns.'
  ),
  
  automations: generateDashboardMetadata(
    'Automations',
    'Set up automated email sequences. Welcome new fans, nurture relationships, and engage your audience automatically.'
  ),
  
  templates: generateDashboardMetadata(
    'Templates',
    'Manage email templates. Create, edit, and organize professional email designs for your campaigns.'
  ),
  
  analytics: generateDashboardMetadata(
    'Analytics',
    'Track your email marketing performance. Monitor open rates, click rates, subscriber growth, and campaign success.'
  ),
  
  team: generateDashboardMetadata(
    'Team',
    'Manage team members and collaborators. Control access, assign roles, and work together on your email marketing.'
  ),
  
  settings: generateDashboardMetadata(
    'Settings',
    'Configure your account settings, branding, integrations, and email preferences for your LoopLetter account.'
  ),
};

// Marketing page metadata configurations
export const marketingMetadataConfig = {
  home: generateMarketingMetadata(
    'LoopLetter - Email Marketing for Independent Artists',
    'Stop depending on algorithms. Build direct relationships with your fans through email marketing that actually works. Free for up to 500 fans.',
    '/',
    [
      'email marketing for musicians',
      'independent artist tools',
      'musician newsletter',
      'fan engagement platform',
      'artist email marketing',
      'music marketing tools',
      'direct fan communication',
      'artist newsletter platform',
      'musician email campaigns',
      'independent music promotion'
    ]
  ),
  
  pricing: generateMarketingMetadata(
    'Pricing - LoopLetter',
    'Simple, transparent pricing for independent artists. Start free with up to 500 fans, then scale as you grow. No hidden fees.',
    '/pricing',
    [
      'email marketing pricing',
      'musician tools pricing',
      'artist newsletter cost',
      'free email marketing',
      'affordable music marketing'
    ]
  ),
  
  features: generateMarketingMetadata(
    'Features - LoopLetter',
    'Discover all the features built specifically for independent artists. Email campaigns, fan management, analytics, and more.',
    '/features',
    [
      'email marketing features',
      'musician tools features',
      'artist newsletter features',
      'music marketing platform',
      'fan engagement tools'
    ]
  ),
  
  templates: generateMarketingMetadata(
    'Email Templates - LoopLetter',
    'Professional email templates designed for musicians. Album releases, tour announcements, merchandise, and more.',
    '/templates',
    [
      'music email templates',
      'artist newsletter templates',
      'musician email designs',
      'music marketing templates',
      'band email templates'
    ]
  ),
  
  about: generateMarketingMetadata(
    'About - LoopLetter',
    'Learn about LoopLetter and our mission to help independent artists build direct relationships with their fans through email.',
    '/about',
    [
      'about loopletter',
      'music marketing company',
      'independent artist platform',
      'email marketing for musicians'
    ]
  ),
  
  contact: generateMarketingMetadata(
    'Contact - LoopLetter',
    'Get in touch with the LoopLetter team. We\'re here to help independent artists succeed with email marketing.',
    '/contact',
    [
      'contact loopletter',
      'email marketing support',
      'musician platform support',
      'artist tools help'
    ]
  ),
  
  blog: generateMarketingMetadata(
    'Blog - LoopLetter',
    'Email marketing tips, music industry insights, and success stories from independent artists using LoopLetter.',
    '/blog',
    [
      'music marketing blog',
      'email marketing tips',
      'independent artist advice',
      'musician marketing strategies',
      'music industry insights'
    ]
  ),
};

// Utility page metadata
export const utilityMetadataConfig = {
  unsubscribe: {
    title: 'Unsubscribe - LoopLetter',
    description: 'Unsubscribe from email updates. We\'re sorry to see you go, but you can always resubscribe later.',
    robots: {
      index: false,
      follow: false,
    },
  } as Metadata,
  
  preferences: {
    title: 'Email Preferences - LoopLetter',
    description: 'Manage your email preferences and subscription settings. Control what emails you receive and how often.',
    robots: {
      index: false,
      follow: false,
    },
  } as Metadata,
  
  'sign-in': {
    title: 'Sign In - LoopLetter',
    description: 'Sign in to your LoopLetter account. Access your dashboard, manage campaigns, and connect with your fans.',
    robots: {
      index: false,
      follow: false,
    },
  } as Metadata,
  
  'sign-up': {
    title: 'Sign Up - LoopLetter',
    description: 'Create your free LoopLetter account. Start building direct relationships with your fans through email marketing.',
    robots: {
      index: true,
      follow: true,
    },
  } as Metadata,
};

// Error page metadata
export const errorMetadataConfig = {
  404: {
    title: '404 - Page Not Found | LoopLetter',
    description: 'The page you\'re looking for doesn\'t exist. Return to LoopLetter and continue building relationships with your fans.',
    robots: {
      index: false,
      follow: false,
    },
  } as Metadata,
  
  500: {
    title: '500 - Server Error | LoopLetter',
    description: 'Something went wrong on our end. We\'re working to fix it. Please try again later.',
    robots: {
      index: false,
      follow: false,
    },
  } as Metadata,
};