import React from 'react';
import { Terminal, ShieldCheck, Activity, Lock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/SharedElements';

export const ProductHub = ({ isPaid, isAdmin }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">Vhagar Pro <span className="text-primary">Terminal</span></h1>
        <p className="text-muted text-sm font-medium tracking-wide">Welcome to the future of undeniable, invisible assistance.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card title="The Vanguard Advantage">
            <div className="space-y-6">
              <p className="text-sm leading-relaxed text-white/70">
                Vhagar allows you to seamlessly mirror live ChatGPT or Claude outputs directly to any screen in real-time, completely invisible to screen-sharing applications like Zoom, Microsoft Teams, and Google Meet.
              </p>
              <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Terminal size={20} />
                </div>
                <div>
                  <h4 className="font-black text-white text-xs tracking-widest uppercase mb-1">Hardware Bound</h4>
                  <p className="text-[10px] text-muted-foreground uppercase leading-relaxed font-bold tracking-wider">
                    Your license is cryptographically fused to your machine's hardware ID. 100% Secure.
                  </p>
                </div>
              </div>
               <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Activity size={20} />
                </div>
                <div>
                  <h4 className="font-black text-white text-xs tracking-widest uppercase mb-1">Zero-Latency Relay</h4>
                  <p className="text-[10px] text-muted-foreground uppercase leading-relaxed font-bold tracking-wider">
                    Our C++ desktop engine runs at &lt;8ms latency, drawing natively to the GPU overlay.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-8">
            <Card title="License Status">
              {(isPaid || isAdmin) ? (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-4">
                  <div className="w-12 h-12 mx-auto bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                     <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-emerald-400 font-black uppercase tracking-widest">{isAdmin ? 'Admin Terminal Active' : 'Active License'}</h3>
                  <p className="text-xs text-emerald-500/70 font-bold uppercase tracking-widest">{isAdmin ? 'Secure Proxy Uplink Enabled.' : 'Device fusion is enabled.'}</p>
                </div>
              ) : (
                <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center space-y-4">
                  <div className="w-12 h-12 mx-auto bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mb-4">
                     <Lock size={24} />
                  </div>
                  <h3 className="text-rose-400 font-black uppercase tracking-widest">License Disabled</h3>
                  <p className="text-xs text-rose-500/70 font-bold uppercase tracking-widest mb-6">Purchase a subscription to unlock.</p>
                  <Link to="/dashboard/subs" className="inline-block px-6 py-3 bg-rose-500 text-rose-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-rose-400 transition-colors text-center w-full">
                     Open Billing Portal
                  </Link>
                </div>
              )}
            </Card>
        </motion.div>
      </div>

      <AnimatePresence>
        {isPaid && (
          <motion.div initial={{ y: 20, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} className="mt-8 p-12 bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20 rounded-[40px] text-center space-y-6 relative overflow-hidden backdrop-blur-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
             <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Download Client</h3>
             <p className="text-white/60 max-w-xl mx-auto font-bold tracking-wide leading-relaxed">The ultimate undetectable assistant. Mirror ChatGPT results in a dedicated invisible layer that Zoom and Teams can't see.</p>
             <button className="bg-white text-black px-8 py-4 md:px-14 md:py-6 rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] gap-3 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] active:scale-95 flex items-center mx-auto mt-8 group">
                Download Client v2.2.0
                <ChevronRight className="group-hover:translate-x-1" size={18} />
             </button>
             <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.3em] mt-8">Latest stable build for Windows 10/11</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
