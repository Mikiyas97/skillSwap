import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, MessageCircle, Trophy, Clock, TrendingUp, Plus, ArrowRight, Star, Wifi, WifiOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { fetchSessions, fetchProfile } from '../services/api';

function AiActivityWidget() {
  let activity = { interested: 0, skipped: 0, lastViewed: null };
  try {
    const stored = localStorage.getItem('ai-swipe-activity');
    if (stored) activity = JSON.parse(stored);
  } catch {}

  if (activity.interested === 0 && activity.skipped === 0) return null;

  return (
    <div className="glass-card" style={{ padding: 18, marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Sparkles size={16} style={{ color: '#F59E0B' }} />
        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>AI Match Activity</span>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#10B981' }}>{activity.interested}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Interested</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#EF4444' }}>{activity.skipped}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Skipped</p>
        </div>
      </div>
      {activity.lastViewed && (
        <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
          Last viewed: {activity.lastViewed}
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [p, s] = await Promise.all([
          fetchProfile(),
          fetchSessions('upcoming'),
        ]);
        setProfile(p);
        setSessions(s.slice(0, 3));
        setIsLive(true);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        // Fallback to user_metadata only for profile
        const meta = user?.user_metadata || {};
        setProfile({
          name: meta.name || user?.email?.split('@')[0] || 'Student',
          department: meta.department || '',
          year: meta.year || '',
          avatar: meta.avatar || '',
          sessions_completed: meta.sessions_completed || 0,
          rating: meta.rating || 0,
          total_reviews: meta.total_reviews || 0,
          badges: meta.badges || [],
        });
        setSessions([]);
      }
    }
    load();
  }, [user]);

  const p = profile || {};
  const name = p.name || user?.email?.split('@')[0] || 'Student';

  const statCards = [
    { label: 'Sessions', value: p.sessions_completed || 0, icon: BookOpen, color: '#6C63FF' },
    { label: 'Rating', value: typeof p.rating === 'number' ? p.rating.toFixed(1) : '0.0', icon: Star, color: '#F59E0B' },
    { label: 'Reviews', value: p.total_reviews || 0, icon: MessageCircle, color: '#4ECDC4' },
    { label: 'Badges', value: p.badges?.length || 0, icon: Trophy, color: '#FF6B6B' },
  ];

  const quickActions = [
    { to: '/offer', label: 'Offer a Skill', icon: Plus, color: '#6C63FF' },
    { to: '/browse', label: 'Find a Tutor', icon: TrendingUp, color: '#4ECDC4' },
    { to: '/ai-matches', label: 'AI Matchmaker', icon: Sparkles, color: '#F59E0B' },
    { to: '/chat', label: 'Messages', icon: MessageCircle, color: '#FF6B6B' },
  ];

  return (
    <div className="page-padding" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Avatar name={name} src={p.avatar} size={48} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(1.25rem, 4vw, 1.8rem)' }}>
                Welcome back, <span className="gradient-text">{name.split(' ')[0]}</span>
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{p.department || 'DBU Student'} · {p.year || ''}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: isLive ? '#44CF6C' : 'var(--color-text-muted)', flexShrink: 0 }}>
              {isLive ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isLive ? 'Live' : 'Demo'}
            </div>
          </div>
        </motion.div>

        {/* Stats — 2 cols mobile, 4 cols desktop */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                className="glass-card" style={{ padding: '16px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} style={{ color: card.color }} />
                  </div>
                </div>
                <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem' }}>{card.value}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{card.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="dash-grid">
          {/* Upcoming Sessions */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 12 }}>Upcoming Sessions</h2>
            {sessions.length > 0 ? sessions.map(session => {
              const isTutor = String(session.tutor?.id) === String(user?.id);
              const otherPerson = isTutor ? session.student : session.tutor;
              const otherName = otherPerson?.name || (isTutor ? 'Student' : 'Tutor');

              return (
              <div key={session.id} className="glass-card" style={{ padding: '14px 16px', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={otherName} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="text-truncate" style={{ fontWeight: 600, fontSize: '0.88rem' }}>{session.skill}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>with {otherName}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-primary-light)' }}>{session.date}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{session.time}</p>
                  </div>
                </div>
              </div>
            )}) : (
              <div className="glass-card" style={{ padding: '32px 20px', textAlign: 'center' }}>
                <Clock size={28} style={{ color: 'var(--color-text-muted)', marginBottom: 10 }} />
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No upcoming sessions</p>
                <Link to="/browse" style={{ color: 'var(--color-primary-light)', fontSize: '0.85rem', fontWeight: 600 }}>Find a tutor</Link>
              </div>
            )}
            <Link to="/sessions" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary-light)', fontSize: '0.85rem', fontWeight: 600, marginTop: 10 }}>View all sessions <ArrowRight size={14} /></Link>

            {/* Badges */}
            {p.badges?.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 12 }}>Your Badges</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {p.badges.map(badge => <Badge key={badge} variant="gold" size="md">{badge}</Badge>)}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 12 }}>Quick Actions</h2>
            <div className="quick-actions-grid">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <Link key={i} to={action.to} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', textDecoration: 'none', minHeight: 44 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${action.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} style={{ color: action.color }} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-primary)', flex: 1 }}>{action.label}</span>
                    <ArrowRight size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  </Link>
                );
              })}
            </div>

            {/* AI Match Activity */}
            <AiActivityWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
