import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { BookOpen, Star, Calendar, Trophy, Mail, MessageCircle, ArrowLeft } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import StarRating from '../components/ui/StarRating';
import SkillCard from '../components/SkillCard';
import PostDetailModal from '../components/PostDetailModal';
import BookingModal from '../components/BookingModal';
import { fetchUserById, fetchUserListings } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function UserProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [bookingListing, setBookingListing] = useState(null);

  // If viewing own profile, redirect
  const isOwnProfile = currentUser && String(currentUser.id) === String(id);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [p, userListings] = await Promise.all([
          fetchUserById(id),
          fetchUserListings(id).catch(() => []),
        ]);
        setProfile(p);
        setListings(userListings);
      } catch (err) {
        console.error("Failed to load user profile:", err);
        setProfile(null);
        setListings([]);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (isOwnProfile) return <Navigate to="/profile" replace />;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!profile) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.3rem', marginBottom: 12 }}>User not found</h2>
        <Link to="/browse" className="btn-primary">Browse Skills</Link>
      </div>
    </div>
  );

  const p = profile;
  const name = p.name || 'Student';

  return (
    <div className="page-padding" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link to="/browse" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: 20, minHeight: 44 }}>
          <ArrowLeft size={16} /> Back to Browse
        </Link>

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
                <Mail size={13} /> {p.email}
              </p>
            </div>

            {/* Action buttons */}
            {currentUser && (
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <Link to="/chat" state={{ targetUser: p }} className="btn-primary btn-inline" style={{ padding: '8px 18px', fontSize: '0.85rem', width: 'auto' }}>
                  <MessageCircle size={14} /> Message
                </Link>
              </div>
            )}
          </div>

          {/* Stats */}
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
            <p className="text-break" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.88rem' }}>{p.bio || 'No bio yet.'}</p>
          </div>
          <div className="glass-card" style={{ padding: '20px 18px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(p.skills_teaching || []).map(s => <Badge key={s}>{s}</Badge>)}
              {!(p.skills_teaching?.length) && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No skills listed</p>}
            </div>
          </div>
        </div>

        {/* Their Posts */}
        <div className="glass-card" style={{ padding: '20px 18px', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: 14 }}>{name}'s Posts ({listings.length})</h3>
          {listings.length > 0 ? (
            <div className="my-posts-grid">
              {listings.map(listing => (
                <SkillCard 
                  key={listing.id} 
                  listing={listing} 
                  onClick={() => setSelectedPost(listing)} 
                />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>No posts yet.</p>
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
      </div>

      {selectedPost && (
        <PostDetailModal 
          listing={selectedPost} 
          tutor={p} 
          onClose={() => setSelectedPost(null)} 
          showActions={true} 
          onBook={setBookingListing} 
        />
      )}

      {bookingListing && (
        <BookingModal 
          listing={bookingListing} 
          onClose={() => setBookingListing(null)} 
        />
      )}
    </div>
  );
}
