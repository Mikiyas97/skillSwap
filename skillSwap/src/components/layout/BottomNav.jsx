import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, BookOpen, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/browse', label: 'Explore', icon: Search },
  { to: '/offer', label: 'Post', icon: Plus, isCenter: true },
  { to: '/sessions', label: 'Sessions', icon: BookOpen },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <nav className="bottom-nav">
      {navItems.map(item => {
        const Icon = item.icon;
        const active = location.pathname === item.to ||
          (item.to === '/dashboard' && location.pathname === '/') ||
          (item.to === '/browse' && location.pathname.startsWith('/skill/'));

        if (item.isCenter) {
          return (
            <Link key={item.to} to={item.to} className="bottom-nav-post" aria-label="Post Skill">
              <Icon />
            </Link>
          );
        }

        return (
          <Link
            key={item.to}
            to={item.to}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
          >
            <Icon />
            {active && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
