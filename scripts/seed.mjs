import { createClient } from "@libsql/client";
import {
  assertSafeLocalSeedTarget,
  LOCAL_DEMO_DATABASE_URL,
} from "./seed-policy.mjs";

const databaseUrl = process.env.TURSO_DATABASE_URL || LOCAL_DEMO_DATABASE_URL;
assertSafeLocalSeedTarget(databaseUrl);

const client = createClient({ url: databaseUrl });
const sampleWorkspace = {
  id: "workspace:morrow-demo",
  name: "Morrow Demo Workspace",
  slug: "morrow-demo",
  createdAt: Math.floor(Date.parse("2026-10-29T09:00:00.000Z") / 1000),
};
const sampleIdeas = [
  {
    id: "idea:quiet-hours",
    title: "A true quiet mode for notifications",
    description: "Choose quiet hours and keep roadmap updates out of that window.",
    category: "Notifications",
    status: "planned",
    authorName: "Taylor Example",
    createdAt: Math.floor(Date.parse("2026-10-27T10:00:00.000Z") / 1000),
    updatedAt: Math.floor(Date.parse("2026-10-29T09:00:00.000Z") / 1000),
  },
  {
    id: "idea:roadmap-digest",
    title: "A weekly digest of roadmap changes",
    description: "Get one concise summary of the ideas that moved this week.",
    category: "Roadmap",
    status: "considering",
    authorName: "Morgan Example",
    createdAt: Math.floor(Date.parse("2026-10-28T12:00:00.000Z") / 1000),
    updatedAt: Math.floor(Date.parse("2026-10-28T12:00:00.000Z") / 1000),
  },
  {
    id: "idea:keyboard-board",
    title: "Keyboard shortcuts for the idea board",
    description: "Move between filters and ideas without leaving the keyboard.",
    category: "Accessibility",
    status: "in_progress",
    authorName: "Riley Example",
    createdAt: Math.floor(Date.parse("2026-10-26T08:30:00.000Z") / 1000),
    updatedAt: Math.floor(Date.parse("2026-10-28T15:00:00.000Z") / 1000),
  },
];
const sampleVotes = [
  ["vote:quiet-01", "idea:quiet-hours", "morrow-demo-voter-01", Math.floor(Date.parse("2026-10-27T11:00:00.000Z") / 1000)],
  ["vote:quiet-02", "idea:quiet-hours", "morrow-demo-voter-02", Math.floor(Date.parse("2026-10-28T11:00:00.000Z") / 1000)],
  ["vote:digest-01", "idea:roadmap-digest", "morrow-demo-voter-03", Math.floor(Date.parse("2026-10-28T13:00:00.000Z") / 1000)],
  ["vote:keyboard-01", "idea:keyboard-board", "morrow-demo-voter-04", Math.floor(Date.parse("2026-10-28T16:00:00.000Z") / 1000)],
];
const sampleComments = [
  ["comment:quiet-01", "idea:quiet-hours", "Morgan Example", "Quiet hours would help our distributed team follow updates at a reasonable time.", Math.floor(Date.parse("2026-10-28T09:30:00.000Z") / 1000)],
  ["comment:keyboard-01", "idea:keyboard-board", "Taylor Example", "Please include a visible shortcut list so the controls are easy to discover.", Math.floor(Date.parse("2026-10-29T08:30:00.000Z") / 1000)],
];

function upsert(sql, args) {
  return { sql, args };
}

const statements = [
  upsert(
    `INSERT INTO workspaces (id, name, slug, created_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, slug = excluded.slug, created_at = excluded.created_at`,
    [sampleWorkspace.id, sampleWorkspace.name, sampleWorkspace.slug, sampleWorkspace.createdAt],
  ),
  ...sampleIdeas.map((idea) =>
    upsert(
      `INSERT INTO ideas (id, workspace_id, title, description, category, status, author_name, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET workspace_id = excluded.workspace_id, title = excluded.title,
       description = excluded.description, category = excluded.category, status = excluded.status,
       author_name = excluded.author_name, created_at = excluded.created_at, updated_at = excluded.updated_at`,
      [idea.id, sampleWorkspace.id, idea.title, idea.description, idea.category, idea.status, idea.authorName, idea.createdAt, idea.updatedAt],
    ),
  ),
  ...sampleVotes.map(([id, ideaId, voterKey, createdAt]) =>
    upsert(
      `INSERT INTO votes (id, idea_id, voter_key, created_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET idea_id = excluded.idea_id, voter_key = excluded.voter_key, created_at = excluded.created_at`,
      [id, ideaId, voterKey, createdAt],
    ),
  ),
  ...sampleComments.map(([id, ideaId, authorName, body, createdAt]) =>
    upsert(
      `INSERT INTO comments (id, idea_id, author_name, body, created_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET idea_id = excluded.idea_id, author_name = excluded.author_name,
       body = excluded.body, created_at = excluded.created_at`,
      [id, ideaId, authorName, body, createdAt],
    ),
  ),
];

try {
  await client.batch(statements, "write");
  console.log(
    `Seeded ${sampleIdeas.length} synthetic ideas, ${sampleVotes.length} votes, and ${sampleComments.length} comments in ${LOCAL_DEMO_DATABASE_URL}.`,
  );
} finally {
  client.close();
}
