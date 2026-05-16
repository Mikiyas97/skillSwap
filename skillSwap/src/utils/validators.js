/**
 * Email and form validation utilities
 */

export function isValidDBUEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@dbu\.edu\.et$/.test(email);
}

export function isValidPassword(password) {
  // Minimum 8 characters, at least one uppercase, one lowercase, one number, one special char
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);
}

export function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  
  if (score <= 2) return { level: 'weak', color: '#EF4444', width: '33%' };
  if (score <= 4) return { level: 'medium', color: '#F59E0B', width: '66%' };
  return { level: 'strong', color: '#44CF6C', width: '100%' };
}

export function validateSkillForm(form) {
  const errors = {};
  if (!form.title?.trim()) errors.title = 'Title is required';
  if (!form.description?.trim()) errors.description = 'Description is required';
  if (form.description?.trim().length < 20) errors.description = 'Description must be at least 20 characters';
  if (!form.tags?.length) errors.tags = 'Add at least one tag';
  if (!form.level) errors.level = 'Select a difficulty level';
  if (!form.availability?.trim()) errors.availability = 'Availability is required';
  return errors;
}

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

export function timeAgo(dateString) {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];
  for (const { label, seconds: s } of intervals) {
    const count = Math.floor(seconds / s);
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}
