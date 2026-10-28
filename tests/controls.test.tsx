import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { VoteButton } from '../components/vote-button';
import { restoreAppearance, persistAppearance } from '../components/appearance';
import { selectIdeas } from '../lib/idea-view';
describe('Morrow public controls', () => {
  it('shows all statuses in Newest and filters planned without mutating the source', () => {
    const ideas = [
      { id: '01', title: 'First', description: '', category: '', status: 'Planned', votes: 4 },
      { id: '10', title: 'Second', description: '', category: '', status: 'Considering', votes: 1 },
    ];
    expect(selectIdeas(ideas, '', 'newest').map(item => item.id)).toEqual(['10', '01']);
    expect(selectIdeas(ideas, '', 'planned').map(item => item.id)).toEqual(['01']);
    expect(selectIdeas(ideas, 'missing', 'popular')).toHaveLength(0);
    expect(ideas[0].id).toBe('01');
  });
  it('labels withdrawal separately and reports active state', () => {
    const markup = renderToStaticMarkup(createElement(VoteButton, { title: 'Synthetic idea', votes: 3, active: true, onVote: () => {} }));
    expect(markup).toContain('Withdraw vote for Synthetic idea'); expect(markup).toContain('aria-pressed="true"');
  });
  it('validates preferences and tolerates blocked storage', () => {
    expect(restoreAppearance({ getItem: () => 'light' }, true)).toBe(false);
    expect(restoreAppearance({ getItem: () => 'unknown' }, true)).toBe(true);
    expect(restoreAppearance({ getItem: () => { throw Error(); } }, false)).toBe(false);
    expect(() => persistAppearance({ setItem: () => { throw Error(); } }, true)).not.toThrow();
  });
});
