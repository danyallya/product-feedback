type BoardItem = { id: string; title: string; description: string; category: string; status: string; votes: number };
export function selectIdeas<T extends BoardItem>(ideas: T[], query: string, tab: string): T[] {
  return ideas.filter(item => `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(query.toLowerCase()) &&
    (tab === 'popular' || tab === 'newest' || item.status.toLowerCase() === tab))
    .sort((a, b) => tab === 'newest' ? b.id.localeCompare(a.id, undefined, { numeric: true }) : b.votes - a.votes);
}
