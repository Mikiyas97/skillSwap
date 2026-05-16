export default function Badge({ children, variant = 'default', size = 'sm' }) {
  const styles = {
    default: { background: 'rgba(108, 99, 255, 0.15)', color: '#8B83FF', border: '1px solid rgba(108, 99, 255, 0.2)' },
    success: { background: 'rgba(68, 207, 108, 0.15)', color: '#44CF6C', border: '1px solid rgba(68, 207, 108, 0.2)' },
    warning: { background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.2)' },
    danger: { background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)' },
    accent: { background: 'rgba(78, 205, 196, 0.15)', color: '#4ECDC4', border: '1px solid rgba(78, 205, 196, 0.2)' },
    gold: { background: 'rgba(245, 158, 11, 0.15)', color: '#FFD700', border: '1px solid rgba(245, 158, 11, 0.25)' },
  };

  const sizes = {
    xs: { padding: '2px 8px', fontSize: '0.7rem' },
    sm: { padding: '4px 10px', fontSize: '0.75rem' },
    md: { padding: '6px 14px', fontSize: '0.85rem' },
  };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      borderRadius: 20, fontWeight: 600,
      whiteSpace: 'nowrap',
      ...styles[variant],
      ...sizes[size],
    }}>
      {children}
    </span>
  );
}
