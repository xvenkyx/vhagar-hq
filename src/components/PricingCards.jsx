import React from 'react';
import { Terminal, Cloud, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PricingCards = ({ isPaid, onSelectPlan, embedded = false }) => {
  const plans = [
    { name: 'Standard', price: '0', icon: <Terminal size={24} />, features: ['Single Relay Node', 'Basic Invisible Overlay', 'Community Support'] },
    { name: 'Elite', price: '29', icon: <Cloud size={24} />, features: ['Global Relay Network', 'Advanced Cloaking', 'Priority Support', 'Custom Overrides'], popular: true },
    { name: 'Corporate', price: '99', icon: <ShieldCheck size={24} />, features: ['Private EC2 Cluster', 'Team Dashboard', 'API Access', '24/7 Concierge'] }
  ];

  return (
    <div className={`space-y-16 animate-in fade-in duration-500 ${!embedded ? 'max-w-6xl mx-auto' : ''}`}>
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black tracking-tighter text-white">Choose Your Plan</h1>
        <p className="text-muted font-medium text-lg">Scale your undetectable interview assistant to the next level.</p>
        {isPaid && <p className="text-primary font-black uppercase text-xs tracking-widest mt-6 bg-primary/10 inline-block px-4 py-1.5 rounded-full border border-primary/20 shadow-2xl shadow-primary/20 animate-pulse">✓ Pro Access Active</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {plans.map((p) => (
          <div key={p.name} className={`group p-10 rounded-[40px] border transition-all ${p.popular ? 'bg-primary/5 border-primary/40 shadow-2xl shadow-primary/10' : 'bg-card/40 border-white/5 hover:border-white/20'} flex flex-col`}>
             <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                {React.cloneElement(p.icon, { className: 'text-primary' })}
             </div>
             <h3 className="text-2xl font-black text-white mb-2">{p.name}</h3>
             <div className="mb-10">
                <span className="text-5xl font-black tracking-tighter text-white">${p.price}</span>
                <span className="text-muted font-bold text-lg"> /mo</span>
             </div>
             <ul className="space-y-6 flex-1 mb-12">
               {p.features.map(f => <li key={f} className="text-xs text-white/60 font-bold flex gap-3"><span className="text-primary">✓</span> {f}</li>)}
             </ul>
             <button 
                onClick={() => onSelectPlan && onSelectPlan(p.name)} 
                className={`w-full py-5 rounded-2xl font-black tracking-widest uppercase text-xs transition-all ${p.popular ? 'bg-primary text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-95' : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'}`}
             >
                {isPaid ? 'Already Subscribed' : `Select ${p.name}`}
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};
