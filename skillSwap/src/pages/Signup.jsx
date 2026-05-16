import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidDBUEmail, getPasswordStrength } from '../utils/validators';
import { Eye, EyeOff, UserPlus, AlertCircle, ChevronRight, ChevronLeft, Camera } from 'lucide-react';
import { colleges, departmentsByCollege, years } from '../services/mockData';
import { onboardUser } from '../services/api';
import Avatar from '../components/ui/Avatar';
import { supabase } from '../lib/supabaseClient';

export default function Signup({ initialStep = 1 }) {
  const { sendSignupOtp, verifySignupOtp, updateProfile, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(initialStep);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', name: '', college: '', department: '', year: '', bio: '' });

  const update = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'college') next.department = '';
      return next;
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const pwdStrength = getPasswordStrength(form.password);
  const availableDepartments = form.college ? (departmentsByCollege[form.college] || []) : [];

  const handleStep1 = async () => {
    setError('');
    if (!form.email || !form.password || !form.confirmPassword) { setError('Fill in all fields'); return; }
    if (!isValidDBUEmail(form.email)) { setError('Only @dbu.edu.et emails are allowed. Try yourname@dbu.edu.et'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    
    setLoading(true);
    
    const { error: err } = await sendSignupOtp(form.email, form.password);
    setLoading(false);
    
    if (err) {
      // If user already registered but didn't verify, Supabase might throw an error or just resend.
      // We will show the error to the user.
      setError(err.message);
    } else {
      setIsOtpSent(true); // Move to OTP verification step
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!otpToken || otpToken.length !== 6) { setError('Please enter the 6-digit code'); return; }
    
    setLoading(true);
    const { error: err } = await verifySignupOtp(form.email, otpToken);
    setLoading(false);
    
    if (err) {
      setError(err.message);
    } else {
      setStep(2); // Move to profile creation
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.college || !form.department || !form.year) { setError('Complete all profile fields'); return; }
    setLoading(true);
    
    let avatarUrl = '';
    // Bypass Supabase Storage for now
    /*
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const userId = Date.now().toString();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('avatars').upload(fileName, avatarFile);
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatarUrl = publicUrl;
      }
    }
    */

    const { error: err } = await updateProfile({
      name: form.name,
      college: form.college,
      department: form.department,
      year: form.year,
      bio: form.bio,
      avatar: avatarUrl,
    });
    
    setLoading(false);

    if (err) { 
      setError(err.message || 'Failed to complete profile.'); 
    } else {
      navigate('/dashboard');
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 };

  return (
    <div className="hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 440, background: 'var(--color-dark-700)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.08)', padding: 'clamp(24px, 5vw, 40px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.3rem', color: '#fff' }}>S</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 6 }}>Create Account</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Step {step} of 2 — {step === 1 ? (isOtpSent ? 'Verify Email' : 'Account Details') : 'Your Profile'}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
            {[1, 2].map(s => (<div key={s} style={{ width: 60, height: 4, borderRadius: 2, background: s <= step ? 'var(--color-primary)' : 'var(--color-dark-500)', transition: 'all 0.3s' }} />))}
          </div>
        </div>

        {error && (<div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', marginBottom: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', color: '#EF4444', fontSize: '0.85rem' }}><AlertCircle size={16} /> {error}</div>)}

        {step === 1 ? (
          <div>
            {!isOtpSent ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Email</label>
                  <input type="email" className="input-field" placeholder="yourname@dbu.edu.et" value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPwd ? 'text' : 'password'} className="input-field" placeholder="Min 8 characters" value={form.password} onChange={e => update('password', e.target.value)} style={{ paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>{showPwd ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                  {form.password && (<div style={{ marginTop: 8 }}><div style={{ height: 3, borderRadius: 2, background: 'var(--color-dark-500)', overflow: 'hidden' }}><div style={{ width: pwdStrength.width, height: '100%', background: pwdStrength.color, transition: 'all 0.3s' }} /></div><p style={{ fontSize: '0.75rem', color: pwdStrength.color, marginTop: 4 }}>Password strength: {pwdStrength.level}</p></div>)}
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Confirm Password</label>
                  <input type="password" className="input-field" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
                </div>
                <button onClick={handleStep1} disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>{loading ? 'Sending OTP...' : <><UserPlus size={18} /> Continue <ChevronRight size={18} /></>}</button>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 24 }}>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 16, textAlign: 'center' }}>
                    We've sent a 6-digit verification code to <strong>{form.email}</strong>. Please enter it below.
                  </p>
                  <label style={labelStyle}>Verification Code (OTP)</label>
                  <input type="text" className="input-field" placeholder="e.g. 123456" value={otpToken} onChange={e => setOtpToken(e.target.value)} style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }} />
                </div>
                <button onClick={handleVerifyOtp} disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button type="button" onClick={() => setIsOtpSent(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>Change Email</button>
                </div>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar name={form.name || 'Student'} src={avatarPreview} size={72} style={{ margin: '0 auto 12px' }} />
              <div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', cursor: 'pointer', color: 'var(--color-primary-light)', fontWeight: 600 }}>
                  <Camera size={14} /> Upload Picture
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Full Name</label>
              <input type="text" className="input-field" placeholder="e.g. Abebe Geleta" value={form.name} onChange={e => update('name', e.target.value)} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Short Bio</label>
              <input type="text" className="input-field" placeholder="e.g. Passionate about coding" value={form.bio} onChange={e => update('bio', e.target.value)} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>College</label>
              <select className="input-field" value={form.college} onChange={e => update('college', e.target.value)}>
                <option value="">Select college</option>
                {colleges.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Department</label>
              <select
                className="input-field"
                value={form.department}
                onChange={e => update('department', e.target.value)}
                disabled={!form.college}
                style={{ opacity: form.college ? 1 : 0.5 }}
              >
                <option value="">{form.college ? 'Select department' : 'Select a college first'}</option>
                {availableDepartments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Year</label>
              <select className="input-field" value={form.year} onChange={e => update('year', e.target.value)}>
                <option value="">Select year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              {initialStep === 2 ? (
                <button type="button" onClick={handleSignOut} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', borderColor: 'rgba(239,68,68,0.3)', color: '#EF4444' }}>Sign Out</button>
              ) : (
                <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}><ChevronLeft size={18} /> Back</button>
              )}
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>{loading ? 'Saving...' : <><UserPlus size={18} /> Complete Profile</>}</button>
            </div>
          </form>
        )}
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Already have an account? <Link to="/login" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>Sign In</Link></p>
      </div>
    </div>
  );
}
