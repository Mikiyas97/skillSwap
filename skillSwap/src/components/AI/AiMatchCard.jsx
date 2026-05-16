/**
 * AiMatchCard — List-view card for a single AI match result.
 * Shows score badge, tutor info, match reason, and action buttons.
 */

import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import MatchScoreBadge from './MatchScoreBadge';

export default function AiMatchCard({ match }) {
  const navigate = useNavigate();
  const { listing, score, reason } = match;
  const tutor = listing?.tutor;

  return (
    <div className="glass-card" style={{
      padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start',
      transition: 'transform 0.2s, border-color 0.2s',
      cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.borderColor = 'rgba(108,99,255,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = ''; }}
      onClick={() => listing?.id && navigate(`/skill/${listing.id}`)}
    >
      <MatchScoreBadge score={score} size={56} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Avatar name={tutor?.name || 'User'} size={32} />
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>{listing?.title}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>by {tutor?.name || 'Unknown'}</p>
          </div>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: 8, lineHeight: 1.4 }}>
          {reason}
        </p>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {listing?.category && (
            <Badge variant="accent" size="xs">{listing.category}</Badge>
          )}
          {(listing?.tags || []).slice(0, 3).map(tag => (
            <span key={tag} style={{
              fontSize: '0.7rem', padding: '2px 8px', borderRadius: 12,
              background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
