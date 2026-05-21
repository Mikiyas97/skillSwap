import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Star, BookOpen, MessageCircle, ArrowLeft } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import StarRating from '../components/ui/StarRating';
import BookingModal from '../components/BookingModal';
import { fetchSkillDetail, fetchTutorReviews } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SkillDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [showBooking, setShowBooking] = useState(false);
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchSkillDetail(id);
        setListing(data);
        if (data?.tutor?.id) {
          const revs = await fetchTutorReviews(data.tutor.id);
          setReviews(revs);
        }
      } catch (err) {
        console.error("Failed to load skill details:", err);
        setListing(null);
        setReviews([]);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!listing) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.3rem', marginBottom: 12 }}>Skill not found</h2>
        <Link to="/browse" className="btn-primary">Browse Skills</Link>
      </div>
    </div>
  );

  const tutor = listing.tutor;

  return (
    <div className="page-padding" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Link to="/browse" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: 20, minHeight: 44 }}><ArrowLeft size={16} /> Back to Browse</Link>

        <div className="skill-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, alignItems: 'start' }}>
          {/* Main */}
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              <Badge variant={listing.level === 'Beginner' ? 'success' : listing.level === 'Intermediate' ? 'warning' : 'danger'}>{listing.level}</Badge>
              {listing.tags.map(t => <Badge key={t} size="xs">{t}</Badge>)}
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(1.3rem, 4vw, 2rem)', marginBottom: 10 }}>{listing.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap', fontSize: '0.82rem' }}>
              <StarRating rating={listing.rating} />
              <span style={{ color: 'var(--color-text-muted)' }}>{listing.totalReviews} reviews</span>
              <span style={{ color: 'var(--color-text-muted)' }}>{listing.sessionsCompleted} sessions</span>
            </div>

            {/* Tutor card — visible on mobile (hidden on desktop where sidebar shows) */}
            <div className="glass-card skill-detail-tutor-mobile" style={{ padding: '18px 16px', marginBottom: 20 }}>
              <Link to={`/user/${tutor.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, textDecoration: 'none', color: 'inherit' }}>
                <Avatar name={tutor.name} size={48} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="text-truncate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem' }}>{tutor.name}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{tutor.department} · {tutor.year}</p>
                </div>
              </Link>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14, textAlign: 'center' }}>
                {[
                  { value: tutor.sessions_completed, label: 'Sessions' },
                  { value: tutor.rating, label: 'Rating' },
                  { value: tutor.total_reviews, label: 'Reviews' },
                ].map((s, i) => (<div key={i}><p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>{s.value}</p><p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{s.label}</p></div>))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowBooking(true)} className="btn-primary btn-inline" style={{ flex: 1, justifyContent: 'center', width: 'auto' }}><Calendar size={15} /> Book</button>
                <Link to="/chat" state={{ targetUser: tutor }} className="btn-secondary btn-inline" style={{ flex: 1, justifyContent: 'center', display: 'flex', width: 'auto' }}><MessageCircle size={15} /> Message</Link>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px 18px', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>About this skill</h3>
              <p className="text-break" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{listing.description}</p>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={15} style={{ color: 'var(--color-primary)' }} /><span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Available: {listing.availability}</span></div>
            </div>

            {/* Reviews */}
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.05rem', marginBottom: 14 }}>Student Reviews ({reviews.length})</h3>
            {reviews.length > 0 ? reviews.map(r => (
              <div key={r.id} className="glass-card" style={{ padding: '16px 14px', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Avatar name={r.student?.name || 'Student'} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="text-truncate" style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.student?.name || 'Student'}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{r.date}</p>
                  </div>
                  <StarRating rating={r.rating} size={13} showValue={false} />
                </div>
                <p className="text-break" style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{r.comment}</p>
              </div>
            )) : (<p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No reviews yet</p>)}
          </div>

          {/* Sidebar — desktop only */}
          <div className="glass-card skill-detail-sidebar" style={{ padding: 24, position: 'sticky', top: 80 }}>
            <Link to={`/user/${tutor.id}`} style={{ textAlign: 'center', marginBottom: 16, display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <Avatar name={tutor.name} size={56} style={{ margin: '0 auto 10px' }} />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.05rem' }}>{tutor.name}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{tutor.department} · {tutor.year}</p>
            </Link>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16, textAlign: 'center' }}>
              {[
                { value: tutor.sessions_completed, label: 'Sessions' },
                { value: tutor.rating, label: 'Rating' },
                { value: tutor.total_reviews, label: 'Reviews' },
              ].map((s, i) => (<div key={i}><p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>{s.value}</p><p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{s.label}</p></div>))}
            </div>
            {tutor.bio && <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{tutor.bio}</p>}
            <button onClick={() => setShowBooking(true)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}><Calendar size={15} /> Book a Session</button>
            <Link to="/chat" state={{ targetUser: tutor }} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}><MessageCircle size={15} /> Message</Link>
          </div>
        </div>
      </div>
      {showBooking && <BookingModal listing={listing} onClose={() => setShowBooking(false)} />}
      <style>{`
        @media(min-width:768px){
          .skill-detail-grid{grid-template-columns:1fr 320px !important;}
          .skill-detail-tutor-mobile{display:none !important;}
        }
        @media(max-width:767px){
          .skill-detail-sidebar{display:none !important;}
        }
      `}</style>
    </div>
  );
}
