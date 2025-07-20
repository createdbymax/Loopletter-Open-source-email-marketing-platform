# LoopLetter - Email Marketing Platform

LoopLetter is a comprehensive email marketing platform built specifically for artists and creators. The platform enables users to create, manage, and analyze email campaigns with advanced features for automation, analytics, segmentation, and deliverability optimization.

## Core Features

### Campaign Management
- Create, schedule, and send email campaigns
- A/B testing for subject lines, content, and send times
- Campaign performance tracking and analytics

### Audience Management
- Import fans via CSV upload or manual entry
- Segment audience based on various criteria
- Track subscriber engagement and preferences
- Automatic handling of bounces and complaints

### Email Deliverability
- Custom domain verification with AWS SES integration
- SPF, DKIM, and DMARC authentication setup
- Reputation monitoring and deliverability optimization
- Automatic bounce and complaint handling

### Analytics & Reporting
- Real-time campaign performance metrics
- Open, click, and engagement tracking
- Audience growth and engagement trends
- Exportable reports and data visualization

### Team Collaboration
- Role-based access control (owner, admin, editor, viewer)
- Team member invitations and permission management
- Collaborative campaign creation and management

### Subscription & Billing
- Tiered subscription plans (Starter, Independent, Label/Agency)
- Stripe integration for payment processing
- Subscription management and billing history

## User Roles

### Platform Users
- **Artists**: Primary account owners who manage their email marketing
- **Team Members**: Collaborators with different permission levels
  - **Owner**: Full access to all features and billing
  - **Admin**: Full access except billing management
  - **Editor**: Can create and edit content but not manage settings or team
  - **Viewer**: Read-only access to campaigns and analytics

### Audience
- **Fans**: Subscribers who receive emails and can manage preferences
  - Can subscribe/unsubscribe
  - Can update preferences
  - Can view emails in browser

## Key Workflows

### Email Campaign Lifecycle
1. **Creation**: Design campaign using templates or custom HTML
2. **Targeting**: Select audience segments to receive the campaign
3. **Testing**: Preview and test emails before sending
4. **Scheduling**: Set send time or send immediately
5. **Delivery**: Emails sent through AWS SES
6. **Tracking**: Monitor opens, clicks, and other engagement metrics
7. **Analysis**: Review performance and optimize future campaigns

### Fan Management
1. **Acquisition**: Fans subscribe through embedded forms or are imported
2. **Segmentation**: Fans are categorized based on attributes and behavior
3. **Engagement**: Fans receive targeted campaigns
4. **Tracking**: Fan activity and preferences are monitored
5. **Maintenance**: Bounces and unsubscribes are automatically processed

### Domain Setup & Deliverability
1. **Domain Configuration**: Artists add and verify their sending domain
2. **DNS Setup**: Add SPF, DKIM, and DMARC records
3. **Verification**: System verifies DNS records are properly configured
4. **Monitoring**: Track domain reputation and deliverability metrics

### Subscription Management
1. **Plan Selection**: Artists choose a subscription tier
2. **Payment**: Process payment through Stripe
3. **Feature Access**: Features are enabled based on subscription level
4. **Renewal**: Subscriptions automatically renew until canceled

When working with this codebase, always consider the user experience for both artists (the platform users) and fans (the email recipients), with special attention to privacy, deliverability, and analytics.