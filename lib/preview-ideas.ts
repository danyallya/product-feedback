export type IdeaStatus = "Considering" | "Planned" | "In progress" | "Shipped" | "Declined";

export type Idea = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: IdeaStatus;
  votes: number;
  comments: number;
  author: string;
  color: string;
};

export const seedIdeas: Idea[] = [
  { id: "01", title: "A true quiet mode for notifications", description: "Let me pause non-critical updates for a few hours without missing messages that need my attention.", category: "Workflow", status: "Considering", votes: 128, comments: 24, author: "Clara D.", color: "coral" },
  { id: "02", title: "Saved views for every kind of work", description: "I’d love to save a filter by project and share it with my team so we can get back to the work that matters.", category: "Workspace", status: "In progress", votes: 96, comments: 18, author: "Marcus W.", color: "blue" },
  { id: "03", title: "Bring my own fields to the project board", description: "Custom fields would help our research and operations teams keep the context they need in one place.", category: "Workspace", status: "Planned", votes: 84, comments: 12, author: "Nadia K.", color: "gold" },
  { id: "04", title: "A weekly digest I can actually use", description: "One thoughtful email with decisions, changes and the next steps for the things I follow.", category: "Updates", status: "Considering", votes: 72, comments: 9, author: "Jamie R.", color: "violet" },
];

export const roadmapLanes = [
  { status: "In progress", label: "In progress", className: "purple" },
  { status: "Planned", label: "Up next", className: "blue-dot" },
  { status: "Shipped", label: "Recently shipped", className: "green-dot" },
] as const;

export function ideasForRoadmap<T extends Pick<Idea, "status">>(ideas: T[], status: IdeaStatus): T[] {
  return ideas.filter((idea) => idea.status === status);
}
