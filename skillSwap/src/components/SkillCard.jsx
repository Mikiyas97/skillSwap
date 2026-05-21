import { Link } from 'react-router-dom';
import { Clock, ArrowRight, BookOpen, Search, Calendar } from 'lucide-react';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import StarRating from './ui/StarRating';

export default function SkillCard({ listing, onClick }) {
  const tutor = listing.tutor;

  const inner = (
    <div className="glass-card" style={{
      padding: 'clamp(16px, 3vw, 24px)', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: 12,
      height: '100%',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <Link to={`/user/${tutor.id}`} onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1, textDecoration: 'none', color: 'inherit' }}>
          <Avatar name={tutor.name} src={tutor.avatar} size={40} />
          <div style={{ minWidth: 0 }}>
            <p className="text-truncate" style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>{tutor.name}</p>
            <p className="text-truncate" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{tutor.department}</p>
          </div>
        </Link>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          {listing.post_type === 'wanted' ? (
            <Badge variant="warning" size="xs" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Search size={10} /> Wanted
            </Badge>
          ) : (
            <Badge variant="primary" size="xs" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <BookOpen size={10} /> Offering
            </Badge>
          )}
          <Badge variant={listing.level === 'Beginner' ? 'success' : listing.level === 'Intermediate' ? 'warning' : 'danger'} size="xs">
            {listing.level}
          </Badge>
        </div>
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
        display: 'flex', flexDirection: 'column', gap: 8,
        paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <StarRating rating={listing.rating} size={14} />
          {listing.created_at && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              <Calendar size={12} /> {new Date(listing.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
          <Clock size={12} /> {listing.availability}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-light)',
      }}>
        {onClick ? 'View Details' : 'View Details'} <ArrowRight size={14} />
      </div>
    </div>
  );

  if (onClick) {
    return (
      <div onClick={onClick} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        {inner}
      </div>
    );
  }

  return (
    <Link to={`/skill/${listing.id}`} style={{ textDecoration: 'none' }}>
      {inner}
    </Link>
  );
}

