/**
 * useStudyPartners — Fetch study partner matches for a specific listing.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStudyPartners } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function useStudyPartners(postId) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetch = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStudyPartners(postId);
      setPartners(data || []);
    } catch (err) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        logout();
        navigate('/login');
        return;
      }
      console.warn('[useStudyPartners] Failed:', err.message);
      setError('Unable to load study partners.');
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, [postId, logout, navigate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { partners, loading, error, refetch: fetch };
}
