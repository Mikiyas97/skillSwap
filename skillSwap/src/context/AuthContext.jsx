import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // We have a Supabase session, now check if they have a Django profile
        const { fetchProfile } = await import('../services/api');
        try {
          const profile = await fetchProfile();
          const sessionUser = { ...profile, needsOnboarding: false };
          setUser(sessionUser);
        } catch (err) {
          // If profile fetch fails (e.g., 404), they need to complete onboarding
          setUser({ email: session.user.email, needsOnboarding: true });
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth init error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        initAuth();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Step 1 of Signup: Register user and send OTP
  const sendSignupOtp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  // Step 2 of Signup: Verify the OTP sent to their email
  const verifySignupOtp = async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    });
    
    if (error) return { data: null, error };
    
    // Now that they are verified, set them as needing onboarding
    const newUser = { email, needsOnboarding: true };
    setUser(newUser);
    return { data: { user: newUser }, error: null };
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) return { data: null, error };
    
    try {
      const { fetchProfile } = await import('../services/api');
      const profile = await fetchProfile();
      const sessionUser = { ...profile, needsOnboarding: false };
      setUser(sessionUser);
      return { data: { user: sessionUser }, error: null };
    } catch (err) {
      // Profile not found in backend, meaning they didn't finish onboarding
      const newUser = { email: data.user.email, needsOnboarding: true };
      setUser(newUser);
      return { data: { user: newUser }, error: new Error('Profile not found. Please complete signup.') };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (updates) => {
    try {
      const { updateUserProfile, fetchProfile, onboardUser } = await import('../services/api');
      if (user && !user.needsOnboarding) {
        await updateUserProfile(updates);
        const profile = await fetchProfile();
        const sessionUser = { ...profile, needsOnboarding: false };
        setUser(sessionUser);
        return { data: { user: sessionUser }, error: null };
      } else {
        await onboardUser(updates);
        const profile = await fetchProfile();
        const sessionUser = { ...profile, needsOnboarding: false };
        setUser(sessionUser);
        return { data: { user: sessionUser }, error: null };
      }
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const value = {
    user,
    loading,
    sendSignupOtp,
    verifySignupOtp,
    login,
    logout,
    updateProfile,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
