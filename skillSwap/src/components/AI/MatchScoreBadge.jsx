/**
 * MatchScoreBadge — Circular score indicator for AI match quality.
 * Visually dominant with strong contrast per spec.
 */

export default function MatchScoreBadge({ score, size = 56 }) {
  const getColor = (s) => {
    if (s >= 90) return { bg: 'rgba(16,185,129,0.15)', border: '#10B981', text: '#10B981' };
    if (s >= 70) return { bg: 'rgba(108,99,255,0.15)', border: '#6C63FF', text: '#6C63FF' };
    if (s >= 50) return { bg: 'rgba(245,158,11,0.15)', border: '#F59E0B', text: '#F59E0B' };
    return { bg: 'rgba(239,68,68,0.15)', border: '#EF4444', text: '#EF4444' };
  };

  const getLabel = (s) => {
    if (s >= 90) return 'Perfect';
    if (s >= 70) return 'Strong';
    if (s >= 50) return 'Good';
    return 'Partial';
  };

  const colors = getColor(score);

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: colors.bg, border: `2px solid ${colors.border}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontWeight: 800, fontSize: size * 0.32, color: colors.text, lineHeight: 1 }}>
        {score}
      </span>
      <span style={{ fontSize: size * 0.16, color: colors.text, opacity: 0.8, lineHeight: 1, marginTop: 1 }}>
        {getLabel(score)}
      </span>
    </div>
  );
}
