# Loopletter

![Status](https://img.shields.io/badge/status-preview-blue.svg) ![MIT License](https://img.shields.io/badge/license-MIT-green.svg)

> Open-source email marketing platform for independent artists and creators. Built with Next.js, Supabase, and AWS SES.

Loopletter helps artists own their audience, automate campaigns, and understand performance without relying on walled-garden social platforms. This repo contains the full web application, infrastructure scripts, and documentation needed to self-host or extend the product.

> **Quick links:** [Docs](docs/README.md) · [Self-hosting guide](docs/SERVICES.md) · [Code of Conduct](CODE_OF_CONDUCT.md) · [Contributing](CONTRIBUTING.md)

---

## Highlights

- **Full Campaign Builder** – Visual editor, templating system, and support for Spotify-powered layouts.
- **Audience Tools** – Imports, segmentation, list growth forms, consent management, and cleanup utilities.
- **Scheduling & Automation** – Queue-driven send engine with rate limiting, retries, and queue monitoring helpers.
- **Insights Dashboard** – Real-time campaign analytics, audience growth metrics, and deliverability reporting.
- **Production Ready** – AWS SES integration, domain authentication helpers, privacy tooling, and Supabase migrations.

---

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI
- **Auth**: Clerk
- **Data**: Supabase (PostgreSQL + Auth)
- **Email Delivery**: AWS SES
- **Job Queue**: BullMQ on Redis/Upstash
- **Monitoring**: Optional PostHog, Sentry

See `package.json` for full dependency listing.

---

## Architecture Overview

```
app/                    Next.js routes, dashboard, and marketing pages
components/             Shared UI primitives and feature components
lib/                    Domain logic (queues, SES config, RBAC, helpers)
supabase/               Database migrations and SQL helpers
docs/                   Markdown documentation for setup and operations
scripts/                Operational CLI scripts for AWS, Redis, queues
```

Supporting docs live under `docs/` and `content/docs/` for the in-app docs portal.

---

## Getting Started

### 1. Prerequisites

- Node.js 18+ and npm (or pnpm / yarn)
- Supabase project (free tier works for development)
- Clerk application for authentication
- AWS account with SES + S3 (for email + asset storage)
- Optional: Upstash Redis (or any Redis instance) for queues

### 2. Install

```bash
git clone https://github.com/Loopletter/loopletter.git
cd loopletter
npm install
```

### 3. Configure Environment

Copy `.env.example` to `.env.local` and fill the required values:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- `SUPER_ADMIN_EMAIL` for review moderation access
- Optional service configs (Stripe, Redis, PostHog, Sentry, etc.)

Refer to [docs/SERVICES.md](docs/SERVICES.md) for provider-specific setup notes and service specific environment variables.

### 4. Apply Database Migrations

Use the Supabase CLI (recommended):

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase push
```

If you prefer a manual workflow, run the SQL files in `supabase/migrations/` (or import the schema dump in `docs/database/`) via the Supabase SQL editor.

### 5. Run the App

```bash
npm run dev
```

Visit `http://localhost:3000` to access the dashboard and marketing site.

---

## Deployment

- **Vercel** for hosting the Next.js application (serverless-ready endpoints in `app/api/`).
- **Supabase** for database and auth layer.
- **Redis/Upstash** for BullMQ queues powering campaign sends.
- **AWS SES + S3** for deliverability and asset storage.

Shell helpers in the project root (`setup-aws-eventbridge.sh`, `simple-eventbridge-setup.sh`, `update-lambda-config.sh`, etc.) help automate queue processing infrastructure. Replace placeholder values before running them in production.

---

## Documentation & Support

- Product and setup guides live in `docs/` and the in-app docs (`content/docs/`).
- `SUBSCRIPTION_README.md` walks through the billing/subscription system (optional when running self-hosted).
- `dummy-data-scripts.js` contains scripts you can run in the browser console to populate the dashboard for demos.

If you find an issue, please open a GitHub issue with reproduction steps. Security concerns can be shared privately—see the [Security](#security) section below.

---

## Contributing

We welcome pull requests! To contribute:

1. Fork the repository and create your branch from `main`.
2. Follow the coding standards enforced by `eslint.config.mjs` and `tsconfig.json`.
3. Run relevant tests or scripts before submitting (`npm run lint`, `npm run test` if applicable).
4. Open a PR using `.github/pull_request_template.md`.

Please review our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [CONTRIBUTING.md](CONTRIBUTING.md) before contributing.

---

## Security

Loopletter handles sensitive subscriber data. When self-hosting:

- Enable HTTPS everywhere (Vercel handles this by default).
- Store environment secrets in your hosting provider’s secret manager.
- Configure AWS IAM with the minimum required permissions (see `aws-iam-policy.json`).
- Regularly monitor SES bounce/complaint metrics to protect sender reputation.

For security disclosures, please email `security@loopletter.co` or use your organization’s preferred contact channel. Additional security practices are outlined in [docs/troubleshooting/index.mdx](docs/troubleshooting/index.mdx#deliverability--security-checklist).

---

## Roadmap & Releases

Roadmap items and release notes will be tracked using GitHub Projects and the Releases tab. Contributions toward the following areas are especially welcome:

- Expanded automation workflows
- Additional analytics visualizations
- Multi-tenant/team features
- Community-driven integrations (Spotify, Shopify, etc.)

---

## License

Distributed under the [MIT License](LICENSE). You are free to use Loopletter in commercial and non-commercial projects. Please retain license notices in derivative work.

---

Made with care for independent artists. If you launch with Loopletter, we’d love to hear about it! Tweet @loopletter or open a discussion in the repo.
