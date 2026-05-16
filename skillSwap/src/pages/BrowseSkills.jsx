import { useState } from 'react';
import { Search, X, Wifi, WifiOff } from 'lucide-react';
import SkillCard from '../components/SkillCard';
import { fetchSkillListings } from '../services/api';
import { skillCategories } from '../services/mockData';
import { useAPI } from '../hooks/useAPI';

import { useAuth } from '../context/AuthContext';

export default function BrowseSkills() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const { data: listings, loading, isLive } = useAPI(
    () => fetchSkillListings(),
    [],
  );

  const filtered = (listings || []).filter(l => {
    const notMine = !(l.tutor?.email && user?.email && l.tutor.email.toLowerCase() === user.email.toLowerCase());
    const matchQuery = !query || l.title.toLowerCase().includes(query.toLowerCase()) || l.tutor.name.toLowerCase().includes(query.toLowerCase()) || l.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
    const matchLevel = !levelFilter || l.level === levelFilter;
    const matchCategory = !selectedCategory || (l.category && l.category.toLowerCase() === selectedCategory.toLowerCase());
    return notMine && matchQuery && matchLevel && matchCategory;
  });

  return (
    <div className="page-padding" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 className="heading-xl" style={{ marginBottom: 6 }}>Browse <span className="gradient-text">Skills</span></h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Find the perfect tutor or skill to learn</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: isLive ? '#44CF6C' : 'var(--color-text-muted)' }}>
            {isLive ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isLive ? 'Live API' : 'Demo Data'}
          </div>
        </div>

        {/* Search and filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 100%', minWidth: 0 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input className="input-field" placeholder="Search skills, tutors, or tags..." value={query} onChange={e => setQuery(e.target.value)} style={{ paddingLeft: 42 }} />
          </div>
          <select className="input-field" value={levelFilter} onChange={e => setLevelFilter(e.target.value)} style={{ width: '100%', minWidth: 0 }}>
            <option value="">All Levels</option>
            {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Category tags — horizontally scrollable on mobile */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {['All', ...skillCategories].map(category => (
            <button key={category} onClick={() => setSelectedCategory(category === 'All' ? '' : category)} style={{
              padding: '8px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'var(--font-body)',
              background: (category === 'All' && !selectedCategory) || selectedCategory === category ? 'var(--color-primary)' : 'rgba(255,255,255,0.04)',
              color: (category === 'All' && !selectedCategory) || selectedCategory === category ? '#fff' : 'var(--color-text-secondary)',
              transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0, minHeight: 36,
            }}>{category}</button>
          ))}
          {(query || levelFilter || selectedCategory) && (
            <button onClick={() => { setQuery(''); setLevelFilter(''); setSelectedCategory(''); }} style={{
              padding: '8px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', flexShrink: 0, minHeight: 36,
            }}><X size={12} /> Clear</button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>Loading skills...</p>
          </div>
        )}

        {/* Results — responsive grid */}
        {!loading && filtered.length > 0 && (
          <div className="skill-grid">
            {filtered.map(listing => <SkillCard key={listing.id} listing={listing} />)}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <Search size={40} style={{ color: 'var(--color-text-muted)', marginBottom: 12 }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>No skills found</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Try different search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
