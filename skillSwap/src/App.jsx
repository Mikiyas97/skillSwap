import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import BrowseSkills from './pages/BrowseSkills';
import SkillDetail from './pages/SkillDetail';
import OfferSkill from './pages/OfferSkill';
import MySessions from './pages/MySessions';
import Chat from './pages/Chat';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import NotFound from './pages/NotFound';
import AiMatches from './pages/AiMatches';
import UserProfile from './pages/UserProfile';
import FloatingAssistant from './components/FloatingAssistant';

function ProtectedRoute({ children, allowOnboarding = false }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--glass-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.needsOnboarding && !allowOnboarding) return <Navigate to="/onboarding" replace />;
  if (!user.needsOnboarding && allowOnboarding) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();
  const hideNav = ['/login', '/signup', '/onboarding'].includes(location.pathname);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!hideNav && <Navbar />}
      <main style={{ flex: 1 }} className={user && !hideNav ? 'page-content' : ''}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
          <Route path="/onboarding" element={<ProtectedRoute allowOnboarding={true}><Signup initialStep={2} /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/browse" element={<BrowseSkills />} />
          <Route path="/skill/:id" element={<SkillDetail />} />
          <Route path="/offer" element={<ProtectedRoute><OfferSkill /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute><MySessions /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/ai-matches" element={<ProtectedRoute><AiMatches /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideNav && <div className="footer-desktop"><Footer /></div>}
      {!hideNav && <BottomNav />}
      <FloatingAssistant />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
