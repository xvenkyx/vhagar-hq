import React from 'react';
import { Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Landing = () => {
  const navigate = useNavigate();

  const isMac = /Mac|iPhone|iPod|iPad/.test(navigator.platform);
  const downloadUrl = isMac
    ? 'https://github.com/xvenkyx/vhagar-client/releases/latest/download/Vhagar.dmg'
    : 'https://github.com/xvenkyx/vhagar-client/releases/latest/download/Vhagar.exe';
  const downloadLabel = isMac ? 'Download for Mac' : 'Download for Windows';
  const platformNote = isMac ? 'macOS · Requires license code' : 'Windows · Requires license code';

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">

      <nav className="flex justify-between items-center px-8 py-6 max-w-4xl mx-auto w-full">
        <span className="text-sm font-semibold">Vhagar</span>
        <button
          onClick={() => navigate('/login')}
          className="text-xs text-muted hover:text-white transition-colors"
        >
          Admin
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center pb-24">
        <p className="text-xs text-muted mb-6 tracking-widest uppercase">You know why you're here</p>

        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-4 leading-tight">
          Just download it.
        </h1>

        <p className="text-muted mb-10 max-w-sm leading-relaxed">
          No demo. No explainer. Your license code does the talking.
        </p>

        <a
          href={downloadUrl}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
        >
          <Download size={15} />
          {downloadLabel}
        </a>

        <p className="mt-3 text-xs text-muted">{platformNote}</p>
      </main>

      <footer className="text-center py-6 text-muted text-xs border-t border-white/5">
        © 2026 Vhagar Systems
      </footer>
    </div>
  );
};