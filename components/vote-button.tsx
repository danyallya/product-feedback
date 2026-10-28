import { FiArrowUp } from 'react-icons/fi';
export function VoteButton({ title, votes, active, onVote }: { title: string; votes: number; active: boolean; onVote: () => void }) {
  return <button className={`vote-control ${active ? 'voted' : ''}`} onClick={onVote} aria-label={`${active ? 'Withdraw vote for' : 'Upvote'} ${title}`} aria-pressed={active}><FiArrowUp/><strong>{votes}</strong></button>;
}
