import React from 'react';

export const Card = ({ children, className = '', title }) => (
  <div className={`bg-white/3 border border-white/5 rounded-2xl p-5 ${className}`}>
    {title && <h3 className="text-xs text-muted mb-4">{title}</h3>}
    {children}
  </div>
);

export const Badge = ({ children, status }) => {
  const colors = {
    Running: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Stopped: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    Unknown: 'text-[#71717a] bg-white/5 border-white/10',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] border ${colors[status] || colors.Unknown}`}>
      {children}
    </span>
  );
};