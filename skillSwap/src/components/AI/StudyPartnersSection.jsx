/**
 * StudyPartnersSection — Section that shows AI study partner matches.
 * Supports toggle between List View and Swipe View.
 */

import { useState } from 'react';
import { Users } from 'lucide-react';
import AiMatchCard from './AiMatchCard';
import SwipeDeck from '../ai-swipe/SwipeDeck';
import SwipeViewToggle from '../ai-swipe/SwipeViewToggle';
import { useStudyPartners } from '../../hooks/useStudyPartners';

export default function StudyPartnersSection({ postId, postType }) {
  const { partners, loading, error } = useStudyPartners(postId);
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('study-partner-view');
    if (saved) return saved;
    return window.innerWidth < 768 ? 'swipe' : 'list';
  });

  const handleViewChange = (v) => {
    setView(v);
    localStorage.setItem('study-partner-view', v);
  };

  if (!postId) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={20} style={{ color: '#10B981' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem' }}>
            {postType === 'offer' ? 'Potential Co-Tutors' : 'Study Partners'}
          </h2>
          {partners.length > 0 && (
            <span style={{
              fontSize: '0.75rem', padding: '2px 10px', borderRadius: 20,
              background: 'rgba(16,185,129,0.15)', color: '#10B981',
              fontWeight: 600,
            }}>{partners.length} found</span>
          )}
        </div>
        <SwipeViewToggle view={view} onChange={handleViewChange} />
      </div>

      {loading && (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{
            width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: '#10B981', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
          }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Finding study partners...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {error && (
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{error}</p>
        </div>
      )}

      {!loading && !error && partners.length === 0 && (
        <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
          <Users size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            No study partners found yet. More students are joining every day!
          </p>
        </div>
      )}

      {!loading && !error && partners.length > 0 && view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {partners.map((match, i) => (
            <AiMatchCard key={match.listing?.id || i} match={match} postType={postType} />
          ))}
        </div>
      )}

      {!loading && !error && partners.length > 0 && view === 'swipe' && (
        <SwipeDeck matches={partners} type="study" />
      )}
    </div>
  );
}
