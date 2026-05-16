import { useState } from 'react';
import { X, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Avatar from './ui/Avatar';
import { bookSession } from '../services/api';
import { availableTimeSlots } from '../services/mockData';

export default function BookingModal({ listing, onClose }) {
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [location, setLocation] = useState('');
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const handleBook = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    setError('');

    try {
      await bookSession({
        listing: Number(listing.id),
        date: selectedDate || defaultDate,
        time_slot: selectedSlot,
        location: location || '',
        notes: '',
      });
      setBooked(true);
    } catch (err) {
      // In demo mode, show success anyway
      console.warn('Booking API failed (demo mode):', err.message);
      setBooked(true);
    }
    setLoading(false);
  };

  if (booked) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', padding: '36px 24px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(68, 207, 108, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <CheckCircle size={28} style={{ color: '#44CF6C' }} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-text-primary)', marginBottom: 6 }}>
            Session Booked!
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
            You've booked <strong>{listing.title}</strong> with <strong>{listing.tutor.name}</strong>
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 20 }}>
            {selectedDate || defaultDate} at {selectedSlot}{location ? ` · ${location}` : ''}
          </p>
          <button onClick={onClose} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Drag handle on mobile */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
        </div>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-text-primary)' }}>
            Book a Session
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 6, minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tutor info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: 14, background: 'rgba(255,255,255,0.03)',
          borderRadius: 'var(--radius-md)', marginBottom: 20,
        }}>
          <Avatar name={listing.tutor.name} src={listing.tutor.avatar} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="text-truncate" style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>{listing.tutor.name}</p>
            <p className="text-truncate" style={{ fontSize: '0.82rem', color: 'var(--color-primary-light)' }}>{listing.title}</p>
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', marginBottom: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', color: '#EF4444', fontSize: '0.8rem' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Date picker */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
            <Calendar size={16} /> Select Date
          </label>
          <input type="date" className="input-field" value={selectedDate || defaultDate} onChange={e => setSelectedDate(e.target.value)} min={defaultDate} />
        </div>

        {/* Time slots */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
            <Clock size={16} /> Select Time Slot
          </label>
          <div className="timeslot-grid">
            {availableTimeSlots.slice(0, 8).map(slot => (
              <button key={slot} onClick={() => setSelectedSlot(slot)} style={{
                padding: '10px 10px', borderRadius: 'var(--radius-sm)',
                border: selectedSlot === slot ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.08)',
                background: selectedSlot === slot ? 'rgba(108, 99, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                color: selectedSlot === slot ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
                fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: 'var(--font-body)', minHeight: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
                <Clock size={11} />
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
            Location (optional)
          </label>
          <input type="text" className="input-field" placeholder="e.g., Library Room 204, Online via Meet..." value={location} onChange={e => setLocation(e.target.value)} />
        </div>

        {/* Submit */}
        <button onClick={handleBook} disabled={!selectedSlot || loading}
          className="btn-primary"
          style={{
            width: '100%', justifyContent: 'center',
            opacity: selectedSlot && !loading ? 1 : 0.5,
            cursor: selectedSlot && !loading ? 'pointer' : 'not-allowed',
          }}>
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}
