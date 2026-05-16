/**
 * useAPI — Custom hook for data fetching with mock fallback.
 * Tries the real API first; falls back to mock data if unavailable.
 */

import { useState, useEffect, useCallback } from 'react';

export function useAPI(apiFn, mockFallback, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn();
      setData(result);
      setIsLive(true);
    } catch (err) {
      console.warn('[useAPI] API unavailable, using mock data:', err.message);
      setData(typeof mockFallback === 'function' ? mockFallback() : mockFallback);
      setIsLive(false);
    }
    setLoading(false);
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, isLive, refetch, setData };
}

/**
 * useAPIMutation — For POST/PUT/DELETE operations with fallback.
 */
export function useAPIMutation(apiFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      setLoading(false);
      return { data: result, error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { data: null, error: err.message };
    }
  };

  return { mutate, loading, error };
}
