/**
 * SwipeDeck — Manages the swipe card stack.
 * Handles current index, previous/next, keyboard support,
 * and stores interested/skipped counts in localStorage.
 */

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ThumbsUp, MessageCircle, Calendar, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SwipeMatchCard from './SwipeMatchCard';

const STORAGE_KEY = 'ai-swipe-activity';

function getActivity() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { interested: 0, skipped: 0, lastViewed: null };
  } catch {
    return { interested: 0, skipped: 0, lastViewed: null };
  }
}

function updateActivity(patch) {
  const current = getActivity();
  const updated = { ...current, ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export default function SwipeDeck({ matches, type = 'tutor' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(null);
  const [likedCurrent, setLikedCurrent] = useState(false);
  const navigate = useNavigate();

  const total = matches.length;
  const current = matches[currentIndex];
  const hasNext = currentIndex < total - 1;
  const hasPrev = currentIndex > 0;

  const handleSwipeRight = useCallback(() => {
    if (likedCurrent) return; // Prevent double-liking
    const activity = getActivity();
    updateActivity({
      interested: activity.interested + 1,
      lastViewed: current?.listing?.title || null,
    });
    setDirection('right');
    setTimeout(() => {
      setLikedCurrent(true);
      setDirection(null);
    }, 300);
  }, [current, likedCurrent]);

  const handleSwipeLeft = useCallback(() => {
    setLikedCurrent(false);
    const activity = getActivity();
    updateActivity({
      skipped: activity.skipped + 1,
      lastViewed: current?.listing?.title || null,
    });
    setDirection('left');
    setTimeout(() => {
      if (currentIndex < total - 1) {
        setCurrentIndex(i => i + 1);
      }
      setDirection(null);
    }, 300);
  }, [current, currentIndex, total]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      setDirection('right');
      setTimeout(() => {
        setLikedCurrent(false);
        setCurrentIndex(i => i + 1);
        setDirection(null);
      }, 200);
    }
  }, [hasNext]);

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      setDirection('left');
      setTimeout(() => {
        setLikedCurrent(false);
        setCurrentIndex(i => i - 1);
        setDirection(null);
      }, 200);
    }
  }, [hasPrev]);

  // Keyboard support
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') handleSwipeRight();
      if (e.key === 'ArrowLeft') handleSwipeLeft();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSwipeRight, handleSwipeLeft]);

  // End of deck
  if (!current || currentIndex >= total) {
    return (
      <div style={{
        textAlign: 'center', padding: 48,
        background: 'rgba(255,255,255,0.03)', borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(108,99,255,0.1)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <ThumbsUp size={28} style={{ color: 'var(--color-primary-light)' }} />
        </div>
        <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', marginBottom: 6 }}>
          No more matches available
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Check back later as more students join SkillSwap DBU!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Counter */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <span style={{
          fontSize: '0.8rem', fontWeight: 600,
          color: 'var(--color-text-muted)',
          background: 'rgba(255,255,255,0.05)',
          padding: '4px 14px', borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {currentIndex + 1} of {total} {type === 'study' ? 'partners' : 'matches'}
        </span>
      </div>

      {/* Card container */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 420,
        margin: '0 auto', minHeight: 500,
        display: 'flex', justifyContent: 'center',
      }}>
        {/* Stacked card effect — show next card behind */}
        {hasNext && matches[currentIndex + 1] && (
          <div style={{
            position: 'absolute', width: '100%', maxWidth: 420,
            transform: 'scale(0.95) translateY(10px)',
            opacity: 0.4, pointerEvents: 'none',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(10px)',
              borderRadius: 24, minHeight: 480,
            }} />
          </div>
        )}

        <AnimatePresence mode="wait">
          <SwipeMatchCard
            key={currentIndex}
            match={current}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
          />
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: 12, marginTop: 24, minHeight: 60
      }}>
        {likedCurrent ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 420 }}
            >
              <button
                onClick={() => navigate('/sessions')}
                className="btn-primary"
                style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
              >
                <Calendar size={18} /> Book Session
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="btn-secondary"
                style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
              >
                <MessageCircle size={18} /> Message
              </button>
              {hasNext && (
                <button
                  onClick={handleNext}
                  style={{
                    width: 48, height: 48, borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  title="Next Match"
                >
                  <ArrowRight size={20} />
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <>
            <motion.button
              onClick={handlePrev}
              disabled={!hasPrev}
              whileHover={hasPrev ? { scale: 1.1, backgroundColor: 'rgba(255,255,255,0.08)' } : {}}
              whileTap={hasPrev ? { scale: 0.9 } : {}}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.1)',
                background: hasPrev ? 'rgba(255,255,255,0.05)' : 'transparent',
                color: hasPrev ? 'var(--color-text-secondary)' : 'rgba(255,255,255,0.15)',
                cursor: hasPrev ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border 0.2s, color 0.2s',
              }}
              title="Previous"
            >
              <ChevronLeft size={20} />
            </motion.button>

            <motion.button
              onClick={handleSwipeLeft}
              whileHover={{ scale: 1.15, backgroundColor: '#EF4444', color: '#ffffff' }}
              whileTap={{ scale: 0.85, rotate: -15, backgroundColor: '#EF4444', color: '#ffffff' }}
              animate={direction === 'left' ? { scale: 0.85, rotate: -15, backgroundColor: '#EF4444', color: '#ffffff' } : { backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
              style={{
                width: 56, height: 56, borderRadius: '50%',
                border: '2px solid rgba(239,68,68,0.3)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border 0.2s',
              }}
              title="Skip"
            >
              <X size={28} strokeWidth={2.5} />
            </motion.button>

            <motion.button
              onClick={handleSwipeRight}
              whileHover={{ scale: 1.15, backgroundColor: '#10B981', color: '#ffffff' }}
              whileTap={{ scale: 0.85, rotate: 15, backgroundColor: '#10B981', color: '#ffffff' }}
              animate={direction === 'right' ? { scale: 0.85, rotate: 15, backgroundColor: '#10B981', color: '#ffffff' } : { backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981' }}
              style={{
                width: 56, height: 56, borderRadius: '50%',
                border: '2px solid rgba(16,185,129,0.3)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border 0.2s',
              }}
              title="Interested"
            >
              <ThumbsUp size={24} strokeWidth={2.5} />
            </motion.button>

            <motion.button
              onClick={handleNext}
              disabled={!hasNext}
              whileHover={hasNext ? { scale: 1.1, backgroundColor: 'rgba(255,255,255,0.08)' } : {}}
              whileTap={hasNext ? { scale: 0.9 } : {}}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.1)',
                background: hasNext ? 'rgba(255,255,255,0.05)' : 'transparent',
                color: hasNext ? 'var(--color-text-secondary)' : 'rgba(255,255,255,0.15)',
                cursor: hasNext ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border 0.2s, color 0.2s',
              }}
              title="Next"
            >
              <ChevronRight size={20} />
            </motion.button>
          </>
        )}
      </div>

      {/* Keyboard hint */}
      <p style={{
        textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)',
        marginTop: 12,
      }}>
        Use ← → arrow keys to swipe
      </p>
    </div>
  );
}
