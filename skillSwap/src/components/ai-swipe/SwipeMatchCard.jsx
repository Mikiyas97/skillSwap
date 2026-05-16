/**
 * SwipeMatchCard — Large interactive swipe card with Framer Motion.
 * Supports drag left/right, rotation while dragging, snap off-screen,
 * and shows INTERESTED/SKIP indicators based on drag direction.
 */

import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ThumbsUp, X } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import MatchScoreBadge from '../AI/MatchScoreBadge';

export default function SwipeMatchCard({ match, onSwipeLeft, onSwipeRight, style = {} }) {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.8, 1, 0.8, 0.5]);

  // Indicator opacity based on drag
  const interestedOpacity = useTransform(x, [0, 80, 150], [0, 0.6, 1]);
  const skipOpacity = useTransform(x, [-150, -80, 0], [1, 0.6, 0]);

  const { listing, score, reason } = match;
  const tutor = listing?.tutor;

  const handleDragEnd = (_, info) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      setExitX(500);
      onSwipeRight?.();
    } else if (info.offset.x < -threshold) {
      setExitX(-500);
      onSwipeLeft?.();
    }
  };

  return (
    <motion.div
      style={{
        position: 'absolute', width: '100%', maxWidth: 420,
        x, rotate, opacity,
        cursor: 'grab',
        ...style,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Card body */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        padding: 28,
        minHeight: 480,
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>

        {/* Swipe indicators */}
        <motion.div style={{
          position: 'absolute', top: 24, right: 24, zIndex: 10,
          opacity: interestedOpacity,
          background: 'rgba(16,185,129,0.2)', border: '2px solid #10B981',
          borderRadius: 12, padding: '8px 18px',
          display: 'flex', alignItems: 'center', gap: 6,
          transform: 'rotate(12deg)',
        }}>
          <ThumbsUp size={18} style={{ color: '#10B981' }} />
          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#10B981' }}>INTERESTED</span>
        </motion.div>

        <motion.div style={{
          position: 'absolute', top: 24, left: 24, zIndex: 10,
          opacity: skipOpacity,
          background: 'rgba(239,68,68,0.2)', border: '2px solid #EF4444',
          borderRadius: 12, padding: '8px 18px',
          display: 'flex', alignItems: 'center', gap: 6,
          transform: 'rotate(-12deg)',
        }}>
          <X size={18} style={{ color: '#EF4444' }} />
          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#EF4444' }}>SKIP</span>
        </motion.div>

        {/* Score badge — top center */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, marginTop: 8 }}>
          <MatchScoreBadge score={score} size={72} />
        </div>

        {/* Tutor info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <Avatar name={tutor?.name || 'User'} size={48} />
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2, color: '#fff' }}>
              {listing?.title}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              by {tutor?.name || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Department */}
        {tutor?.department && (
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
            📚 {tutor.department}
          </p>
        )}

        {/* Match reason */}
        <div style={{
          background: 'rgba(108,99,255,0.08)', borderRadius: 12,
          padding: '12px 16px', marginBottom: 16,
          border: '1px solid rgba(108,99,255,0.15)',
        }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
            "{reason}"
          </p>
        </div>

        {/* Category & tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
          {listing?.category && (
            <Badge variant="accent" size="xs">{listing.category}</Badge>
          )}
          {(listing?.tags || []).slice(0, 4).map(tag => (
            <span key={tag} style={{
              fontSize: '0.72rem', padding: '3px 10px', borderRadius: 12,
              background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>{tag}</span>
          ))}
        </div>

        {/* Rating info */}
        {tutor?.rating > 0 && (
          <div style={{
            display: 'flex', gap: 16, marginTop: 14, paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              ⭐ {tutor.rating} rating
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              📖 {tutor.sessions_completed || 0} sessions
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
