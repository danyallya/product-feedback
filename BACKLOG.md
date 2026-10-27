# Morrow — 30-day delivery plan

Morrow helps product teams hear customers, make tradeoffs visible and close the loop with a public roadmap.

## Required daily cycle
Review yesterday’s code, diff, tests and reported defects; add or update focused tests; implement today's deliverable; debug and check responsive, keyboard, focus and theme behavior; run lint, typecheck, tests and production build when possible and record exact results; update README and backlog; reprioritize discovered tasks and make tomorrow's work explicit. Keep private registry config, tokens and local database files untracked.

## Day 00 foundation prepared
Next.js App Router, strict TypeScript, shadcn/ui pattern with Radix Tabs, Tailwind, React Icons, Drizzle with SQLite/Turso, PWA shell, product feedback portal and local day-00-foundation branch.

### Day 00 validation
Nexus returned 404 for packages used by this project. Following the user's approval, dependencies were installed with npmjs fallback. The ignored local .npmrc preserves Nexus as default and contains only required scope overrides. Tests, lint, typecheck and production build passed; Day 01 has not started.

| Day | Deliverable |
|---|---|
| 01 | Done — document customer journey, status vocabulary, vote privacy, workspace boundary, API/test contract and baseline. |
| 02 | Extract public board layout, shared controls and persistent accessible light/dark theme. |
| 03 | Establish Drizzle/Turso connection, migrations and reproducible workspace seed. |
| 04 | Add workspace setup, owner authentication and public/private visibility controls. |
| 05 | Persist idea submission with server validation, rate limits and moderation state. |
| 06 | Implement searchable ideas and category/status filters with stable pagination. |
| 07 | Persist anonymous/member votes with a documented repeat-vote policy. |
| 08 | Add idea details and moderated threaded comments. |
| 09 | Add product team status updates with visible timestamps and attribution. |
| 10 | Build roadmap lanes for planned, in-progress and shipped work. |
| 11 | Add category management, merge rules and workspace customization. |
| 12 | Add email verification and update subscriptions by followed idea. |
| 13 | Send preference-aware roadmap digest with unsubscribe handling. |
| 14 | Add product analytics for votes, conversion and status movement. |
| 15 | Add Recharts trends with accessible summaries and correct denominators. |
| 16 | Export board and roadmap as XLSX with safe values and clear column names. |
| 17 | Create branded, paginated PDF roadmap and board report. |
| 18 | Add idea import and duplicate review before any database writes. |
| 19 | Add admin moderation queue, audit entries and author notifications. |
| 20 | Build roadmap changelog with linked delivered ideas. |
| 21 | Add custom domain metadata, branding settings and social share previews. |
| 22 | Add workspace roles and capabilities for moderators and editors. |
| 23 | Add integration webhooks with signed delivery and retry history. |
| 24 | Add customer data export, retention and deletion controls. |
| 25 | Harden markdown rendering, link handling, spam prevention and CSP. |
| 26 | Accessibility review for screen readers, keyboard, contrast and reduced motion. |
| 27 | Cross-device review for phones, tablets and desktop; correct layout issues. |
| 28 | Tune SQLite/Turso query patterns and cache only public, safe resources. |
| 29 | Run complete customer-to-release journey, migration rehearsal and release build. |
| 30 | Publish workspace guide, deployment instructions, release notes and next roadmap. |

## Completion gate
The work log must show review, focused tests, implemented scope, debugging, responsive/theme/accessibility checks, honest verification, updated docs and the next day’s tasks. No activity-only commits.

- Day 01: Done. The current preview journey, canonical status vocabulary, vote identity policy, workspace access boundaries and future API/test plan are documented. The board and roadmap anchors are verified; visible Changelog, Privacy, Community guidelines and Powered-by links still lack targets. Carry this into Day 02 while extracting the board shell and accessible shared controls.

## Process change effective Day 02 — 2026-10-27

Apply [DELIVERY-POLICY.md](DELIVERY-POLICY.md) to every remaining ticket: finish Morrow before the next repository, use meaningful scope-driven commits and deliver through its own reviewed PR. A blocked external gate needs a concrete record and next action. This adds delivery gates without moving Day 02–30 product work or changing completed history.
