import { Link } from 'react-router-dom';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import StarRating from './ui/StarRating';

export default function SkillCard({ listing }) {
  const tutor = listing.tutor;

  return (
    <Link to={`/skill/${listing.id}`} style={{ textDecoration: 'none' }}>
      <div className="glass-card" style={{
        padding: 'clamp(16px, 3vw, 24px)', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 12,
        height: '100%',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            <Avatar name={tutor.name} src={tutor.avatar} size={40} />
            <div style={{ minWidth: 0 }}>
              <p className="text-truncate" style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>{tutor.name}</p>
              <p className="text-truncate" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{tutor.department}</p>
            </div>
          </div>
          <Badge variant={listing.level === 'Beginner' ? 'success' : listing.level === 'Intermediate' ? 'warning' : 'danger'} size="xs">
            {listing.level}
          </Badge>
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.15rem',
          color: 'var(--color-text-primary)', lineHeight: 1.3,
        }}>{listing.title}</h3>

        {/* Description */}
        <p style={{
          fontSize: '0.85rem', color: 'var(--color-text-secondary)',
          lineHeight: 1.6, flex: 1,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{listing.description}</p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {listing.tags.slice(0, 3).map(tag => (
            <Badge key={tag} size="xs">{tag}</Badge>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <StarRating rating={listing.rating} size={14} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            <Clock size={12} /> {listing.availability}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-light)',
        }}>
          View Details <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}
