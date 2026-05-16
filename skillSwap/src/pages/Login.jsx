import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidDBUEmail } from '../utils/validators';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    if (!isValidDBUEmail(email)) { setError('Only @dbu.edu.et emails are allowed'); return; }
    setLoading(true);
    const { error: err } = await login(email, password);
    setLoading(false);
    if (err) { setError(err.message || 'Invalid email or password'); } else { navigate('/dashboard'); }
  };

  return (
    <div className="hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--color-dark-700)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.08)', padding: 'clamp(24px, 5vw, 40px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.3rem', color: '#fff' }}>S</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 6 }}>Welcome Back</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Sign in to your SkillSwap account</p>
        </div>
        {error && (<div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', marginBottom: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', color: '#EF4444', fontSize: '0.85rem' }}><AlertCircle size={16} /> {error}</div>)}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Email</label>
            <input type="email" className="input-field" placeholder="yourname@dbu.edu.et" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPwd ? 'text' : 'password'} className="input-field" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>{showPwd ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px 0', opacity: loading ? 0.7 : 1 }}>{loading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Don't have an account? <Link to="/signup" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>Sign Up</Link></p>
      </div>
    </div>
  );
}
