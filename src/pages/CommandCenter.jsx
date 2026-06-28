import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Plus, Copy, Check, RefreshCw, ShieldOff, Clock, Cpu } from 'lucide-react';
import { Card, Badge } from '../components/SharedElements';
import { OCR_API } from '../config';

const statusMap = {
  unused:  { label: 'Unused',  badge: 'Unknown'  },
  active:  { label: 'Active',  badge: 'Running'  },
  revoked: { label: 'Revoked', badge: 'Stopped'  },
};

function fmtDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export const CommandCenter = () => {
  const token = localStorage.getItem('vhagar_token');

  const [licenses, setLicenses] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const [clientName, setClientName] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [newCode, setNewCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const [revoking, setRevoking] = useState(null);

  const fetchLicenses = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch(`${OCR_API}/admin/licenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLicenses(data.licenses || []);
    } catch {
      setLicenses([]);
    } finally {
      setLoadingList(false);
    }
  }, [token]);

  useEffect(() => { fetchLicenses(); }, [fetchLicenses]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenError('');
    if (!clientName.trim()) return setGenError('Client name required.');
    if (!docUrl.startsWith('https://')) return setGenError('Enter a valid https:// URL.');
    setGenerating(true);
    setNewCode(null);
    try {
      const res = await fetch(`${OCR_API}/admin/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ clientName: clientName.trim(), docUrl: docUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate.');
      setNewCode(data);
      setClientName('');
      setDocUrl('');
      fetchLicenses();
    } catch (err) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!newCode) return;
    navigator.clipboard.writeText(newCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async (code) => {
    if (!window.confirm(`Revoke license ${code}?\n\nThe client's app will be kicked out within 30 seconds.`)) return;
    setRevoking(code);
    try {
      await fetch(`${OCR_API}/admin/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
      });
      fetchLicenses();
    } finally {
      setRevoking(null);
    }
  };

  const stats = {
    total: licenses.length,
    active: licenses.filter(l => l.status === 'active').length,
    unused: licenses.filter(l => l.status === 'unused').length,
    revoked: licenses.filter(l => l.status === 'revoked').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">License Command Center</h1>
        <p className="text-muted text-sm font-medium">Issue and manage client access licenses</p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Issued',  val: stats.total,   color: 'text-white' },
          { label: 'Active',        val: stats.active,  color: 'text-emerald-400' },
          { label: 'Unused',        val: stats.unused,  color: 'text-sky-400' },
          { label: 'Revoked',       val: stats.revoked, color: 'text-rose-400' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/5 rounded-2xl p-5">
            <div className={`text-3xl font-black ${s.color}`}>{s.val}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted font-black mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Generate Panel */}
        <div className="space-y-4">
          <Card title="Issue New License">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted font-black">Client Name</label>
                <input
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:border-primary/50 focus:bg-white/5 text-white placeholder:text-white/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted font-black">Google Doc URL</label>
                <input
                  value={docUrl}
                  onChange={e => setDocUrl(e.target.value)}
                  placeholder="https://docs.google.com/..."
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:border-primary/50 focus:bg-white/5 text-white placeholder:text-white/20 transition-all"
                />
              </div>

              <AnimatePresence>
                {genError && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-rose-500 text-xs font-bold uppercase tracking-widest">
                    {genError}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={generating}
                className="w-full flex items-center justify-between bg-white text-black px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <span>{generating ? 'Generating...' : 'Generate Code'}</span>
                <Plus size={18} />
              </button>
            </form>
          </Card>

          {/* Generated Code Result */}
          <AnimatePresence>
            {newCode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card title="License Generated">
                  <div className="space-y-4">
                    <div className="bg-black/40 border border-primary/20 rounded-2xl p-5 text-center">
                      <div className="text-2xl font-black tracking-[0.15em] text-primary font-mono mb-1">{newCode.code}</div>
                      <div className="text-[10px] text-muted uppercase tracking-widest">{newCode.clientName}</div>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="w-full flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 text-primary py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* License Table */}
        <div className="lg:col-span-2">
          <Card title="All Licenses">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted font-medium">{licenses.length} total</span>
              <button
                onClick={fetchLicenses}
                disabled={loadingList}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted hover:text-white font-black transition-colors disabled:opacity-40"
              >
                <RefreshCw size={12} className={loadingList ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {loadingList ? (
              <div className="text-center py-12 text-muted text-xs uppercase tracking-widest font-black animate-pulse">
                Loading...
              </div>
            ) : licenses.length === 0 ? (
              <div className="text-center py-12 text-muted text-xs uppercase tracking-widest font-black">
                No licenses issued yet
              </div>
            ) : (
              <div className="space-y-2">
                {licenses.map(l => (
                  <motion.div
                    key={l.code}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-black/30 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-black text-sm text-white">{l.clientName}</span>
                          <Badge status={statusMap[l.status]?.badge || 'Unknown'}>
                            {statusMap[l.status]?.label || l.status}
                          </Badge>
                        </div>
                        <div className="font-mono text-xs tracking-widest text-primary/80">{l.code}</div>
                        <div className="flex items-center gap-4 text-[10px] text-muted font-medium">
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> Created {fmtDate(l.createdAt)}
                          </span>
                          {l.lastSeen && (
                            <span className="flex items-center gap-1">
                              <Cpu size={10} /> Last seen {fmtDate(l.lastSeen)}
                            </span>
                          )}
                        </div>
                      </div>

                      {l.status !== 'revoked' && (
                        <button
                          onClick={() => handleRevoke(l.code)}
                          disabled={revoking === l.code}
                          className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all disabled:opacity-40 shrink-0"
                        >
                          <ShieldOff size={11} />
                          {revoking === l.code ? 'Revoking...' : 'Revoke'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
