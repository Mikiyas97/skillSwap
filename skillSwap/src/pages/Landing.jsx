import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Users,
  BookOpen,
  MessageCircle,
  Trophy,
  Star,
  Zap,
  Shield,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import StarRating from '../components/ui/StarRating';
import { fetchSkillListings } from '../services/api';
import { useAPI } from '../hooks/useAPI';

const heroAvatars = [
  { id: '1', name: 'Abebe B.' },
  { id: '2', name: 'Sara M.' },
  { id: '3', name: 'Dawit T.' },
  { id: '4', name: 'Kidist A.' },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function Landing() {
  const { data: skills } = useAPI(fetchSkillListings, []);
  const trendingSkills = skills || [];

  return (
    <div>
      {/* Hero */}
      <section className="hero-bg" style={{ padding: 'clamp(60px, 12vw, 100px) 16px clamp(48px, 8vw, 80px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative orbs */}
        <div style={{
          position: 'absolute', top: '10%', left: '10%', width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(108,99,255,0.12), transparent 70%)',
          borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%', width: 250, height: 250,
          background: 'radial-gradient(circle, rgba(78,205,196,0.1), transparent 70%)',
          borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <motion.div {...fadeUp} style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Badge variant="accent" size="md" style={{ marginBottom: 16 }}>
            <Zap size={14} style={{ marginRight: 6 }} /> Built for DBU Students
          </Badge>

          <h1 style={{
            fontFamily: 'var(--font-heading)', fontWeight: 900,
            fontSize: 'clamp(2rem, 6vw, 4rem)', lineHeight: 1.1,
            marginBottom: 16,
          }}>
            Learn from Peers.{' '}
            <span className="gradient-text">Teach What You Know.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)', color: 'var(--color-text-secondary)',
            lineHeight: 1.7, maxWidth: 600, margin: '0 auto 28px',
          }}>
            SkillSwap connects Debre Birhan University students to exchange skills, 
            find tutors, and grow together — all free, all peer-to-peer.
          </p>

          <div className="hero-buttons">
            <Link to="/signup" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Get Started <ArrowRight size={18} />
            </Link>
            <Link to="/browse" className="btn-secondary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Browse Skills
            </Link>
          </div>
        </motion.div>

        {/* Floating avatars */}
        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex' }}>
            {heroAvatars.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                style={{ marginLeft: i > 0 ? -10 : 0 }}
              >
                <Avatar name={u.name} size={40} />
              </motion.div>
            ))}
          </div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}
          >
            Join 200+ DBU students already swapping skills
          </motion.span>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        padding: '32px 16px',
        background: 'var(--color-dark-800)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div className="stats-grid" style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          {[
            { value: '200+', label: 'Students', icon: Users },
            { value: '50+', label: 'Skills Listed', icon: BookOpen },
            { value: '500+', label: 'Sessions', icon: MessageCircle },
            { value: '4.8', label: 'Avg Rating', icon: Star },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                <Icon size={22} style={{ color: 'var(--color-primary)', marginBottom: 6 }} />
                <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', color: 'var(--color-text-primary)' }}>{stat.value}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 16px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 className="heading-xl" style={{ marginBottom: 8 }}>
              How It <span className="gradient-text">Works</span>
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: 500, margin: '0 auto', fontSize: '0.9rem' }}>
              Three simple steps to start learning from your peers
            </p>
          </div>

          <div className="steps-grid">
            {[
              { step: '01', title: 'Sign Up', desc: 'Create your account with your @dbu.edu.et email. Add your skills and what you want to learn.', icon: GraduationCap, color: '#6C63FF' },
              { step: '02', title: 'Find a Match', desc: 'Browse skill listings, read reviews, and find the perfect tutor or study partner.', icon: Users, color: '#4ECDC4' },
              { step: '03', title: 'Start Learning', desc: 'Book a session, chat in real-time, and leave a review after your session.', icon: Zap, color: '#FF6B6B' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * i }}
                  className="glass-card" style={{ padding: 'clamp(20px, 4vw, 32px)', textAlign: 'center' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: `${item.color}15`, border: `1px solid ${item.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <Icon size={26} style={{ color: item.color }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.1em' }}>
                    STEP {item.step}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', margin: '6px 0', color: 'var(--color-text-primary)' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 16px', background: 'var(--color-dark-800)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 className="heading-xl" style={{ marginBottom: 8 }}>
              Everything You <span className="gradient-text">Need</span>
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: 500, margin: '0 auto', fontSize: '0.9rem' }}>
              Built specifically for the DBU campus experience
            </p>
          </div>

          <div className="features-grid">
            {[
              { icon: Shield, title: 'DBU Verified', desc: 'Only @dbu.edu.et emails allowed. A safe, trusted community.', color: '#44CF6C' },
              { icon: MessageCircle, title: 'Real-time Chat', desc: 'Instant messaging with your tutor. No delays, no refreshing.', color: '#6C63FF' },
              { icon: Star, title: 'Ratings & Reviews', desc: 'Find the best tutors through honest peer reviews.', color: '#F59E0B' },
              { icon: Trophy, title: 'Leaderboard', desc: 'Top tutors earn badges and recognition on campus.', color: '#FF6B6B' },
              { icon: BookOpen, title: 'Session Tracking', desc: 'Keep track of all your past and upcoming sessions.', color: '#4ECDC4' },
              { icon: Users, title: 'Skill Exchange', desc: 'Teach what you know and learn what you need. Fair swap.', color: '#A855F7' },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}
                  style={{
                    padding: 'clamp(16px, 3vw, 24px)', borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = `${feature.color}30`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}
                >
                  <Icon size={22} style={{ color: feature.color, marginBottom: 10 }} />
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: 4 }}>
                    {feature.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending skills */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 16px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h2 className="heading-xl" style={{ marginBottom: 4 }}>
                Trending <span className="gradient-text">Skills</span>
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                Most popular skill listings right now
              </p>
            </div>
            <Link to="/browse" style={{
              display: 'flex', alignItems: 'center', gap: 4,
              color: 'var(--color-primary-light)', fontWeight: 600, fontSize: '0.88rem',
            }}>
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="trending-grid">
            {trendingSkills.slice(0, 3).map((listing, i) => (
              <motion.div key={listing.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                <Link to={`/skill/${listing.id}`} style={{ textDecoration: 'none' }}>
                  <div className="glass-card" style={{ padding: '20px 18px', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <Avatar name={listing.tutor?.name || 'Tutor'} size={36} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="text-truncate" style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>{listing.tutor?.name || 'Tutor'}</p>
                        <StarRating rating={listing.rating} size={11} />
                      </div>
                    </div>
                    <h3 className="text-truncate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text-primary)', marginBottom: 6 }}>
                      {listing.title}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {listing.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(listing.tags || []).slice(0, 3).map(tag => (
                        <Badge key={tag} size="xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: 'clamp(48px, 8vw, 80px) 16px', textAlign: 'center',
        background: 'linear-gradient(180deg, transparent 0%, rgba(108, 99, 255, 0.05) 50%, transparent 100%)',
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: 12 }}>
            Ready to <span className="gradient-text">Start Swapping?</span>
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', lineHeight: 1.7, marginBottom: 28 }}>
            Join the SkillSwap community and unlock your potential. It only takes 30 seconds.
          </p>
          <Link to="/signup" className="btn-primary" style={{ padding: '14px 36px', fontSize: '1rem' }}>
            Create Your Account <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
