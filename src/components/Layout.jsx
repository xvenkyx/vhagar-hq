import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { KeyRound } from 'lucide-react';

export const Layout = ({ user, handleLogout, children }) => {
  const location = useLocation();

  const navItems = [
    { icon: <KeyRound size={14} />, label: 'Licenses', path: '/dashboard' },
  ];

  return (
    <div className="min-h-screen flex flex-col text-foreground bg-background">

      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-background/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-8">

          <span className="text-sm font-semibold">Vhagar</span>

          <nav className="flex items-center gap-1">
            {navItems.map(({ icon, label, path }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs transition-colors ${
                    active ? 'bg-white/10 text-white' : 'text-muted hover:text-white'
                  }`}
                >
                  {icon}
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-xs text-muted">{user?.name || user?.adminId || 'admin'}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-muted hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>

        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 pt-24 pb-16">
        {children}
      </main>
    </div>
  );
};