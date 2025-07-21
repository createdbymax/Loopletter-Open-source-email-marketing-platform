# Loopletter - Full-Fledged Email Marketing Platform

A comprehensive email marketing platform built for artists and creators, featuring advanced automation, analytics, segmentation, and deliverability optimization.

## 🚀 Features

### Core Email Marketing
- **Campaign Management**: Create, schedule, and send email campaigns
- **Template System**: Visual template builder with drag-and-drop functionality
- **Audience Management**: Import, segment, and manage subscribers
- **Advanced Analytics**: Real-time performance tracking and insights
- **A/B Testing**: Test subject lines, content, send times, and more

### Automation & Workflows
- **Email Automations**: Welcome series, drip campaigns, behavioral triggers
- **Smart Segmentation**: Dynamic audience segments based on behavior and data
- **Personalization**: Dynamic content based on subscriber data
- **Send Time Optimization**: AI-powered optimal send time detection

### Deliverability & Compliance
- **AWS SES Integration**: Enterprise-grade email delivery
- **Domain Authentication**: SPF, DKIM, DMARC setup and monitoring
- **Bounce & Complaint Handling**: Automatic list hygiene
- **Unsubscribe Management**: One-click unsubscribe and preference center
- **GDPR Compliance**: Double opt-in, data export, and deletion tools

### Analytics & Insights
- **Real-time Metrics**: Open rates, click rates, conversions
- **Advanced Reporting**: Campaign performance, audience growth, revenue attribution
- **Engagement Tracking**: Heat maps, link tracking, device analytics
- **Comparative Analysis**: Industry benchmarks and historical trends

### Team & Collaboration
- **Multi-user Support**: Role-based permissions (Owner, Admin, Editor, Viewer)
- **Team Management**: Invite collaborators with granular permissions
- **Activity Logs**: Track changes and campaign history
- **White-label Options**: Custom branding and domain setup

