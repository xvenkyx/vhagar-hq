import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Key, ShieldCheck, ChevronRight } from 'lucide-react';

export const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Use the local EC2 deployed endpoint or localhost if testing
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white p-6 relative overflow-hidden">
      {/* Background Blurs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 border border-white/10 rounded-2xl mb-6 shadow-2xl">
            <Lock className="text-primary" size={28} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase">Vhagar <span className="text-primary">Gate</span></h1>
          <p className="text-xs uppercase tracking-widest text-white/40 font-bold">Secure Access Terminal</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-3xl shadow-2xl space-y-6">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs p-4 rounded-xl font-bold uppercase tracking-widest text-center">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="OPERATIVE EMAIL"
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold tracking-widest outline-none focus:border-primary/50 focus:bg-white/5 text-white placeholder:text-white/20 transition-all uppercase"
              />
            </div>

            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="ACCESS PHRASE"
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold tracking-widest outline-none focus:border-primary/50 focus:bg-white/5 text-white placeholder:text-white/20 transition-all uppercase"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-between bg-white text-black px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/90 active:scale-[0.98] transition-all group disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : isLogin ? 'Initialize Uplink' : 'Register Operative'}</span>
            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
          </button>

          <div className="pt-4 border-t border-white/5 text-center">
             <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-xs text-white/30 hover:text-white transition-colors font-bold uppercase tracking-widest"
              >
                {isLogin ? "Need access? Request clearance" : "Already an operative? Sign in"}
             </button>
          </div>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-white/20 uppercase font-black tracking-[0.2em]">
           <ShieldCheck size={14} /> End-to-End Encrypted Handshake
        </div>
      </motion.div>
    </div>
  );
};
