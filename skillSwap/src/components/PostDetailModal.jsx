import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Calendar, Clock, Star, MessageCircle, Tag } from 'lucide-react';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import StarRating from './ui/StarRating';
import { fetchListingReviews } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PostDetailModal({ listing, tutor, onClose, onBook, showActions = false }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    async function load() {
      setLoadingReviews(true);
      try {
        const revs = await fetchListingReviews(listing.id);
        setReviews(revs);
      } catch {
        setReviews([]);
      }
      setLoadingReviews(false);
    }
    load();
  }, [listing.id]);

  // Close on backdrop click
  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const levelVariant = listing.level === 'Beginner' ? 'success' : listing.level === 'Intermediate' ? 'warning' : 'danger';

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 640,
        maxHeight: '90vh',
        background: 'var(--glass-bg, #16161e)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px 20px 0 0',
        overflowY: 'auto',
        animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 20px 0' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              <Badge variant={levelVariant} size="xs">{listing.level}</Badge>
              {listing.tags?.map(t => <Badge key={t} size="xs">{t}</Badge>)}
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)', lineHeight: 1.3, marginBottom: 4 }}>
              {listing.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
              <StarRating rating={listing.rating} size={13} />
              <span>{listing.totalReviews} reviews</span>
              <span>·</span>
              <span>{listing.sessionsCompleted} sessions</span>
              {listing.created_at && (
                <>
                  <span>·</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {new Date(listing.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-muted)', flexShrink: 0, marginLeft: 12 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tutor row */}
        {tutor && (
          <Link
            to={`/user/${tutor.id}`}
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 20px', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', textDecoration: 'none', color: 'inherit', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Avatar name={tutor.name} src={tutor.avatar} size={40} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: '0.92rem' }}>{tutor.name}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{tutor.department}{tutor.year ? ` · ${tutor.year}` : ''}</p>
            </div>
          </Link>
        )}

        {/* Description */}
        <div style={{ padding: '0 20px 16px' }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', marginBottom: 8, color: 'var(--color-text-secondary)' }}>About this skill</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{listing.description}</p>
          {listing.availability && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
              <Clock size={14} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '0.83rem', color: 'var(--color-text-secondary)' }}>Available: {listing.availability}</span>
            </div>
          )}
        </div>

        {/* Action buttons — only shown on other user's profile */}
        {showActions && user && (
          <div style={{ display: 'flex', gap: 10, padding: '0 20px 16px' }}>
            <button
              onClick={() => { onClose(); onBook && onBook(listing); }}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Calendar size={15} /> Book Session
            </button>
            <Link
              to="/chat"
              state={{ targetUser: tutor }}
              onClick={onClose}
              className="btn-secondary"
              style={{ flex: 1, justifyContent: 'center', display: 'flex' }}
            >
              <MessageCircle size={15} /> Message
            </Link>
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 20px' }} />

        {/* Reviews */}
        <div style={{ padding: '16px 20px 32px' }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>
            Reviews ({loadingReviews ? '…' : reviews.length})
          </h4>

          {loadingReviews && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
              <div style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}

          {!loadingReviews && reviews.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Star size={28} style={{ color: 'var(--color-text-muted)', marginBottom: 8 }} />
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>No reviews for this post yet</p>
            </div>
          )}

          {!loadingReviews && reviews.map((r, i) => (
            <div key={r.id} style={{ padding: '12px 0', borderBottom: i < reviews.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Avatar name={r.student?.name || 'Student'} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="text-truncate" style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.student?.name || 'Student'}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{r.date}</p>
                </div>
                <StarRating rating={r.rating} size={13} showValue={false} />
              </div>
              <p className="text-break" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{r.comment}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @media (min-width: 640px) {
          .post-modal-inner {
            border-radius: 20px !important;
            margin: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
