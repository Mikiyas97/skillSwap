import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 500 }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontWeight: 900,
          fontSize: 'clamp(5rem, 15vw, 8rem)', lineHeight: 1,
        }}>
          <span className="gradient-text">404</span>
        </h1>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.5rem', marginBottom: 12, color: 'var(--color-text-primary)' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: 32 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/" className="btn-primary"><Home size={16} /> Home</Link>
          <Link to="/browse" className="btn-secondary"><ArrowLeft size={16} /> Browse Skills</Link>
        </div>
      </div>
    </div>
  );
}