### Integrations & API
- **E-commerce**: Shopify, WooCommerce, Stripe integration
- **Social Media**: Instagram, Twitter, Spotify for Artists
- **Automation**: Zapier, webhooks, custom API endpoints
- **Analytics**: Google Analytics, Facebook Pixel integration

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS, Lucide Icons
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Email Delivery**: AWS SES
- **Charts**: Recharts
- **Email Templates**: React Email
- **Rich Text Editor**: Novel (Tiptap)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/loopletter.git
   cd loopletter
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # AWS SES
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key

   # Application
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Set up the database**
   
   Run the following SQL in your Supabase SQL editor:
   ```sql
   -- Artists table
   CREATE TABLE artists (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     clerk_user_id TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL,
     email TEXT NOT NULL,
     bio TEXT,
     slug TEXT UNIQUE NOT NULL,
     ses_domain_verified BOOLEAN DEFAULT FALSE,
     ses_domain TEXT,
     ses_status TEXT,
     settings JSONB DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Fans table
   CREATE TABLE fans (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email TEXT NOT NULL,
     artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
     name TEXT,
     tags TEXT[],
     custom_fields JSONB DEFAULT '{}',
     status TEXT DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed', 'bounced', 'pending')),
     source TEXT DEFAULT 'manual',
     location JSONB DEFAULT '{}',
     preferences JSONB DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     confirmed_at TIMESTAMP WITH TIME ZONE,
     unsubscribed_at TIMESTAMP WITH TIME ZONE,
     UNIQUE(email, artist_id)
   );

   -- Campaigns table
   CREATE TABLE campaigns (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     subject TEXT NOT NULL,
     message TEXT NOT NULL,
     artwork_url TEXT,
     link TEXT,
     send_date TIMESTAMP WITH TIME ZONE NOT NULL,
     status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
     artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
     template_id UUID,
     template_data JSONB,
     segment_id UUID,
     ab_test_id UUID,
     settings JSONB DEFAULT '{}',
     stats JSONB DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Emails sent table
   CREATE TABLE emails_sent (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     fan_id UUID REFERENCES fans(id) ON DELETE CASCADE,
     campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
     email_address TEXT NOT NULL,
     status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'bounced', 'complained')),
     opened_at TIMESTAMP WITH TIME ZONE,
     clicked_at TIMESTAMP WITH TIME ZONE,
     bounced_at TIMESTAMP WITH TIME ZONE,
     complained_at TIMESTAMP WITH TIME ZONE,
     sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     message_id TEXT,
     error_message TEXT
   );

   -- Segments table
   CREATE TABLE segments (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
     conditions JSONB NOT NULL DEFAULT '[]',
     fan_count INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Automations table
   CREATE TABLE automations (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
     trigger JSONB NOT NULL,
     actions JSONB NOT NULL DEFAULT '[]',
     status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'paused', 'draft')),
     stats JSONB DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Templates table
   CREATE TABLE templates (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     category TEXT NOT NULL,
     thumbnail_url TEXT,
     html_content TEXT NOT NULL,
     variables JSONB DEFAULT '[]',
     is_public BOOLEAN DEFAULT FALSE,
     artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- AB Tests table
   CREATE TABLE ab_tests (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
     artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
     test_type TEXT NOT NULL,
     variants JSONB NOT NULL DEFAULT '[]',
     traffic_split INTEGER[] NOT NULL,
     winner_criteria TEXT NOT NULL,
     status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'cancelled')),
     winner_variant_id TEXT,
     started_at TIMESTAMP WITH TIME ZONE,
     completed_at TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Team Members table
   CREATE TABLE team_members (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
     email TEXT NOT NULL,
     name TEXT NOT NULL,
     role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
     permissions TEXT[] DEFAULT '{}',
     invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     joined_at TIMESTAMP WITH TIME ZONE,
     status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended'))
   );

   -- Integrations table
   CREATE TABLE integrations (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
     type TEXT NOT NULL,
     name TEXT NOT NULL,
     config JSONB DEFAULT '{}',
     status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),
     last_sync_at TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Webhooks table
   CREATE TABLE webhooks (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     url TEXT NOT NULL,
     events TEXT[] NOT NULL,
     secret TEXT,
     status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
     last_triggered_at TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Indexes for performance
   CREATE INDEX idx_fans_artist_id ON fans(artist_id);
   CREATE INDEX idx_fans_email ON fans(email);
   CREATE INDEX idx_fans_status ON fans(status);
   CREATE INDEX idx_campaigns_artist_id ON campaigns(artist_id);
   CREATE INDEX idx_campaigns_status ON campaigns(status);
   CREATE INDEX idx_emails_sent_campaign_id ON emails_sent(campaign_id);
   CREATE INDEX idx_emails_sent_fan_id ON emails_sent(fan_id);
   CREATE INDEX idx_segments_artist_id ON segments(artist_id);
   CREATE INDEX idx_automations_artist_id ON automations(artist_id);
   CREATE INDEX idx_templates_artist_id ON templates(artist_id);
   CREATE INDEX idx_templates_public ON templates(is_public);
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage

### Getting Started
1. **Sign up** with Clerk authentication
2. **Set up your profile** and artist information
3. **Import subscribers** via CSV or manual entry
4. **Create your first campaign** using templates
5. **Send and track** performance in analytics

### Key Workflows

#### Campaign Creation
1. Navigate to **Campaigns** → **Create Campaign**
2. Choose a template or start from scratch
3. Customize content and design
4. Select audience segment
5. Schedule or send immediately

#### Audience Segmentation
1. Go to **Segments** → **Create Segment**
2. Define conditions (tags, behavior, demographics)
3. Preview segment size
4. Use in campaigns and automations

#### Email Automation
1. Visit **Automations** → **Create Automation**
2. Set trigger (new subscriber, tag added, etc.)
3. Define action sequence
4. Activate automation

#### Analytics & Reporting
1. Check **Analytics** dashboard for overview
2. Drill down into campaign performance
3. Export data for external analysis
4. Monitor deliverability metrics

## 🔧 Configuration

### AWS SES Setup
1. Verify your sending domain in AWS SES
2. Set up SPF, DKIM, and DMARC records
3. Request production access (remove sandbox)
4. Configure SNS for bounce/complaint handling

### Domain Configuration
1. Add DNS records for authentication
2. Set up custom tracking domain
3. Configure SSL certificates
4. Test deliverability

### Integrations
1. Connect e-commerce platforms
2. Set up social media integrations
3. Configure webhooks for real-time data
4. Enable API access for custom integrations

## 📊 Analytics & Metrics

### Campaign Metrics
- **Delivery Rate**: Successfully delivered emails
- **Open Rate**: Percentage of emails opened
- **Click Rate**: Percentage of emails clicked
- **Conversion Rate**: Goal completions
- **Unsubscribe Rate**: List churn rate

### Audience Insights
- **Growth Rate**: New subscriber acquisition
- **Engagement Score**: Overall audience engagement
- **Segmentation Performance**: Segment-specific metrics
- **Geographic Distribution**: Subscriber locations

### Deliverability Monitoring
- **Bounce Rate**: Hard and soft bounces
- **Complaint Rate**: Spam complaints
- **Reputation Score**: Sender reputation
- **Blacklist Status**: Domain/IP blacklist monitoring

## 🔒 Security & Compliance

### Data Protection
- **Encryption**: All data encrypted at rest and in transit
- **Access Control**: Role-based permissions
- **Audit Logs**: Complete activity tracking
- **Data Backup**: Automated backups and recovery

### Compliance Features
- **GDPR**: Data export, deletion, and consent management
- **CAN-SPAM**: Automatic compliance features
- **Double Opt-in**: Confirmed subscription process
- **Unsubscribe**: One-click unsubscribe links

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Configure environment variables
3. Deploy with automatic CI/CD

### Docker
```bash
docker build -t loopletter .
docker run -p 3000:3000 loopletter
```

### Manual Deployment
1. Build the application: `npm run build`
2. Start the server: `npm start`
3. Configure reverse proxy (nginx/Apache)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.loopletter.com](https://docs.loopletter.com)
- **Community**: [Discord Server](https://discord.gg/loopletter)
- **Issues**: [GitHub Issues](https://github.com/yourusername/loopletter/issues)
- **Email**: support@loopletter.com

## 🎉 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components by [Radix UI](https://www.radix-ui.com/)
- Icons by [Lucide](https://lucide.dev/)
- Email delivery by [AWS SES](https://aws.amazon.com/ses/)
- Database by [Supabase](https://supabase.com/)

---

**Loopletter** - Empowering artists and creators with professional email marketing tools. 🎵📧
