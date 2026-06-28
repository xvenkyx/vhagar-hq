import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { OCR_API } from './config';
import { Landing } from './pages/Landing';
import { AuthScreen } from './Auth';
import { CommandCenter } from './pages/CommandCenter';
import { Layout } from './components/Layout';

const App = () => {
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem('vhagar_token') || null);
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) { setIsLoadingAuth(false); return; }
      try {
        // Verify by hitting the list endpoint — if the token is valid we get 200
        const res = await fetch(`${OCR_API}/admin/licenses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          // Token still good — restore user from localStorage
          const saved = localStorage.getItem('vhagar_user');
          setUser(saved ? JSON.parse(saved) : { role: 'admin' });
        } else {
          setToken(null);
          localStorage.removeItem('vhagar_token');
          localStorage.removeItem('vhagar_user');
        }
      } catch {
        // Network error — keep user logged in, CommandCenter will handle failures
        const saved = localStorage.getItem('vhagar_user');
        setUser(saved ? JSON.parse(saved) : { role: 'admin' });
      }
      setIsLoadingAuth(false);
    };

    verifyToken();
  }, [token]);

  const handleLogin = (jwt, userData) => {
    localStorage.setItem('vhagar_token', jwt);
    localStorage.setItem('vhagar_user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('vhagar_token');
    localStorage.removeItem('vhagar_user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center font-black uppercase tracking-widest text-xs animate-pulse">
        Establishing Secure Uplink...
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthScreen onLogin={handleLogin} />} />

        {user && (
          <Route
            path="/dashboard"
            element={
              <Layout user={user} handleLogout={handleLogout}>
                <CommandCenter />
              </Layout>
            }
          />
        )}

        <Route path="*" element={<Landing />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
