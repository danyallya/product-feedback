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
3. Install dependencies with npm ci.
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

## Day 01 customer journey and status vocabulary

- The current `/` preview lets a visitor browse/search/filter ideas, toggle a local vote, submit a local idea, and view roadmap lanes. It uses curated examples and component state; submissions and votes disappear on reload and are not persisted.
- Current navigation targets are `#ideas` and `#roadmap`. Changelog, privacy, community-guideline and powered-by links are visible placeholders without target sections or routes. These destinations need explicit sections or links before their controls are presented as working navigation.
- Canonical idea statuses for the product are Considering, Planned, In progress, Shipped and Declined. The preview currently demonstrates Considering, Planned and In progress; the roadmap separately shows shipped work. Public status changes need an update timestamp and workspace-team attribution.
- The public customer journey is browse → filter/search → vote or submit context → follow a status update through the roadmap. Submission must show its moderation state; a vote is one active vote per idea and can be withdrawn. Repeated requests must be idempotent, and the stored voter key must be an opaque workspace-scoped identifier, never a raw IP address or email address. The existing unique `(idea_id, voter_key)` index supports that future contract; current votes are only local toggles.

## Workspace boundary and API/test plan

| Actor | Public workspace | Private workspace | Moderation and roadmap updates |
|---|---|---|---|
| Anonymous visitor | Read only ideas explicitly published to that workspace; submit/vote only when enabled | Denied | Denied |
| Authenticated workspace member | Public reads plus workspace-scoped team access | Only their active workspace | Allowed only for assigned team capabilities |
| Workspace owner/admin | Same record boundary as a member | Only their active workspace | Manage visibility, membership and team decisions within that workspace |

The server derives workspace scope from the public slug for public reads and from the authenticated session for private/team actions. A caller-supplied workspace ID must never grant access. Private ideas and moderation state stay out of public responses and service-worker caches.

Planned route contract: `GET /api/workspaces/:slug/ideas` lists only public ideas with status/category filters and stable pagination; `POST /api/workspaces/:slug/ideas` validates and rate-limits submissions before moderation; `POST`/`DELETE /api/ideas/:id/vote` idempotently adds or withdraws the visitor's vote; `GET /api/workspaces/:slug/roadmap` returns published roadmap items; `GET`/`POST /api/ideas/:id/comments` enforce visibility and moderation; authenticated `PATCH /api/team/ideas/:id` changes status with attribution. These are future contracts, not implemented routes.

The test plan covers public/private workspace isolation, anonymous write settings, owner/member authorization, hidden and pending ideas, input validation/rate limits, duplicate-vote idempotency and withdrawal, comment moderation, status timestamp/attribution, stable filtering/pagination, and service-worker cache exclusions. Current Vitest coverage renders the board and checks its current idea/roadmap destinations; it does not yet prove persistence, authorization, moderation or vote identity.

## Trust and moderation
Customer ideas can include sensitive business context. Production must use authenticated administrative actions, validated public submissions, scoped exports, rate limits, spam controls and a clear retention/deletion policy. Public service-worker caches must never include private workspace data.
