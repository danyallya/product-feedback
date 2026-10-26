# Morrow

**A shared home for product ideas and roadmap updates.**

Morrow gives product teams a clear way to collect customer requests, understand which problems matter, and show what happens next. Customers can browse a public feedback board, add context to an idea, and follow its status as work moves from consideration to release.

## Product experience
- Branded feedback board with searchable ideas, categories, discussion and voting.
- Public roadmap with planned, in-progress and shipped work.
- Visible status updates that close the loop with the people who asked.
- Responsive light/dark experience and an installable PWA shell.
- Planned subscriptions, moderation, analytics, XLSX/PDF reports and integrations.

The current foundation provides the branded product portal and an initial Drizzle schema for workspaces, ideas, votes and comments. Portal entries are curated product-preview content until persistence and workspace administration land in the delivery plan.

## Technology
Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui component patterns, Radix UI Tabs, React Icons, Drizzle ORM and libSQL. SQLite supports local development; Turso can host the same libSQL schema. Recharts, XLSX and jsPDF are included for planned reporting.

## Local setup
Requirements: Node.js 20.11+ and npm.

1. Copy .env.example to .env.
2. Local development uses TURSO_DATABASE_URL=file:./feedback.db. For a hosted Turso database, set its URL and token in your local environment.
3. Install dependencies with npm install.
4. Create/apply the local schema with npm run db:push.
5. Start the product with npm run dev and open http://localhost:3000.

Do not commit .env, a local database, access tokens or the local .npmrc. Workspace API routes and persistent portal data are scheduled follow-up work.

## Commands
- npm run dev — local app
- npm run lint — lint source
- npm run typecheck — strict TypeScript check
- npm run build — production build
- npm run db:generate — create migration files
- npm run db:migrate — apply migrations
- npm run db:push — sync a development schema
- npm run db:studio — inspect local tables

## Data model
Drizzle defines Workspace, Idea, Vote and Comment tables. Foreign keys cascade from workspace to idea and idea to votes/comments. Compound indexes support status feeds and idea discussions; a unique voter/idea key prevents duplicate stored votes.

See AGENTS.md for the everyday review, testing and documentation cycle and BACKLOG.md for the complete 30-day roadmap. The local foundation branch is day-00-foundation.

## Trust and moderation
Customer ideas can include sensitive business context. Production must use authenticated administrative actions, validated public submissions, scoped exports, rate limits, spam controls and a clear retention/deletion policy. Public service-worker caches must never include private workspace data.