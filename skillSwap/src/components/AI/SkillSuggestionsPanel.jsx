/**
 * SkillSuggestionsPanel — AI-powered skill recommendation panel.
 * Shows 3 skills the student should learn next based on their profile.
 */

import { Lightbulb, BookOpen } from 'lucide-react';
import Badge from '../ui/Badge';
import { useSkillSuggestions } from '../../hooks/useSkillSuggestions';

export default function SkillSuggestionsPanel() {
  const { suggestions, loading, error } = useSkillSuggestions();

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Lightbulb size={20} style={{ color: '#F59E0B' }} />
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem' }}>
          Recommended Skills
        </h2>
        <span style={{
          fontSize: '0.7rem', padding: '2px 8px', borderRadius: 12,
          background: 'rgba(245,158,11,0.12)', color: '#F59E0B', fontWeight: 600,
        }}>AI Powered</span>
      </div>

      {loading && (
        <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{
            width: 28, height: 28, border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: '#F59E0B', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
          }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Analyzing your profile...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {error && !loading && (
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{error}</p>
        </div>
      )}

      {!loading && !error && suggestions.length > 0 && (
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {suggestions.map((s, i) => (
            <div key={i} className="glass-card" style={{
              padding: 20, transition: 'transform 0.2s, border-color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = ''; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(245,158,11,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <BookOpen size={18} style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>{s.skill}</p>
                  {s.category && (
                    <Badge variant="accent" size="xs">{s.category}</Badge>
                  )}
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                {s.reason}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
