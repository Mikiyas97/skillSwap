import { Link } from 'react-router-dom';
import { Heart, ExternalLink, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      background: 'var(--color-dark-800)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '48px 24px 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 32,
          marginBottom: 32,
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', color: '#fff',
              }}>S</div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
                Skill<span style={{ color: 'var(--color-primary)' }}>Swap</span>
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: 280 }}>
              Connecting DBU students to exchange skills, learn from each other, and grow together.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: 12 }}>
              Quick Links
            </h4>
            {[
              { to: '/browse', label: 'Browse Skills' },
              { to: '/leaderboard', label: 'Leaderboard' },
              { to: '/offer', label: 'Offer a Skill' },
            ].map(link => (
              <Link key={link.to} to={link.to} style={{
                display: 'block', padding: '6px 0', fontSize: '0.85rem',
                color: 'var(--color-text-secondary)', transition: 'color 0.2s',
              }}
                onMouseEnter={e => { e.target.style.color = 'var(--color-primary-light)'; }}
                onMouseLeave={e => { e.target.style.color = 'var(--color-text-secondary)'; }}
              >{link.label}</Link>
            ))}
          </div>

          {/* Connect */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: 12 }}>
              Connect
            </h4>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { icon: Mail, href: 'mailto:contact@dbu.edu.et' },
                { icon: ExternalLink, href: '#' },
              ].map((social, i) => {
                const Icon = social.icon;
                return (
                  <a key={i} href={social.href} target="_blank" rel="noopener noreferrer"
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-text-secondary)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108, 99, 255, 0.15)'; e.currentTarget.style.color = 'var(--color-primary-light)'; e.currentTarget.style.borderColor = 'rgba(108, 99, 255, 0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexWrap: 'wrap', gap: 4,
          fontSize: '0.8rem', color: 'var(--color-text-muted)',
        }}>
          <span>Made with</span>
          <Heart size={14} style={{ color: 'var(--color-secondary)' }} />
          <span>by DBU Software Engineering Students · © {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
