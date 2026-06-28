import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Radio, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

export const Layout = ({ user, handleLogout, children }) => {
  const location = useLocation();

  const navItems = [
    { icon: <KeyRound size={14} />, label: 'LICENSE OPS', path: '/dashboard' },
  ];

  return (
    <div className="min-h-screen flex flex-col text-[#fafafa] bg-[#09090b]">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 w-[600px] h-[300px] bg-primary/8 blur-[180px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />

      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Radio size={15} className="text-white" />
            </div>
            <div className="leading-none">
              <span className="block text-sm font-black tracking-tighter">VHAGAR</span>
              <span className="text-[9px] font-black tracking-[0.25em] text-primary uppercase">Control Hub</span>
            </div>
          </div>

          {/* Center nav — stays centered as more tabs are added */}
          <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/5 border border-white/5 rounded-2xl p-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors duration-200"
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`relative flex items-center gap-2 transition-colors ${active ? 'text-white' : 'text-muted hover:text-white/70'}`}>
                    {React.cloneElement(item.icon, { className: active ? 'text-primary' : '' })}
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right: user + logout */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden sm:flex flex-col items-end leading-none gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">Admin</span>
              <span className="text-[10px] font-mono font-bold text-muted">{user?.name || user?.adminId || 'admin'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-[10px] text-rose-500 hover:text-rose-400 uppercase font-black tracking-widest border border-rose-500/20 hover:border-rose-500/40 px-3 py-1.5 rounded-xl transition-all"
            >
              Terminate
            </button>
          </div>

        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-28 pb-16 z-10">
        {children}
      </main>
    </div>
  );
};
