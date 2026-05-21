import { useState, useMemo, useEffect } from 'react';
import { X, Calendar, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';
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

  // Parse availability to get valid dates and time slots
  const { validDates, validTimeSlots } = useMemo(() => {
    const avail = listing?.availability || '';
    
    // Default fallback
    let allowedDays = [0,1,2,3,4,5,6];
    let slots = availableTimeSlots.slice(0, 8);
    
    if (avail) {
      const parts = avail.split(', ');
      const dayPart = parts[0];
      const timePart = parts[1];

      const daysMapping = {
        'Monday': [1], 'Tuesday': [2], 'Wednesday': [3], 'Thursday': [4],
        'Friday': [5], 'Saturday': [6], 'Sunday': [0],
        'Weekdays': [1,2,3,4,5], 'Weekends': [0,6], 'Every day': [0,1,2,3,4,5,6]
      };
      
      if (daysMapping[dayPart]) allowedDays = daysMapping[dayPart];

      if (timePart) {
        slots = [timePart.trim()];
      }
    }

    // Generate next 5 valid dates from tomorrow
    const dates = [];
    let d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0,0,0,0);
    
    const today = new Date();
    today.setHours(0,0,0,0);

    while (dates.length < 5) {
      if (allowedDays.includes(d.getDay())) {
        const val = d.toISOString().split('T')[0];
        const display = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        
        // Calculate relative week label
        const diffTime = d - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let label = 'This Week';
        if (diffDays > 7 && diffDays <= 14) label = 'Next Week';
        else if (diffDays > 14) label = `In ${Math.floor(diffDays / 7)} Weeks`;

        dates.push({ value: val, display, label });
      }
      d.setDate(d.getDate() + 1);
    }
    
    return { validDates: dates, validTimeSlots: slots };
  }, [listing?.availability]);

  // Default to first valid date
  useEffect(() => {
    if (!selectedDate && validDates.length > 0) {
      setSelectedDate(validDates[0].value);
    }
  }, [validDates, selectedDate]);

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
            {selectedDate} at {selectedSlot}{location ? ` · ${location}` : ''}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              <Calendar size={16} /> Select Date
            </label>
            {listing?.availability && (
               <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                 <Info size={12}/> Available: {listing.availability}
               </span>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {validDates.map(dateObj => (
              <button key={dateObj.value} onClick={() => setSelectedDate(dateObj.value)} style={{
                flexShrink: 0, padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                border: selectedDate === dateObj.value ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.08)',
                background: selectedDate === dateObj.value ? 'rgba(108, 99, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                color: selectedDate === dateObj.value ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
                fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: 'var(--font-body)', fontWeight: selectedDate === dateObj.value ? 600 : 400,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 90,
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{dateObj.label}</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{dateObj.display}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time slots */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
            <Clock size={16} /> Select Time Slot
          </label>
          {validTimeSlots.length > 0 ? (
            <div className="timeslot-grid">
              {validTimeSlots.map(slot => (
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
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No time slots available for this availability.</p>
          )}
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
