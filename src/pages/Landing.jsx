import React, { useState, useEffect } from 'react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { Typewriter } from 'react-simple-typewriter';
import { motion } from 'framer-motion';
import { Radio, Download, Shield, EyeOff, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: <EyeOff className="w-6 h-6" />,
    color: 'text-rose-400 bg-rose-500/10',
    title: 'Invisible Overlay',
    desc: 'The display window is completely hidden from screen share — only you can see it.',
  },
  {
    icon: <Radio className="w-6 h-6" />,
    color: 'text-primary bg-primary/10',
    title: 'Live Doc Sync',
    desc: 'Your assigned Google Doc loads instantly. Any updates your operator makes appear in real time.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    color: 'text-amber-400 bg-amber-500/10',
    title: 'Zero Setup',
    desc: 'Enter your license code once. The app remembers everything — no URL, no config, just launch.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    color: 'text-blue-400 bg-blue-500/10',
    title: 'Machine Locked',
    desc: 'Each license is bound to one machine. Your access is yours alone — no sharing, no conflicts.',
  },
];

export const Landing = () => {
  const navigate = useNavigate();
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden selection:bg-primary/30">

      {/* Particle background */}
      {init && (
        <Particles
          id="tsparticles"
          className="absolute inset-0 z-0 opacity-40 pointer-events-none"
          options={{
            particles: {
              color: { value: "#10a37f" },
              links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.1, width: 1 },
              move: { enable: true, speed: 0.8 },
              number: { density: { enable: true, area: 800 }, value: 50 },
              opacity: { value: 0.3 },
              size: { value: { min: 1, max: 3 } },
            },
          }}
        />
      )}

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center p-8 max-w-7xl mx-auto">
        <div className="font-black text-2xl tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,163,127,0.4)]">
            <Radio size={14} className="text-black" />
          </div>
          VHAGAR
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all flex gap-2 items-center text-primary group"
        >
          Admin Access
          <div className="w-1.5 h-1.5 bg-primary rounded-full group-hover:animate-ping" />
        </button>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-4xl mx-auto px-8 pt-28 pb-32 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-8">
            Your Interview Edge
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
            The Invisible<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              <Typewriter
                words={['Display.', 'Assistant.', 'Overlay.', 'Advantage.']}
                loop={0}
                cursor
                cursorStyle="_"
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={2000}
              />
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted font-medium max-w-2xl mx-auto mb-14">
            A private overlay that mirrors your assigned Google Doc directly on your screen — completely hidden from screen sharing — during your most important moments.
          </p>

          {/* Download CTA */}
          <motion.a
            href="/DocsDisplay.exe"
            download
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-primary text-black font-black uppercase tracking-[0.15em] text-sm shadow-[0_0_40px_rgba(16,163,127,0.35)] hover:shadow-[0_0_60px_rgba(16,163,127,0.5)] transition-shadow"
          >
            <Download size={18} />
            Download App
          </motion.a>

          <p className="mt-4 text-[11px] text-muted/60 uppercase tracking-widest font-bold">
            Windows · Requires license code
          </p>
        </motion.div>
      </main>

      {/* Features */}
      <section className="relative z-10 py-24 bg-black/40 border-y border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-black tracking-tighter mb-3">How it works</h2>
            <p className="text-muted text-sm font-medium">Simple to use. Impossible to detect.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors group"
              >
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-black mb-3">{f.title}</h3>
                <p className="text-muted leading-relaxed text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 py-32 text-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">
            Ready to get your <span className="text-primary">edge?</span>
          </h2>
          <p className="text-muted font-medium mb-10 max-w-lg mx-auto">
            Download the app, enter the license code you received, and you're live in under a minute.
          </p>
          <motion.a
            href="/DocsDisplay.exe"
            download
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-[0.15em] text-sm hover:bg-white/90 transition-colors"
          >
            <Download size={18} />
            Download for Windows
          </motion.a>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-white/5 text-center py-10 text-muted text-xs font-black uppercase tracking-widest">
        © 2026 Vhagar Systems. All rights reserved.
      </footer>
    </div>
  );
};
