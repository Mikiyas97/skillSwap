import { Star } from 'lucide-react';

export default function StarRating({ rating, size = 16, showValue = true, interactive = false, onChange }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {stars.map(star => (
        <Star
          key={star}
          size={size}
          onClick={() => interactive && onChange?.(star)}
          style={{
            cursor: interactive ? 'pointer' : 'default',
            fill: star <= rating ? '#F59E0B' : 'transparent',
            color: star <= rating ? '#F59E0B' : 'var(--color-text-muted)',
            transition: 'all 0.2s',
          }}
        />
      ))}
      {showValue && (
        <span style={{ marginLeft: 4, fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          {rating?.toFixed(1)}
        </span>
      )}
    </div>
  );
}
