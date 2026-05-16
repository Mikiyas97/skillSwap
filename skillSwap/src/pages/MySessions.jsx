import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, Star, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import StarRating from '../components/ui/StarRating';
import { fetchSessions, submitReview, completeSession } from '../services/api';
import { useAPI } from '../hooks/useAPI';
import { useAuth } from '../context/AuthContext';

export default function MySessions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('upcoming');
  const [reviewForm, setReviewForm] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const tabs = ['upcoming', 'completed'];

  const { data: allSessions, refetch } = useAPI(
    () => fetchSessions(),
    [],
  );

  const sessions = (allSessions || []).filter(s => s.status === tab);

  useEffect(() => {
    // Short polling: auto-refresh sessions every 5 seconds 
    // so tutors can see new reviews instantly when submitted by students
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleReview = async (sessionId) => {
    if (reviewRating < 1) return;
    try {
      await submitReview(sessionId, { rating: reviewRating, comment: reviewComment });
      await refetch();
    } catch (err) {
      console.warn('Review submit failed (mock mode):', err.message);
    }
    setReviewForm(null);
    setReviewRating(0);
    setReviewComment('');
  };

  const handleComplete = async (sessionId) => {
    try {
      await completeSession(sessionId);
      await refetch();
    } catch (err) {
      console.error('Failed to complete session:', err);
    }
  };

  return (
    <div className="page-padding" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h1 className="heading-xl" style={{ marginBottom: 20 }}>My <span className="gradient-text">Sessions</span></h1>

        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--color-dark-800)', borderRadius: 'var(--radius-md)', padding: 4 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '12px 0', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
              fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize', minHeight: 44,
              background: tab === t ? 'var(--color-primary)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--color-text-muted)',
              transition: 'all 0.2s',
            }}>{t}</button>
          ))}
        </div>

        {sessions.length > 0 ? sessions.map(session => {
          const isTutor = session.tutor?.email && user?.email && session.tutor.email.toLowerCase() === user.email.toLowerCase();
          const otherPerson = isTutor ? session.student : session.tutor;
          const otherName = otherPerson?.name || (isTutor ? 'Student' : 'Tutor');

          return (
          <div key={session.id} className="glass-card" style={{ padding: '18px 16px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Avatar name={otherName} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="text-truncate" style={{ fontWeight: 600, fontSize: '0.92rem' }}>{session.skill}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>with {otherName}</p>
              </div>
              <button 
                onClick={() => navigate('/chat', { state: { targetUser: otherPerson } })}
                style={{
                  background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)',
                  borderRadius: 'var(--radius-full)', width: 36, height: 36, display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  color: 'var(--color-primary-light)', flexShrink: 0,
                }}
                title={`Message ${otherName}`}
              >
                <MessageCircle size={16} />
              </button>
              <Badge variant={session.status === 'upcoming' ? 'accent' : 'success'}>{session.status}</Badge>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: '0.82rem', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} /> {session.date}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} /> {session.time}</span>
            </div>
            {session.location && <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 6 }}>Location: {session.location}</p>}

            {session.status === 'upcoming' && (
              <button 
                onClick={() => handleComplete(session.id)}
                style={{
                  marginTop: 12, padding: '10px 18px', background: 'var(--color-primary)', 
                  border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', 
                  fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
                  display: 'flex', alignItems: 'center', gap: 6, minHeight: 44,
                }}
              >
                <CheckCircle size={16} />
                Mark as Completed
              </button>
            )}

            {session.status === 'completed' && session.review && (
              <div style={{ marginTop: 14, padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <StarRating rating={session.review.rating} size={13} showValue={false} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{isTutor ? 'Review received' : 'Your review'}</span>
                </div>
                <p className="text-break" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{session.review.comment}</p>
              </div>
            )}

            {session.status === 'completed' && !session.review && !isTutor && reviewForm !== session.id && (
              <button onClick={() => setReviewForm(session.id)} style={{
                marginTop: 10, padding: '10px 16px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary-light)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 6, minHeight: 44,
              }}><Star size={14} />Leave a Review</button>
            )}
            
            {session.status === 'completed' && !session.review && isTutor && (
              <div style={{ marginTop: 10 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Awaiting student review...</span>
              </div>
            )}

            {!isTutor && reviewForm === session.id && (
              <div style={{ marginTop: 14, padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 8 }}>Rate your session</p>
                <StarRating rating={reviewRating} interactive onChange={setReviewRating} showValue={false} size={24} />
                <textarea className="input-field" rows={3} placeholder="Write your review..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} style={{ marginTop: 10, resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={() => handleReview(session.id)} className="btn-primary btn-inline" style={{ padding: '10px 20px', width: 'auto' }}>Submit</button>
                  <button onClick={() => setReviewForm(null)} className="btn-secondary btn-inline" style={{ padding: '10px 20px', width: 'auto' }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}) : (
          <div className="glass-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Calendar size={36} style={{ color: 'var(--color-text-muted)', marginBottom: 10 }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No {tab} sessions</p>
          </div>
        )}
      </div>
    </div>
  );
}
