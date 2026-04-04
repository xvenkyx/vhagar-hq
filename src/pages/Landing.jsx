import React, { useState, useEffect } from 'react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { Typewriter } from 'react-simple-typewriter';
import { motion } from 'framer-motion';
import { Terminal, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PricingCards } from '../components/PricingCards';

export const Landing = () => {
    const navigate = useNavigate();

    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    return (
        <div className="min-h-screen bg-[#09090b] text-white overflow-hidden selection:bg-primary/30">
            {/* Neural Network Background */}
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
                        <Terminal size={14} className="text-black" />
                    </div>
                    VHAGAR
                </div>
                <div className="flex gap-6 items-center">
                    <a href="#features" className="text-sm font-bold text-muted hover:text-white transition-colors uppercase tracking-widest hidden md:block">Features</a>
                    <a href="#pricing" className="text-sm font-bold text-muted hover:text-white transition-colors uppercase tracking-widest hidden md:block">Pricing</a>
                    <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all flex gap-2 items-center text-primary group">
                        Access Terminal
                        <div className="w-1.5 h-1.5 bg-primary rounded-full group-hover:animate-ping" />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-8 pt-32 pb-40 text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-8">
                        Undetectable Proxy Uplink Active
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                        The Ultimate <br className="md:hidden" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                            <Typewriter
                                words={['Invisible Assistant.', 'Interview Wingman.', 'Ghost Overlay.', 'Covert Operations.']}
                                loop={0}
                                cursor
                                cursorStyle='_'
                                typeSpeed={70}
                                deleteSpeed={50}
                                delaySpeed={2000}
                            />
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted font-medium max-w-2xl mx-auto mb-12">
                        Mirror live ChatGPT insights directly to any screen with zero latency. 100% invisible to Zoom, Teams, and Google Meet screen sharing.
                    </p>
                    
                    <button onClick={() => navigate('/login')} className="px-10 py-5 rounded-2xl bg-primary text-black font-black uppercase tracking-[0.2em] text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(16,163,127,0.4)]">
                        Initialize Connection
                    </button>
                </motion.div>
            </main>

            {/* Feature Highlights */}
            <section id="features" className="relative z-10 py-24 bg-black/40 border-y border-white/5 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors group">
                            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black mb-3">Undetectable Output</h3>
                            <p className="text-muted leading-relaxed text-sm">Our custom C++ framework renders UI directly to the GPU buffer, ensuring standard desktop capturing software only sees your original presentation.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors group">
                            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Terminal className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black mb-3">Live Interventions</h3>
                            <p className="text-muted leading-relaxed text-sm">Hold dedicated relay nodes where an external expert can type overrides in bold red or green text straight to your transparent overlay.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors group">
                            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black mb-3">Deepgram AI Capture</h3>
                            <p className="text-muted leading-relaxed text-sm">Optional automated listening captures Chrome tab audio and runs blazing-fast local speech-to-text to auto-query the logic engine.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Public Pricing Cards Setup */}
            <section id="pricing" className="relative z-10 py-32 max-w-7xl mx-auto px-8">
                <PricingCards 
                    isPaid={false} 
                    onSelectPlan={() => navigate('/login')} 
                    embedded={false}
                />
            </section>
            
            <footer className="relative z-10 border-t border-white/5 text-center py-12 text-muted text-sm font-black uppercase tracking-widest">
                © 2026 Vhagar Systems. Ghost Operations.
            </footer>
        </div>
    );
};
