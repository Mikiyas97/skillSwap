/**
 * useSkillSuggestions — Fetch AI-powered skill suggestions for the current user.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSkillSuggestions } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function useSkillSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSkillSuggestions();
      setSuggestions(data?.suggestions || []);
    } catch (err) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        logout();
        navigate('/login');
        return;
      }
      console.warn('[useSkillSuggestions] Failed:', err.message);
      setError('Unable to load skill suggestions.');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { suggestions, loading, error, refetch: fetch };
}
