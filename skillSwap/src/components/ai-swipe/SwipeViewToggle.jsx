/**
 * SwipeViewToggle — Toggle between List View and Swipe View.
 * Persists selection in localStorage. Defaults based on screen size.
 */

import { List, Layers } from 'lucide-react';

export default function SwipeViewToggle({ view, onChange }) {
  return (
    <div style={{
      display: 'flex', borderRadius: 10, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.03)',
    }}>
      <button
        onClick={() => onChange('list')}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 14px', border: 'none', cursor: 'pointer',
          fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-body)',
          background: view === 'list' ? 'var(--color-primary)' : 'transparent',
          color: view === 'list' ? '#fff' : 'var(--color-text-muted)',
          transition: 'all 0.2s',
        }}
      >
        <List size={14} />
        List
      </button>
      <button
        onClick={() => onChange('swipe')}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 14px', border: 'none', cursor: 'pointer',
          fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-body)',
          background: view === 'swipe' ? 'var(--color-primary)' : 'transparent',
          color: view === 'swipe' ? '#fff' : 'var(--color-text-muted)',
          transition: 'all 0.2s',
        }}
      >
        <Layers size={14} />
        Swipe
      </button>
    </div>
  );
}
