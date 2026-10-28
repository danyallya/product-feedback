# Daily work log

## Day 00 — foundation (2026-10-26, Asia/Tehran)

- Prepared the product-specific Next.js/TypeScript workspace, responsive interface, light/dark theme, React Icons, PWA shell, README, AGENTS.md and 30-day backlog.
- Review: inspected the starter page, tests, database schema/config, build, Git ignore rules and local registry setup; corrected issues found by checks before recording a passing result.
- Dependencies: generated package-lock.json and installed packages after Nexus 404s. The user approved npmjs fallback. Local .npmrc remains ignored, preserves Nexus as default and maps only required scopes. No private registry config is tracked.
- Checks: npm test passed (1/1), npm run lint passed, npm run typecheck passed, and npm run build passed. The production build emitted the PWA manifest/service-worker shell.
- Database setup: npm run db:generate created a Drizzle/Turso migration. No remote database push was attempted.
- GitHub: Day 00 foundation commit 3e4cc0b is pushed to both main and day-00-foundation: https://github.com/danyallya/product-feedback. Day 01 has not started.
- Schedule: Day 01 has not started. The next task is Day 01 in BACKLOG.md; wait for the user to trigger that day.

## Day 01 — customer journey and workspace contract (2026-10-27, Asia/Tehran)

- Review: inspected the customer board, seed ideas, status labels, vote state, Drizzle schema, public service-worker caching, tests and previous Git history. The current preview has no persistence or authenticated API; Changelog and several footer links have no destination.
- Implementation: documented the customer journey, canonical statuses, one active withdrawable vote per idea with a workspace-scoped opaque voter key, public/private visibility rules, planned API contract and security test plan. Added a render regression check for the idea board and roadmap destinations; recorded missing navigation targets as Day 02 carry-over.
- Checks: `npm test` passed (1 file, 1 test); `npm run lint`, `npm run typecheck`, `npm run db:generate` (no schema changes), `npm run build`, and `git diff --check` passed. No local or hosted database write was run.
- GitHub: implementation/docs commit `85f136d` (`docs: define feedback board journey and access contract`) was pushed to `day-01/customer-journey-contract`, fast-forwarded to `main`, and `main` was pushed. This log entry will be included in the final sync.
- Next: Day 02 — extract the public board shell and shared controls, persist accessible theme preference, and close the unimplemented navigation targets.

## Review workflow maintenance — 2026-10-27

- The user requested careful sequential project execution, commit content/counts suited to each product and an independent branch/PR per repository with panel review and merge.
- Morrow review checks workspace-scoped opaque voter identity, repeat-vote idempotency and public/private moderation boundaries while preserving the customer journey from board to roadmap. Added a standalone delivery policy and entry points in AGENTS, README and BACKLOG.
- Documentation-only maintenance on `docs/morrow-vote-moderation`; Markdown diff reviewed and `git diff --check` used. No application tests/build rerun for this process change. Next product work: Day 02 — public board shell, shared controls, persistent accessible theme and working navigation targets.
- This is the pre-merge log state. The portfolio workspace DELIVERY-RECEIPTS.md records the actual PR URL, checked head, panel gates, merge SHA and sync afterward; reconcile it here in the next authorized update.

## Contribution guidance maintenance — 2026-10-27

- User request: integrate achievable GitHub profile goals naturally into future project work. Added Morrow contribution guidance around an opaque-voter duplicate/withdrawal or public/private moderation case and useful documentation examples. Preserved the daily backlog and all delivery gates.
- Previous delivery-policy PR #1 is merged in origin/main; this maintenance starts from that merged history. No badge, collaborator, star or accepted answer is claimed.
- Documentation-only scope on docs/morrow-board-participation; reviewed Markdown and git diff --check. App tests/build are not rerun because runtime behavior is unchanged.
- External blocker: local browser use is disabled in Work settings. PR creation, panel review and merge remain pending; resume from this branch when browser access is available, inspect existing PRs first, target main and follow all gates.
- Publication is pre-merge here; the final PR/head/panel/check/merge/sync evidence goes in the workspace DELIVERY-RECEIPTS.md after completion. Next: Day 02 — public board shell, shared controls, persistent accessible theme and working navigation targets. Wait for the user's day trigger.

## Day 02 — Morrow board controls — 2026-10-28

- Reconciled merged policy/contribution PRs #1/#2 at main 2b6081a and reviewed prior journey/vote/privacy contracts. Found Newest incorrectly filtering for a nonexistent status; selectIdeas now sorts all statuses while keeping source order immutable. Added regression cases for Newest, Planned and empty search.
- Extracted BoardLayout and VoteButton; labels distinguish upvote/withdraw and expose pressed state. Search is named, skip target focusable and footer/Changelog destinations explain the real preview limits. Mobile keeps Changelog visible. Theme initialization restores validated preference before writes and tolerates blocked storage; only appearance persists.
- Four tests passed; lint/build/typecheck final outcomes are in the workspace receipt. Reviewed changed source/tests/docs locally; no database write, vote identity persistence, moderation, outreach or fabricated profile activity added. Synthetic board/control cases are useful contribution evidence.
- Work browser disabled: actual keyboard/phone/tablet/theme inspection, PR creation/exact-head Files changed/Checks/conversation panel review, merge and main sync pending on day-02/morrow-board-controls. No live-vote, CI, independent approval or badge claim.
- Next: finish Day 02 delivery gates, then Day 03 Drizzle/Turso connection, migrations and reproducible synthetic workspace seed on its manual trigger.
