import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchConversations } from '../../services/api';
import {
  BookOpen,
  Search,
  MessageCircle,
  Trophy,
  User,
  LogOut,
  Plus,
  LayoutDashboard,
  Sparkles,
  Bell,
} from 'lucide-react';

const navLinks = [
  { to: '/browse', label: 'Browse', icon: Search },
  { to: '/offer', label: 'Post Skill', icon: Plus },
  { to: '/sessions', label: 'Sessions', icon: BookOpen },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/ai-matches', label: 'AI Match', icon: Sparkles },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const dropdownRef = useRef(null);

  // Poll for unread messages
  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    
    const loadUnread = async () => {
      try {
        const convs = await fetchConversations();
        if (isMounted) {
          const unread = convs.reduce((sum, c) => sum + (c.unread_count || 0), 0);
          setTotalUnread(unread);
        }
      } catch (e) {
        // Silently ignore polling errors
      }
    };
    
    loadUnread();
    const interval = setInterval(loadUnread, 5000); // Poll every 5s for responsiveness
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setProfileOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  // Close dropdown on route change
  useEffect(() => { setProfileOpen(false); }, [location.pathname]);

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 10, 18, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.95rem', color: '#fff',
            }}>S</div>
            <span style={{
              fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.15rem',
              color: 'var(--color-text-primary)',
            }}>
              Skill<span style={{ color: 'var(--color-primary)' }}>Swap</span>
            </span>
          </Link>

          {/* Desktop Nav Links — hidden on mobile via CSS */}
          {user && (
            <div className="nav-desktop-links" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {navLinks.map(link => {
                const Icon = link.icon;
                const active = location.pathname === link.to;
                return (
                  <Link key={link.to} to={link.to} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem', fontWeight: 500,
                    color: active ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
                    background: active ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}
                  >
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Icon size={16} />
                      {link.label === 'Chat' && totalUnread > 0 && (
                        <div style={{
                          position: 'absolute', top: -6, right: -8,
                          background: '#EF4444', color: '#fff', fontSize: '0.6rem',
                          fontWeight: 800, width: 16, height: 16, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid var(--color-dark-900)'
                        }}>
                          {totalUnread > 9 ? '9+' : totalUnread}
                        </div>
                      )}
                    </div>
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user ? (
              <>
                {/* Notification bell — visible on mobile */}
                <button style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-muted)', padding: 6, minWidth: 36, minHeight: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bell size={20} />
                </button>

                {/* Avatar dropdown */}
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                      minHeight: 44,
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '0.8rem', fontWeight: 700,
                      flexShrink: 0,
                    }}>{initials}</div>
                    <span className="nav-desktop-links" style={{
                      fontSize: '0.875rem', fontWeight: 500,
                      color: 'var(--color-text-primary)',
                    }}>{userName.split(' ')[0]}</span>
                  </button>

                  {profileOpen && (
                    <div style={{
                      position: 'absolute', right: 0, top: '120%', width: 220,
                      background: 'var(--color-dark-700)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                      overflow: 'hidden', zIndex: 200,
                    }}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{userName}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user.email}</p>
                      </div>
                      <div style={{ padding: 4 }}>
                        {[
                          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                          { to: '/profile', label: 'Profile', icon: User },
                        ].map(item => {
                          const Icon = item.icon;
                          return (
                            <Link key={item.to} to={item.to} onClick={() => setProfileOpen(false)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                                fontSize: '0.875rem', color: 'var(--color-text-secondary)',
                                transition: 'all 0.2s', minHeight: 44,
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                            >
                              <Icon size={16} /> {item.label}
                            </Link>
                          );
                        })}
                        <button onClick={handleLogout}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                            padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                            fontSize: '0.875rem', color: 'var(--color-secondary)',
                            background: 'none', border: 'none', cursor: 'pointer',
                            transition: 'all 0.2s', minHeight: 44,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/login" className="btn-secondary btn-inline" style={{ padding: '8px 20px', fontSize: '0.875rem' }}>
                  Log In
                </Link>
                <Link to="/signup" className="btn-primary btn-inline" style={{ padding: '8px 20px', fontSize: '0.875rem' }}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
