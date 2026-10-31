# Morrow

**A shared home for product ideas and roadmap updates.**

Morrow gives product teams a clear way to collect customer requests, understand which problems matter, and show what happens next. Customers can browse a public feedback board, add context to an idea, and follow its status as work moves from consideration to release.

## Product experience
- Branded feedback board with searchable ideas, categories, discussion and voting.
- Public roadmap with planned, in-progress and shipped work.
- Visible status updates that close the loop with the people who asked.
- Responsive light/dark experience and an installable PWA shell.
- Planned subscriptions, moderation, analytics, XLSX/PDF reports and integrations.

The current foundation provides the branded product portal, Drizzle persistence for workspaces, ideas, votes and comments, and an initial single-owner workspace setup/sign-in flow. The public board still uses curated session-preview content; saved ideas and roadmap content remain on the delivery plan.

## Technology
Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui component patterns, Radix UI Tabs, React Icons, Drizzle ORM and libSQL. SQLite supports local development; Turso can host the same libSQL schema. Recharts, XLSX and jsPDF are included for planned reporting.

## Local setup
Requirements: Node.js 20.11+ and npm.

1. Copy .env.example to .env.
2. Local development uses TURSO_DATABASE_URL=file:./feedback.db. For a hosted Turso database, set both its URL and TURSO_AUTH_TOKEN in your local environment.
3. Run npm run auth:secrets and copy both generated values into the ignored .env file. Keep MORROW_SETUP_TOKEN available only to the person setting up the first owner; MORROW_SESSION_SECRET signs owner sessions.
4. Install dependencies with npm ci.
5. Apply the checked-in schema migrations with npm run db:migrate.
6. Optionally load synthetic local workspace data with npm run db:seed. The first owner setup can claim this reserved demo workspace if it is the only workspace in the database.
7. Start the product with npm run dev and open http://localhost:3000/setup to configure the owner account.

Do not commit .env, a local database, access tokens or the local .npmrc. Owner setup and workspace visibility are available; persistent public ideas, votes, comments and roadmap routes remain scheduled follow-up work.

## Commands
- npm run dev — local app
- npm run lint — lint source
- npm run typecheck — strict TypeScript check
- npm run build — production build
- npm run db:generate — create migration files
- npm run db:migrate — apply migrations
- npm run db:push — sync a development schema
- npm run db:studio — inspect local tables
- npm run db:seed — upsert the sample workspace, ideas, votes and comments into the local feedback.db only
- npm run auth:secrets — print fresh setup and session secrets to add to the ignored .env file

## Data model
Drizzle defines Workspace, Idea, Vote and Comment tables. A workspace stores public/private visibility and an owner password salt/hash; owner passwords are derived with scrypt. Foreign keys cascade from workspace to idea and idea to votes/comments. Compound indexes support status feeds and idea discussions; a unique voter/idea key prevents duplicate stored votes.

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

The test plan covers public/private workspace isolation, anonymous write settings, owner/member authorization, hidden and pending ideas, input validation/rate limits, duplicate-vote idempotency and withdrawal, comment moderation, status timestamp/attribution, stable filtering/pagination, and service-worker cache exclusions. Current Vitest coverage renders the board and tests workspace input validation, session signing/expiry/tampering, visibility policy and same-origin validation. It does not yet prove persisted idea APIs, moderation or vote identity.

## Trust and moderation
Customer ideas can include sensitive business context. Production must use authenticated administrative actions, validated public submissions, scoped exports, rate limits, spam controls and a clear retention/deletion policy. Public service-worker caches must never include private workspace data.

## Delivery and review

Morrow review checks workspace-scoped opaque voter identity, repeat-vote idempotency and public/private moderation boundaries while preserving the customer journey from board to roadmap. Follow [DELIVERY-POLICY.md](DELIVERY-POLICY.md) from Day 02 for sequential execution, scope-driven commits and this repository's separate branch/PR with GitHub panel review and merge.

## Contributions and examples

See [CONTRIBUTING.md](CONTRIBUTING.md) for reproducible reports, genuine collaboration and product examples such as a synthetic idea-to-roadmap walkthrough with honest vote state. Contributions follow the product backlog and reviewed PR workflow.

## Day 02 public board controls

BoardLayout owns public header/footer navigation and a skip link. Changelog, privacy, guidelines and powered-by links have explicit preview sections; mobile keeps Changelog reachable. VoteButton names the current action (upvote or withdraw) and exposes pressed state; counts remain illustrative session data. Newest now sorts every status rather than filtering on a nonexistent status, with pure selection tests. Search is labeled. Theme restores before writing, validates light/dark and handles inaccessible storage; only morrow-theme is persisted. Live identity, moderation and persisted ideas remain later work. Day 02's responsive/theme/keyboard review was not completed while Work browser access was unavailable; Day 04 browser accessibility checks cover the new setup/sign-in routes.

## Day 03 local data setup

`lib/db.ts` creates the server-only Drizzle/libSQL client from `TURSO_DATABASE_URL`, reuses it during Next.js development reloads, and requires `TURSO_AUTH_TOKEN` for remote URLs. The checked-in SQLite migration is applied with `db:migrate`; it creates the workspace, idea, vote and comment tables with their foreign keys and indexes.

`db:seed` is limited to the exact local URL `file:./feedback.db`. It inserts the reserved synthetic workspace only when absent, and idempotently upserts three ideas, four votes and two comments with stable IDs and timestamps. It never overwrites workspace owner-managed name, slug, visibility or password fields. Voter keys are opaque sample labels, not personal identifiers. The script never targets a hosted Turso database; repeat runs do not multiply records. The current public UI remains a curated session preview and is not yet wired to this database.

## Day 04 owner access and visibility

- `/setup` creates the first owner account using the server-only `MORROW_SETUP_TOKEN`, or claims the reserved synthetic workspace when it is the only existing workspace. The stable first-workspace ID prevents two simultaneous initial setup requests from creating two owners.
- `/sign-in` checks a workspace slug and owner password. Passwords are stored as scrypt hashes with random salts; the owner session is an HMAC-signed, HttpOnly, SameSite=Lax cookie with a 12-hour lifetime and `Secure` in production. Same-origin checks protect setup, sign-in, settings updates and sign-out.
- `/w/:slug` checks visibility on every server render. A private workspace returns only its sign-in gate to anonymous visitors; the service worker leaves navigations and API requests network-only. An authenticated owner can rename the workspace and switch public/private visibility.
- This is a single-owner preview flow. Role-based memberships, password recovery, login throttling and persisted public board content remain future work; use HTTPS and an edge request limit before exposing owner sign-in publicly. Rotating `MORROW_SESSION_SECRET` invalidates existing owner sessions.
- The seeded board remains synthetic and the main `/` page remains a session preview. Setup does not turn those sample ideas into persistent customer feedback.
