# LoopLetter Technical Stack

## Core Technologies

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS, Lucide Icons
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Email Delivery**: AWS SES (Simple Email Service)
- **Payment Processing**: Stripe
- **Charts/Visualization**: Recharts
- **Email Templates**: React Email
- **Rich Text Editor**: Novel (Tiptap)
- **State Management**: React Hooks
- **Styling**: Tailwind CSS with class-variance-authority and tailwind-merge

## Development Environment

- **Package Manager**: npm/yarn
- **Build System**: Next.js with Turbopack
- **Deployment**: Vercel
- **Testing**: Jest for unit and integration tests

## Common Commands

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests

# Docker
docker build -t loopletter .
docker run -p 3000:3000 loopletter
```

## API Structure

- RESTful API endpoints under `/app/api/`
- Authentication via Clerk
- Database access through Supabase client
- Webhook handlers for external services (Stripe, AWS SES)

## Database Schema

Key tables in the Supabase database:
- `artists` - Platform users (artists/creators)
- `fans` - Subscribers/audience members
- `campaigns` - Email campaigns
- `segments` - Audience segments
- `email_sent` - Record of sent emails
- `email_events` - Email engagement events (opens, clicks)
- `subscriptions` - Stripe subscription records
- `invoices` - Billing records
- `team_members` - Collaborators with access to an artist's account

## Environment Variables

Key environment variables required:
- **Authentication**: Clerk API keys
- **Database**: Supabase connection details
- **Email**: AWS SES credentials
- **Payment**: Stripe API keys and webhook secrets
- **Application**: Base URL and other configuration

## TypeScript Conventions

- Use explicit typing, avoid `any` types
- Define interfaces/types in `lib/types.ts`
- Follow TypeScript best practices for null/undefined handling
- Use type guards for runtime type checking

## Code Style Guidelines

- Use functional components with hooks
- Prefer named exports
- Use async/await for asynchronous operations
- Handle errors with try/catch blocks
- Use proper TypeScript typing
- Follow the component structure patterns established in the codebase

## Testing

- Jest for unit and integration tests
- Test files located in `/__tests__` directory
- API tests in `/__tests__/api`
- Utility function tests in `/__tests__/lib`

## Performance Considerations

- Use Next.js optimizations (Image component, SSR/SSG)
- Implement proper error handling
- Monitor AWS SES quotas and deliverability metrics
- Optimize database queries for performance
- Use pagination for large data sets

## Security Best Practices

- Validate all user inputs
- Use Clerk for secure authentication
- Implement proper RBAC for authorization
- Secure API endpoints with appropriate middleware
- Follow AWS SES best practices for email sending
- Protect sensitive data in environment variables
- Use HTTPS for all communications