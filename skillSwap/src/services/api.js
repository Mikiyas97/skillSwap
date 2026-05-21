import { supabase } from '../lib/supabaseClient';

/**
 * SkillSwap API Client
 * Centralized API service that calls the Django backend.
 * Falls back to mock data when the backend is unavailable.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ─── Helpers ──────────────────────────────────────────────

async function getAuthHeaders() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch (err) {
    console.error('[API] Error getting Supabase session:', err);
  }
  
  return {};
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const authHeaders = await getAuthHeaders();
  
  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...options.headers,
  };

  // Debugging logs
  console.log(`[API] ${options.method || 'GET'} ${path}`);
  if (authHeaders.Authorization) {
    console.log(`[API] Attached Bearer token to request`);
  } else {
    console.warn(`[API] No Bearer token found for request to ${path}`);
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error(`[API] Error ${res.status} on ${path}:`, errorData);
    throw new Error(errorData.detail || errorData.error || `API error ${res.status}`);
  }

  return res.json();
}

// ─── Data adapters ─────────────────────────────────────────
// Transform Django API responses to match frontend component props

function adaptUser(apiUser) {
  if (!apiUser) return null;
  return {
    id: String(apiUser.id),
    name: apiUser.name || `${apiUser.first_name || ''} ${apiUser.last_name || ''}`.trim(),
    email: apiUser.email,
    college: apiUser.college || '',
    department: apiUser.department || '',
    year: apiUser.year || '',
    bio: apiUser.bio || '',
    avatar: apiUser.avatar || '',
    skills_teaching: apiUser.skills_teaching || [],
    skills_learning: apiUser.skills_learning || [],
    rating: apiUser.rating || 0,
    total_reviews: apiUser.total_reviews || 0,
    sessions_completed: apiUser.sessions_completed || 0,
    badges: apiUser.badges || [],
    online: apiUser.online || false,
    joined: apiUser.date_joined || '',
  };
}

function adaptListing(apiListing) {
  if (!apiListing) return null;
  const tutor = adaptUser(apiListing.tutor);
  return {
    id: String(apiListing.id),
    tutorId: tutor?.id,
    tutor,
    title: apiListing.title,
    description: apiListing.description,
    post_type: apiListing.post_type || 'offer',
    category: apiListing.category_name || '',
    tags: apiListing.tags || [],
    level: apiListing.level || 'Beginner',
    availability: apiListing.availability || '',
    rating: tutor?.rating || 0,
    totalReviews: tutor?.total_reviews || 0,
    sessionsCompleted: tutor?.sessions_completed || 0,
    is_active: apiListing.is_active,
    created_at: apiListing.created_at,
  };
}

function adaptSession(apiSession) {
  if (!apiSession) return null;
  return {
    id: String(apiSession.id),
    skill: apiSession.skill_title,
    tutor: adaptUser(apiSession.tutor),
    student: adaptUser(apiSession.student),
    date: apiSession.date,
    time: apiSession.time_slot,
    location: apiSession.location || '',
    status: apiSession.status,
    notes: apiSession.notes || '',
    review: apiSession.review ? {
      id: String(apiSession.review.id),
      rating: apiSession.review.rating,
      comment: apiSession.review.comment,
      student: adaptUser(apiSession.review.student),
    } : null,
    listingId: apiSession.listing,
  };
}

function adaptReview(apiReview) {
  if (!apiReview) return null;
  return {
    id: String(apiReview.id),
    rating: apiReview.rating,
    comment: apiReview.comment,
    date: new Date(apiReview.created_at).toLocaleDateString(),
    student: adaptUser(apiReview.student),
  };
}

function adaptMessage(apiMsg) {
  if (!apiMsg) return null;
  return {
    id: String(apiMsg.id),
    senderId: String(apiMsg.sender?.id || apiMsg.sender),
    receiverId: String(apiMsg.receiver?.id || apiMsg.receiver),
    text: apiMsg.text,
    timestamp: apiMsg.timestamp,
    read: apiMsg.is_read,
    senderName: apiMsg.sender?.name || '',
  };
}

// ─── Skills API ────────────────────────────────────────────

export async function fetchSkillListings(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.level) query.set('level', params.level);
  if (params.category) query.set('category', params.category);
  const qs = query.toString();
  const data = await request(`/skills/listings/${qs ? '?' + qs : ''}`);
  return (data.results || data).map(adaptListing);
}

export async function fetchSkillDetail(id) {
  const data = await request(`/skills/listings/${id}/`);
  return adaptListing(data);
}

export async function createSkillListing(payload) {
  return request('/skills/listings/create/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function askAssistant(payload) {
  return request('/assistant/ask/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchMyListings() {
  const data = await request('/skills/my-listings/');
  return (data.results || data).map(adaptListing);
}

export async function fetchUserListings(userId) {
  const data = await request(`/skills/listings/?tutor=${userId}`);
  return (data.results || data).map(adaptListing);
}

export async function fetchCategories() {
  const data = await request('/skills/categories/');
  return (data.results || data);
}

// ─── Sessions API ──────────────────────────────────────────

export async function fetchSessions(status = '') {
  const qs = status ? `?status=${status}` : '';
  const data = await request(`/sessions/${qs}`);
  return (data.results || data).map(adaptSession);
}

export async function bookSession(payload) {
  // payload: { listing, date, time_slot, location, notes }
  return request('/sessions/book/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function completeSession(sessionId) {
  const data = await request(`/sessions/${sessionId}/complete/`, { method: 'POST' });
  return adaptSession(data);
}

export async function cancelSession(sessionId) {
  const data = await request(`/sessions/${sessionId}/cancel/`, { method: 'POST' });
  return adaptSession(data);
}

export async function submitReview(sessionId, payload) {
  // payload: { rating, comment }
  return request(`/sessions/${sessionId}/review/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchTutorReviews(tutorId) {
  const data = await request(`/sessions/reviews/tutor/${tutorId}/`);
  return (data.results || data).map(adaptReview);
}

export async function fetchListingReviews(listingId) {
  const data = await request(`/sessions/reviews/listing/${listingId}/`);
  return (data.results || data).map(adaptReview);
}

// ─── Users API ─────────────────────────────────────────────

export async function fetchProfile() {
  const data = await request('/users/profile/');
  return adaptUser(data);
}

export async function updateUserProfile(payload) {
  return request('/users/profile/', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function onboardUser(payload) {
  return request('/users/profile/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchUserById(id) {
  const data = await request(`/users/${id}/`);
  return adaptUser(data);
}

export async function fetchLeaderboard() {
  const data = await request('/users/leaderboard/');
  const results = data.results || data;
  return results.map((entry, i) => ({
    ...adaptUser(entry),
    score: entry.score || 0,
    rank: i + 1,
  }));
}

// ─── Chat API ──────────────────────────────────────────────

export async function fetchConversations() {
  const data = await request('/chat/conversations/');
  return data.results || data;
}

export async function fetchMessages(userId) {
  const data = await request(`/chat/messages/${userId}/`);
  return (data.results || data).map(adaptMessage);
}

export async function sendMessageAPI(receiverId, text) {
  return request('/chat/messages/send/', {
    method: 'POST',
    body: JSON.stringify({ receiver: receiverId, text }),
  });
}

export async function markMessagesRead(userId) {
  return request(`/chat/messages/${userId}/read/`, { method: 'POST' });
}

// ─── AI Matching API ───────────────────────────────────────

export async function fetchAiMatches(postId) {
  const data = await request(`/skills/posts/${postId}/ai-matches/`);
  return (data || []).map(match => ({
    listing: adaptListing(match.listing),
    score: match.score,
    reason: match.reason,
  }));
}

export async function fetchStudyPartners(postId) {
  const data = await request(`/skills/posts/${postId}/study-partners/`);
  return (data || []).map(partner => ({
    listing: adaptListing(partner.listing),
    score: partner.score,
    reason: partner.reason,
  }));
}

export async function fetchSkillSuggestions() {
  return request('/skills/profile/me/skill-suggestions/');
}

// ─── Health ────────────────────────────────────────────────

export async function checkHealth() {
  return request('/health/');
}
