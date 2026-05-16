import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, X, CheckCircle, AlertCircle, BookOpen, Search } from 'lucide-react';
import { validateSkillForm } from '../utils/validators';
import { createSkillListing, fetchCategories } from '../services/api';
import { skillCategories } from '../services/mockData';
import { useAPI } from '../hooks/useAPI';

export default function OfferSkill() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'wanted' ? 'wanted' : 'offer';

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [postType, setPostType] = useState(initialType);
  const [form, setForm] = useState({ title: '', description: '', tags: [], level: '', availability: '', category: '' });

  const { data: categories } = useAPI(
    () => fetchCategories(),
    () => skillCategories.map((name, i) => ({ id: i + 1, name, slug: name.toLowerCase() })),
  );

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const addTag = () => { if (tagInput.trim() && !form.tags.includes(tagInput.trim())) { update('tags', [...form.tags, tagInput.trim()]); setTagInput(''); } };
  const removeTag = (tag) => update('tags', form.tags.filter(t => t !== tag));

  const isWanted = postType === 'wanted';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateSkillForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setApiError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        tags: form.tags,
        level: form.level,
        availability: form.availability,
        post_type: postType,
      };
      // Find category ID from name
      const cat = (categories || []).find(c => c.name === form.category);
      if (cat) payload.category = cat.id;

      await createSkillListing(payload);
      setSubmitted(true);
    } catch (err) {
      console.error('Create listing failed:', err.message);
      setApiError(err.message || 'Failed to create listing. Please try again.');
    }
    setLoading(false);
  };

  if (submitted) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(68,207,108,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><CheckCircle size={32} style={{ color: '#44CF6C' }} /></div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', marginBottom: 8 }}>
          {isWanted ? 'Request Posted!' : 'Skill Listed!'}
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
          {isWanted
            ? `Your request "${form.title}" is now visible. AI will find tutors and study partners for you!`
            : `Your skill "${form.title}" is now visible to other students.`}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/browse')} className="btn-secondary">View on Browse</button>
          {isWanted && <button onClick={() => navigate('/ai-matches')} className="btn-primary">Find AI Matches</button>}
          {!isWanted && <button onClick={() => navigate('/browse')} className="btn-primary">View on Browse</button>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-padding" style={{ minHeight: '100vh' }}>
      <div className="form-container">
        <h1 className="heading-xl" style={{ marginBottom: 6 }}>
          {isWanted ? <>Find a <span className="gradient-text">Tutor</span></> : <>Offer a <span className="gradient-text">Skill</span></>}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
          {isWanted ? 'Tell us what you want to learn — AI will match you with tutors and study partners' : 'Share what you know and help your peers grow'}
        </p>

        {/* Post Type Toggle */}
        <div style={{
          display: 'flex', gap: 0, marginBottom: 28,
          background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)',
          padding: 4, border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button
            type="button"
            onClick={() => setPostType('offer')}
            style={{
              flex: 1, padding: '12px 16px',
              borderRadius: 'var(--radius-xs, 6px)',
              border: 'none', cursor: 'pointer',
              background: !isWanted ? 'var(--color-primary)' : 'transparent',
              color: !isWanted ? '#fff' : 'var(--color-text-muted)',
              fontWeight: 600, fontSize: '0.85rem', minHeight: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.2s ease',
            }}
          >
            <BookOpen size={15} /> I Can Teach
          </button>
          <button
            type="button"
            onClick={() => setPostType('wanted')}
            style={{
              flex: 1, padding: '12px 16px',
              borderRadius: 'var(--radius-xs, 6px)',
              border: 'none', cursor: 'pointer',
              background: isWanted ? 'var(--color-primary)' : 'transparent',
              color: isWanted ? '#fff' : 'var(--color-text-muted)',
              fontWeight: 600, fontSize: '0.85rem', minHeight: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.2s ease',
            }}
          >
            <Search size={15} /> I Want to Learn
          </button>
        </div>

        {apiError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', marginBottom: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', color: '#EF4444', fontSize: '0.85rem' }}>
            <AlertCircle size={16} /> {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: 'clamp(18px, 4vw, 32px)' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Title *</label>
            <input className="input-field" placeholder={isWanted ? 'e.g. Need Help with Calculus II' : 'e.g. Python for Beginners'} value={form.title} onChange={e => update('title', e.target.value)} />
            {errors.title && <p style={{ fontSize: '0.78rem', color: '#EF4444', marginTop: 4 }}>{errors.title}</p>}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Description *</label>
            <textarea className="input-field" rows={4} placeholder={isWanted ? 'Describe what you want to learn and your current level...' : "Describe what you'll teach..."} value={form.description} onChange={e => update('description', e.target.value)} style={{ resize: 'vertical' }} />
            {errors.description && <p style={{ fontSize: '0.78rem', color: '#EF4444', marginTop: 4 }}>{errors.description}</p>}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Tags *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input-field" placeholder="Add a tag and press Enter" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
              <button type="button" onClick={addTag} className="btn-secondary" style={{ padding: '8px 16px', flexShrink: 0 }}><Plus size={16} /></button>
            </div>
            {form.tags.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>{form.tags.map(tag => (<span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'rgba(108,99,255,0.15)', color: '#8B83FF', fontSize: '0.8rem', fontWeight: 600 }}>{tag}<button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B83FF', padding: 0, display: 'flex' }}><X size={12} /></button></span>))}</div>}
            {errors.tags && <p style={{ fontSize: '0.78rem', color: '#EF4444', marginTop: 4 }}>{errors.tags}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Level *</label>
              <select className="input-field" value={form.level} onChange={e => update('level', e.target.value)}>
                <option value="">Select</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              {errors.level && <p style={{ fontSize: '0.78rem', color: '#EF4444', marginTop: 4 }}>{errors.level}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Category</label>
              <select className="input-field" value={form.category} onChange={e => update('category', e.target.value)}>
                <option value="">Select</option>
                {(categories || []).map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Availability *</label>
            <input className="input-field" placeholder="e.g. Weekends 2-5pm" value={form.availability} onChange={e => update('availability', e.target.value)} />
            {errors.availability && <p style={{ fontSize: '0.78rem', color: '#EF4444', marginTop: 4 }}>{errors.availability}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Publishing...' : <>{isWanted ? <><Search size={18} /> Post Request</> : <><Plus size={18} /> Publish Skill</>}</>}
          </button>
        </form>
      </div>
    </div>
  );
}
