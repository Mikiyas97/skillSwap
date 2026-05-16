/**
 * AiMatches — Dedicated page for AI-powered matching.
 * Shows tutor matches, study partners, and skill suggestions
 * for the user's listings.
 */

import { useState } from 'react';
import { Sparkles, ChevronDown, Plus } from 'lucide-react';
import AiMatchesSection from '../components/AI/AiMatchesSection';
import StudyPartnersSection from '../components/AI/StudyPartnersSection';
import SkillSuggestionsPanel from '../components/AI/SkillSuggestionsPanel';
import { fetchMyListings } from '../services/api';
import { useAPI } from '../hooks/useAPI';

export default function AiMatches() {
  const { data: listings, loading } = useAPI(() => fetchMyListings(), []);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const myListings = listings || [];

  // Auto-select first listing
  const activePostId = selectedPostId || (myListings.length > 0 ? myListings[0].id : null);
  const activePost = myListings.find(l => l.id === activePostId) || null;
  const activePostType = activePost?.post_type;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: 'var(--color-primary)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="page-padding" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 className="heading-xl" style={{ marginBottom: 6 }}>
            <span className="gradient-text">AI Matchmaker</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Powered by Gemini — find your perfect tutor, student, or study partner
          </p>
        </div>

        {/* Listing selector */}
        {myListings.length > 1 && (
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 8, display: 'block' }}>
              Select your listing to find matches for:
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={activePostId || ''}
                onChange={e => setSelectedPostId(parseInt(e.target.value, 10))}
                className="input-field"
                style={{
                  appearance: 'none', paddingRight: 36, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                {myListings.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.title} ({l.post_type === 'wanted' ? 'Seeking' : 'Offering'} {l.category || 'Skill'})
                  </option>
                ))}
              </select>
              <ChevronDown size={16} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)', pointerEvents: 'none',
              }} />
            </div>
          </div>
        )}

        {myListings.length === 0 && (
          <div className="glass-card" style={{ padding: 48, textAlign: 'center', marginBottom: 32 }}>
            <Sparkles size={40} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>No listings yet</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
              Create a post first — offer a skill to find students, or request a skill to find tutors!
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <a href="/offer?type=offer" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <Plus size={16} /> Offer a Skill
              </a>
              <a href="/offer?type=wanted" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <Plus size={16} /> Request a Skill
              </a>
            </div>
          </div>
        )}

        {/* AI Matches */}
        {activePostId && <AiMatchesSection postId={activePostId} postType={activePostType} />}

        {/* Study Partners */}
        {activePostId && <StudyPartnersSection postId={activePostId} postType={activePostType} />}

        {/* Skill Suggestions — always shown */}
        <SkillSuggestionsPanel />
      </div>
    </div>
  );
}
