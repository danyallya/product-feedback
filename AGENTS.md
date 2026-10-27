# Morrow contributor guide

## Product direction
Morrow is a customer-facing product feedback portal that turns requests into visible decisions and roadmap updates. Keep feedback welcoming, plain-spoken and useful to both customers and product teams.

## Required daily cycle
1. Read this guide, BACKLOG.md, Git status and prior-day notes.
2. Review existing code, tests and open defects; reproduce the defects first.
3. Write or update focused tests for current behavior and today's acceptance criteria.
4. Implement the day's outcome and debug nearby issues.
5. Check mobile/tablet/desktop, keyboard, focus, light/dark, lint, typecheck, tests and production build when possible; record exact results.
6. Update README, backlog and technical decisions; reprioritize new work and make tomorrow's plan explicit.
7. Commit only reviewed, relevant changes. Keep .npmrc, .env, auth tokens and local database files out of Git. Never force-push.

## Engineering
- Use strict TypeScript and keep Turso credentials server-side.
- Validate and rate-limit idea submissions, comments and votes.
- Enforce workspace visibility and moderation rules before reads and writes.
- Keep vote identity privacy-aware and explain how repeat votes are handled.
- Exclude private API responses from service-worker caches.
- Provide status definitions, empty states and accessible vote controls.

## Delivery from Day 02

- Read and follow [DELIVERY-POLICY.md](DELIVERY-POLICY.md). Finish Morrow and its own PR panel review, merge and sync before the next portfolio repository, or record an exact external blocker. No concurrent project or subagent work.
- Choose commit counts, boundaries, content and wording from this product's real changes; do not copy a fixed history pattern from other projects.
- Review the latest pushed head and checks in GitHub and merge through this repository's PR panel. Respect required independent approvals; self-review does not replace them.
