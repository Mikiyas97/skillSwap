import { getInitials } from '../../utils/validators';

const gradients = [
  'linear-gradient(135deg, #6C63FF, #4ECDC4)',
  'linear-gradient(135deg, #FF6B6B, #FFE66D)',
  'linear-gradient(135deg, #4ECDC4, #44CF6C)',
  'linear-gradient(135deg, #A855F7, #EC4899)',
  'linear-gradient(135deg, #F59E0B, #EF4444)',
];

export default function Avatar({ name, src, size = 40, style: customStyle }) {
  if (src) {
    return (
      <img src={src} alt={name} style={{
        width: size, height: size, borderRadius: '50%', objectFit: 'cover',
        border: '2px solid rgba(255,255,255,0.1)',
        ...customStyle,
      }} />
    );
  }

  const hash = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const gradient = gradients[hash % gradients.length];

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700,
      fontSize: size * 0.35,
      flexShrink: 0,
      ...customStyle,
    }}>
      {getInitials(name)}
    </div>
  );
}
