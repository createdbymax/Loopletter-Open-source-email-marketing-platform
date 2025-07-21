# Loopletter Project Structure

## Directory Organization

### `/app` - Next.js App Router Structure
- `/app/api` - API routes organized by feature
  - `/analytics` - Analytics-related endpoints
  - `/campaigns` - Campaign management endpoints
  - `/domain` - Domain verification and management
  - `/fans` - Subscriber management
  - `/segments` - Segment creation and management
  - `/ses` - AWS SES integration endpoints
  - `/track` - Email tracking (opens, clicks)
  - `/unsubscribe` - Unsubscribe handling
  - `/webhooks` - External service webhooks
    - `/stripe` - Stripe payment webhooks
    - `/ses` - AWS SES email event webhooks
- `/app/dashboard` - Dashboard pages and components
  - `/analytics` - Analytics views and dashboard
  - `/automations` - Automation management
  - `/campaigns` - Campaign creation and management
  - `/domain` - Domain verification and setup
  - `/fans` - Subscriber management and import
  - `/segments` - Segment creation and management
  - `/settings` - User settings
  - `/subscription` - Subscription management
  - `/team` - Team management
  - `/templates` - Email template management
- `/app/f/[slug]` - Public-facing subscription pages
- `/app/team` - Team invitation and management
- `/app/unsubscribe` - Unsubscribe flow
- `/app/preferences` - Subscriber preference management

### `/components` - Reusable UI Components
- `/ui` - UI component library based on Radix UI and Tailwind

### `/lib` - Core Utilities and Services
- `db.ts` - Database access functions
- `email-sender.ts` - Email sending functionality
- `rbac.ts` - Role-based access control
- `subscription.ts` - Subscription management
- `supabase.ts` - Supabase client configuration
- `types.ts` - TypeScript type definitions

### `/scripts` - Utility Scripts
- `/migrations` - Database migration scripts

### `/__tests__` - Test Files
- `/api` - API endpoint tests
- `/lib` - Utility function tests

## Architectural Patterns

### Data Flow
1. UI components in `/app/dashboard` trigger actions
2. API routes in `/app/api` handle requests
3. Database functions in `/lib/db.ts` interact with Supabase
4. Email sending handled by `/lib/email-sender.ts` via AWS SES

### Component Organization
- Page components define routes and layouts
- Feature components implement specific functionality (e.g., `fan-import.tsx`, `segment-builder.tsx`)
- UI components provide reusable interface elements

### API Structure
- Route handlers follow Next.js App Router conventions
- Each endpoint has a dedicated file with HTTP method handlers
- Authentication middleware protects private endpoints
- Webhook handlers process external service events

### Authentication & Authorization
- Clerk handles user authentication
- Custom RBAC system in `lib/rbac.ts` manages permissions
- Team members have role-based access to features

## Naming Conventions

- **Files**: Kebab-case for component files (`campaign-builder.tsx`)
- **Components**: PascalCase for component names (`CampaignBuilder`)
- **Functions**: camelCase for functions (`getCampaignById`)
- **API Routes**: Organized by feature and functionality
- **Database Functions**: Named by action and entity (`createCampaign`, `getFanById`)

## State Management

- React hooks for local component state
- API calls for server state
- No global state management library identified

## Key Integration Points

- **Authentication**: Clerk for user authentication and management
- **Database**: Supabase (PostgreSQL) for data storage
- **Email Delivery**: AWS SES for sending emails
- **Payment Processing**: Stripe for subscription management
- **UI Components**: Radix UI with Tailwind CSS for styling
- **Data Visualization**: Recharts for analytics dashboards

## Testing Strategy

- Jest for unit and integration tests
- API endpoint tests in `/__tests__/api`
- Utility function tests in `/__tests__/lib`

## Feature Gates

- Subscription-based feature access
- `FeatureGate` component controls access to premium features
- Features are enabled based on the user's subscription plan