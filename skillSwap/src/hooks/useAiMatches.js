/**
 * useAiMatches — Fetch AI tutor matches for a specific listing.
 * Handles loading, errors, auth expiration, and safe empty states.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAiMatches } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function useAiMatches(postId) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetch = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAiMatches(postId);
      setMatches(data || []);
    } catch (err) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        logout();
        navigate('/login');
        return;
      }
      console.warn('[useAiMatches] Failed:', err.message);
      setError('Unable to load AI matches.');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [postId, logout, navigate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { matches, loading, error, refetch: fetch };
}
