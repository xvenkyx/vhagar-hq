import React from 'react';

export const Card = ({ children, className = '', title }) => (
  <div className={`bg-card/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl transition-all hover:bg-white/5 hover:border-white/10 ${className}`}>
    {title && <h3 className="text-sm font-bold text-muted uppercase tracking-widest mb-6">{title}</h3>}
    {children}
  </div>
);

export const Badge = ({ children, status }) => {
  const colors = {
    Running: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    Stopped: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    Unknown: 'text-muted bg-muted/10 border-muted/20',
    'Checking...': 'text-sky-500 bg-sky-500/10 border-sky-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-tighter ${colors[status] || colors.Unknown}`}>
      {children}
    </span>
  );
};
