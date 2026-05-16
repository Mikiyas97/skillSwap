import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Edit, BookOpen, Star, Calendar, Trophy, Mail } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import StarRating from '../components/ui/StarRating';
import { fetchProfile, fetchTutorReviews, fetchMyListings } from '../services/api';
import SkillCard from '../components/SkillCard';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myListings, setMyListings] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [p, listings] = await Promise.all([
          fetchProfile(),
          fetchMyListings().catch(() => [])
        ]);
        setProfile(p);
        setMyListings(listings);
        
        if (p?.id) {
          const revs = await fetchTutorReviews(p.id);
          setReviews(revs);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        // Fallback to user_metadata
        const meta = user?.user_metadata || {};
        setProfile({
          id: user?.id,
          name: meta.name || user?.email?.split('@')[0] || 'Student',
          email: user?.email || '',
          department: meta.department || '',
          year: meta.year || '',
          bio: meta.bio || '',
          avatar: meta.avatar || '',
          skills_teaching: meta.skills_teaching || [],
          rating: meta.rating || 0,
          total_reviews: meta.total_reviews || 0,
          sessions_completed: meta.sessions_completed || 0,
          badges: meta.badges || [],
        });
        setReviews([]);
        setMyListings([]);
      }
    }
    load();
  }, [user]);

  const p = profile || {};
  const name = p.name || 'Student';

  return (
    <div className="page-padding" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Profile header */}
        <div className="glass-card" style={{ padding: '24px 20px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 70, borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(78,205,196,0.2))' }} />
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, paddingTop: 28 }}>
            <Avatar name={name} src={p.avatar} size={72} />
            <div style={{ textAlign: 'center', minWidth: 0, width: '100%' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(1.2rem, 4vw, 1.5rem)' }}>{name}</h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 3 }}>
                {p.department || 'DBU Student'}{p.year ? ` · ${p.year}` : ''}
              </p>
              <p className="text-truncate" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                <Mail size={13} /> {p.email || user?.email}
              </p>
            </div>
            <Link to="/profile/edit" className="btn-secondary btn-inline" style={{ padding: '8px 16px', fontSize: '0.85rem', width: 'auto' }}><Edit size={14} /> Edit</Link>
          </div>

          {/* Stats — responsive grid */}
          <div className="profile-stats-grid" style={{ marginTop: 20 }}>
            {[
              { value: p.sessions_completed || 0, label: 'Sessions', icon: BookOpen, color: '#6C63FF' },
              { value: typeof p.rating === 'number' ? p.rating.toFixed(1) : '0.0', label: 'Rating', icon: Star, color: '#F59E0B' },
              { value: p.total_reviews || 0, label: 'Reviews', icon: Calendar, color: '#4ECDC4' },
              { value: p.badges?.length || 0, label: 'Badges', icon: Trophy, color: '#FF6B6B' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{ padding: '10px 8px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <Icon size={16} style={{ color: s.color, marginBottom: 4 }} />
                  <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>{s.value}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bio & Skills */}
        <div className="profile-grid" style={{ marginBottom: 20 }}>
          <div className="glass-card" style={{ padding: '20px 18px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>About</h3>
            <p className="text-break" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.88rem' }}>{p.bio || 'No bio yet. Tell others about yourself!'}</p>
          </div>
          <div className="glass-card" style={{ padding: '20px 18px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(p.skills_teaching || []).map(s => <Badge key={s}>{s}</Badge>)}
              {!(p.skills_teaching?.length) && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No skills added yet</p>}
            </div>
          </div>
        </div>

        {/* My Posts */}
        <div className="glass-card" style={{ padding: '20px 18px', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: 14 }}>My Posts</h3>
          {myListings.length > 0 ? (
            <div className="my-posts-grid">
              {myListings.map(listing => <SkillCard key={listing.id} listing={listing} />)}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>You haven't posted any skills yet.</p>
          )}
        </div>

        {/* Badges */}
        {p.badges?.length > 0 && (
          <div className="glass-card" style={{ padding: '20px 18px', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>Badges</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {p.badges.map(b => <Badge key={b} variant="gold" size="md">{b}</Badge>)}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="glass-card" style={{ padding: '20px 18px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: 14 }}>Reviews ({reviews.length})</h3>
          {reviews.length > 0 ? reviews.map(r => (
            <div key={r.id} style={{ padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Avatar name={r.student?.name || 'Student'} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="text-truncate" style={{ fontWeight: 600, fontSize: '0.82rem' }}>{r.student?.name || 'Student'}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{r.date}</p>
                </div>
                <StarRating rating={r.rating} size={12} showValue={false} />
              </div>
              <p className="text-break" style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{r.comment}</p>
            </div>
          )) : <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>No reviews yet</p>}
        </div>
      </div>
    </div>
  );
}
