import { motion } from 'framer-motion';
import { Trophy, Star, Crown } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { fetchLeaderboard } from '../services/api';
import { useAPI } from '../hooks/useAPI';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
  const { user } = useAuth();
  const { data: leaderboard, loading } = useAPI(
    () => fetchLeaderboard(),
    [],
  );

  const entries = leaderboard || [];
  const top3 = entries.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]]; // silver, gold, bronze
  const podiumHeights = [100, 140, 80];
  const podiumColors = ['#C0C0C0', '#FFD700', '#CD7F32'];
  const podiumLabels = ['2nd', '1st', '3rd'];

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="page-padding" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 className="heading-xl" style={{ marginBottom: 6 }}>
            <span className="gradient-text">Leaderboard</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Top tutors on SkillSwap DBU</p>
        </div>

        {/* Podium */}
        <div className="podium-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 12, marginBottom: 32, padding: '0 12px' }}>
          {podiumOrder.map((entry, i) => entry && (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 * i }}
              style={{ textAlign: 'center', flex: 1, maxWidth: 140 }}>
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <Avatar name={entry.name} size={i === 1 ? 60 : 48} style={{ margin: '0 auto', border: `3px solid ${podiumColors[i]}` }} />
                {i === 1 && <Crown size={20} style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', color: '#FFD700' }} />}
              </div>
              <p className="text-truncate" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 2 }}>{entry.name}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>{entry.score} pts</p>
              <div style={{
                height: podiumHeights[i], borderRadius: '10px 10px 0 0',
                background: `linear-gradient(180deg, ${podiumColors[i]}30, ${podiumColors[i]}10)`,
                border: `1px solid ${podiumColors[i]}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', color: podiumColors[i],
              }}>{podiumLabels[i]}</div>
            </motion.div>
          ))}
        </div>

        {/* Your Rank Banner */}
        {(() => {
          let myEntry = entries.find(e => e.email && user?.email && e.email.toLowerCase() === user.email.toLowerCase());
          
          if (!myEntry && user) {
            myEntry = {
              rank: '-',
              score: 0,
              name: user.name,
            };
          }

          if (!myEntry) return null;
          return (
            <div className="glass-card rank-banner" style={{ padding: '16px 20px', marginBottom: 24, background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(78,205,196,0.1))', border: '1px solid var(--color-primary)', display: 'flex', alignItems: 'center', gap: 16 }}>
               <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.3rem', color: '#fff', flexShrink: 0 }}>
                 {myEntry.rank}
               </div>
               <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', fontFamily: 'var(--font-heading)', marginBottom: 2 }}>
                    {myEntry.rank === '-' ? 'You are currently Unranked' : `Your Rank: #${myEntry.rank}`}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
                    {myEntry.rank === '-' ? 'Complete your first tutoring session to enter the leaderboard!' : 'Keep tutoring to climb higher on the board!'}
                  </p>
                  {user?.badges?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      {user.badges.map(b => <Badge key={b} variant="gold" size="xs">{b}</Badge>)}
                    </div>
                  )}
               </div>
               <div style={{ textAlign: 'right', flexShrink: 0 }}>
                   <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>{myEntry.score} <span style={{fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)'}}>pts</span></p>
                   {myEntry.rank !== '-' && <p style={{ fontSize: '0.78rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>Top Tutor</p>}
               </div>
            </div>
          );
        })()}

        {/* Full list — responsive via CSS classes */}
        <div>
          {entries.map((entry, i) => {
            const isMe = entry.email && user?.email && entry.email.toLowerCase() === user.email.toLowerCase();
            return (
            <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
              className="glass-card leaderboard-entry" style={{ marginBottom: 8, background: isMe ? 'rgba(108,99,255,0.15)' : '', border: isMe ? '1px solid rgba(108,99,255,0.5)' : '' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.8rem', flexShrink: 0,
                background: entry.rank <= 3 ? `${['#FFD700', '#C0C0C0', '#CD7F32'][entry.rank - 1]}20` : 'rgba(255,255,255,0.04)',
                color: entry.rank <= 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][entry.rank - 1] : 'var(--color-text-muted)',
              }}>{entry.rank}</div>
              <Avatar name={entry.name} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="text-truncate" style={{ fontWeight: 600, fontSize: '0.88rem' }}>{entry.name}</p>
                <p className="text-truncate" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{entry.department}</p>
              </div>
              <div className="leaderboard-stats">
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{entry.sessions_completed}</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Sessions</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#F59E0B' }}>{entry.rating}</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Rating</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary-light)' }}>{entry.score}</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Points</p>
                </div>
              </div>
              {entry.badges?.slice(0, 1).map(b => <Badge key={b} variant="gold" size="xs">{b}</Badge>)}
            </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
