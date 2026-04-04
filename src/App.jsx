import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// API Configuration
import { API_URL } from './config';

// Pages
import { Landing } from './pages/Landing';
import { AuthScreen } from './Auth';
import { UserManagement } from './UserManagement';
import { CommandCenter } from './pages/CommandCenter';
import { Infrastructure } from './pages/Infrastructure';
import { Subscriptions } from './pages/Subscriptions';
import { ProductHub } from './pages/ProductHub';

// Components
import { Layout } from './components/Layout';

const App = () => {
  const navigate = useNavigate();
  
  // AUTH STATE
  const [token, setToken] = useState(localStorage.getItem('vhagar_token') || null);
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Validate Token on Load
    const verifyToken = async () => {
      if (!token) { setIsLoadingAuth(false); return; }
      try {
        const res = await fetch(`${API_URL}/api/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        if (data.valid) { setUser(data.user); } 
        else { setToken(null); localStorage.removeItem('vhagar_token'); }
      } catch (err) {
        setToken(null);
      }
      setIsLoadingAuth(false);
    };

    verifyToken();
  }, [token]);

  const handleLogin = (jwt, userData) => {
    localStorage.setItem('vhagar_token', jwt);
    setToken(jwt);
    setUser(userData);
    navigate('/dashboard'); // Auto-redirect after login
  };

  const handleLogout = () => {
    localStorage.removeItem('vhagar_token');
    setToken(null);
    setUser(null);
    navigate('/login'); // Send back to login page for retention
  };

  const handleSimulateUpgrade = () => {
    if (user) {
      setUser({ ...user, isPaid: true });
      alert("Payment Successful! License unlocked.");
    }
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center font-black uppercase tracking-widest text-xs animate-pulse">Establishing Secure Uplink...</div>;
  }

  // Derived Auth Logic
  const isAdmin = user?.role === 'admin';
  const isPaid = user?.isPaid === true;

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        {/* Auth Route redirects them if they are already logged in */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthScreen onLogin={handleLogin} />} />

        {/* PRIVATE ROUTES (DASHBOARD) */}
        {user && (
          <Route path="/dashboard" element={<Layout user={user} handleLogout={handleLogout}><CommandCenterOrHub isAdmin={isAdmin} isPaid={isPaid} /></Layout>} />
        )}
        {user && isAdmin && (
          <Route path="/dashboard/users" element={<Layout user={user} handleLogout={handleLogout}><UserManagement token={token} /></Layout>} />
        )}
        {user && isAdmin && (
          <Route path="/dashboard/ec2" element={<Layout user={user} handleLogout={handleLogout}><Infrastructure isPaid={isPaid} isAdmin={isAdmin} /></Layout>} />
        )}
        {user && (
          <Route path="/dashboard/subs" element={<Layout user={user} handleLogout={handleLogout}><Subscriptions isPaid={isPaid} setIsPaid={handleSimulateUpgrade} /></Layout>} />
        )}

        {/* Fallback route for unauthorized accesses deep-linking directly */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </AnimatePresence>
  );
};

// Helper Component to determine the root Dashboard view based on role
const CommandCenterOrHub = ({ isAdmin, isPaid }) => {
  return isAdmin ? <CommandCenter isPaid={isPaid} /> : <ProductHub isPaid={isPaid} isAdmin={isAdmin} />;
};

export default App;
