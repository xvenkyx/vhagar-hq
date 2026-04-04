import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquareText, Server, CreditCard, Radio, Github, Users, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const Layout = ({ user, handleLogout, children }) => {
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close sidebar on navigation in mobile
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const navItems = [];
  if (isAdmin) {
      navItems.push({ icon: <LayoutDashboard size={18} />, label: 'COMMANDER', path: '/dashboard' });
      navItems.push({ icon: <Users size={18} />, label: 'USERS', path: '/dashboard/users' });
      navItems.push({ icon: <Server size={18} />, label: 'INFRASTRUCTURE', path: '/dashboard/ec2' });
  } else {
      navItems.push({ icon: <LayoutDashboard size={18} />, label: 'PRODUCT HUB', path: '/dashboard' });
      navItems.push({ icon: <CreditCard size={18} />, label: 'BILLING', path: '/dashboard/subs' });
  }

  return (
    <div className="min-h-screen flex text-[#fafafa] bg-[#09090b] overflow-hidden">
      {/* Sidebar Overlay for Blur */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[180px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 w-full h-16 bg-[#09090b]/90 border-b border-white/5 backdrop-blur-3xl z-40 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                  <Radio size={16} className="text-white" />
              </div>
              <span className="font-black tracking-tighter">VHAGAR</span>
          </div>
          <button onClick={() => setIsMobileOpen(true)} className="p-2 bg-white/5 rounded-lg text-white hover:text-primary transition-colors">
              <Menu size={20} />
          </button>
      </div>

      {/* Mobile Backdrop */}
      <AnimatePresence>
         {isMobileOpen && (
             <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setIsMobileOpen(false)}
                className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
             />
         )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 h-screen w-full md:w-[340px] max-w-[340px] border-r border-white/5 p-8 md:p-12 flex flex-col gap-12 bg-[#09090b] md:bg-[#09090b]/80 backdrop-blur-3xl z-50 shrink-0 transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40">
                <Radio className="text-white" size={24} />
              </div>
              <div className="hidden md:block">
                <span className="block text-2xl font-black tracking-tighter leading-none">VHAGAR</span>
                <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">v2 Control Hub</span>
              </div>
            </div>
            {/* Close Button Mobile */}
            <button onClick={() => setIsMobileOpen(false)} className="md:hidden p-2 rounded-lg bg-white/5 text-white/50 hover:text-white">
                <X size={20} />
            </button>
        </div>

        <nav className="flex flex-col gap-2 mt-4 md:mt-12">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${
                  active ? 'bg-white/5 border border-white/10 text-white font-black shadow-2xl' : 'text-muted font-bold hover:text-white'
                }`}
              >
                {React.cloneElement(item.icon, { size: 18, className: active ? 'text-primary' : '' })}
                <span className="text-xs uppercase tracking-widest">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto space-y-6">
           <div className="p-6 md:p-8 bg-white/5 rounded-3xl border border-white/5 space-y-2">
             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#10a37f]">
                <span className="flex items-center gap-2 pr-2">{isAdmin ? 'Admin Root Access' : 'Client Access'}</span>
             </div>
             <div className="text-[10px] font-mono font-bold text-muted truncate">{user?.email}</div>
           </div>
           
           <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity cursor-pointer grayscale hover:grayscale-0">
                  <Github size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">v2.1.0 STABLE</span>
              </div>
              <button onClick={handleLogout} className="text-[10px] text-rose-500 hover:text-rose-400 uppercase font-black tracking-widest">
                  Terminate
              </button>
           </div>
        </div>
      </aside>

      {/* Main View */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto relative p-6 pt-24 md:p-16 z-0">
        {children}
      </main>
    </div>
  );
};
