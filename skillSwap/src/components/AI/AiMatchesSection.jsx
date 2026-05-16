/**
 * AiMatchesSection — Section that shows AI tutor matches.
 * Supports toggle between List View and Swipe View.
 */

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import AiMatchCard from './AiMatchCard';
import SwipeDeck from '../ai-swipe/SwipeDeck';
import SwipeViewToggle from '../ai-swipe/SwipeViewToggle';
import { useAiMatches } from '../../hooks/useAiMatches';

export default function AiMatchesSection({ postId, postType }) {
  const { matches, loading, error } = useAiMatches(postId);
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('ai-match-view');
    if (saved) return saved;
    return window.innerWidth < 768 ? 'swipe' : 'list';
  });

  const handleViewChange = (v) => {
    setView(v);
    localStorage.setItem('ai-match-view', v);
  };

  if (!postId) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={20} style={{ color: 'var(--color-primary-light)' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem' }}>
            {postType === 'offer' ? 'Students Who Need This' : 'AI Tutor Matches'}
          </h2>
          {matches.length > 0 && (
            <span style={{
              fontSize: '0.75rem', padding: '2px 10px', borderRadius: 20,
              background: 'rgba(108,99,255,0.15)', color: 'var(--color-primary-light)',
              fontWeight: 600,
            }}>{matches.length} found</span>
          )}
        </div>
        <SwipeViewToggle view={view} onChange={handleViewChange} />
      </div>

      {loading && (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{
            width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: 'var(--color-primary)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
          }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            AI is analyzing matches...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {error && (
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{error}</p>
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
          <Sparkles size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            No AI matches found yet. Try adding more details to your listing!
          </p>
        </div>
      )}

      {!loading && !error && matches.length > 0 && view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {matches.map((match, i) => (
            <AiMatchCard key={match.listing?.id || i} match={match} postType={postType} />
          ))}
        </div>
      )}

      {!loading && !error && matches.length > 0 && view === 'swipe' && (
        <SwipeDeck matches={matches} type="tutor" />
      )}
    </div>
  );
}
