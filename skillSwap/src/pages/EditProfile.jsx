import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Save, ArrowLeft } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import { updateUserProfile, fetchProfile } from '../services/api';
import { colleges, departmentsByCollege, years } from '../services/mockData';

import { supabase } from '../lib/supabaseClient';

export default function EditProfile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    college: '',
    department: '',
    year: '',
    bio: '',
    skills_teaching: '',
    avatar: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const p = await fetchProfile();
        setForm({
          name: p.name || '',
          college: p.college || '',
          department: p.department || '',
          year: p.year || '',
          bio: p.bio || '',
          skills_teaching: (p.skills_teaching || []).join(', '),
          avatar: p.avatar || '',
        });
      } catch {
        const meta = user?.user_metadata || {};
        setForm({
          name: meta.name || '',
          college: meta.college || '',
          department: meta.department || '',
          year: meta.year || '',
          bio: meta.bio || '',
          skills_teaching: (meta.skills_teaching || []).join(', '),
          avatar: meta.avatar || '',
        });
      }
    }
    load();
  }, [user]);

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

  const availableDepartments = form.college ? (departmentsByCollege[form.college] || []) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let avatarUrl = form.avatar;
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('avatars').upload(fileName, avatarFile);
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatarUrl = publicUrl;
      }
    }

    const updates = {
      name: form.name,
      college: form.college,
      department: form.department,
      year: form.year,
      bio: form.bio,
      avatar: avatarUrl,
      skills_teaching: form.skills_teaching.split(',').map(s => s.trim()).filter(Boolean),
    };

    try {
      await updateUserProfile(updates);
    } catch {
      await updateProfile(updates);
    }

    setSaved(true);
    setLoading(false);
    setTimeout(() => navigate('/profile'), 1500);
  };

  return (
    <div className="page-padding" style={{ minHeight: '100vh' }}>
      <div className="form-container">
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: 20, fontFamily: 'var(--font-body)', fontSize: '0.88rem', minHeight: 44, padding: '8px 0' }}>
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="heading-xl" style={{ marginBottom: 24 }}>Edit <span className="gradient-text">Profile</span></h1>

        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: 'clamp(18px, 4vw, 32px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Avatar name={form.name || 'User'} src={avatarPreview || form.avatar} size={72} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>{user?.email}</p>
            <div>
              <label style={{ fontSize: '0.8rem', cursor: 'pointer', color: 'var(--color-primary-light)', fontWeight: 600 }}>
                Change Picture
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Full Name</label>
            <input type="text" className="input-field" placeholder="Your full name" value={form.name} onChange={e => update('name', e.target.value)} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Bio</label>
            <textarea className="input-field" rows={3} placeholder="Tell others about yourself..." value={form.bio} onChange={e => update('bio', e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>College</label>
            <select className="input-field" value={form.college} onChange={e => update('college', e.target.value)}>
              <option value="">Select college</option>
              {colleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Department</label>
              <select className="input-field" value={form.department} onChange={e => update('department', e.target.value)} disabled={!form.college} style={{ opacity: form.college ? 1 : 0.5 }}>
                <option value="">{form.college ? 'Select' : 'Pick college first'}</option>
                {availableDepartments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Year</label>
              <select className="input-field" value={form.year} onChange={e => update('year', e.target.value)}>
                <option value="">Select</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Skills (comma separated)</label>
            <input className="input-field" placeholder="e.g. Python, React, Data Structures" value={form.skills_teaching} onChange={e => update('skills_teaching', e.target.value)} />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
            {saved ? 'Saved!' : loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}
