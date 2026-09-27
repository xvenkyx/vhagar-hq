import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Copy, Check, RefreshCw, ShieldOff, Clock, Cpu } from 'lucide-react';
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
  const docUrl = 'https://docs.google.com';
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
    if (!window.confirm(`Revoke ${code}? The client will be disconnected within 30 seconds.`)) return;
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
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-semibold text-white mb-1">Licenses</h1>
        <p className="text-muted text-sm">Issue and manage client access</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total',   val: stats.total,   color: 'text-white' },
          { label: 'Active',  val: stats.active,  color: 'text-emerald-400' },
          { label: 'Unused',  val: stats.unused,  color: 'text-sky-400' },
          { label: 'Revoked', val: stats.revoked, color: 'text-rose-400' },
        ].map(s => {
          return (
            <div key={s.label} className="bg-white/5 border border-white/5 rounded-xl p-4">
              <div className={`text-2xl font-semibold ${s.color}`}>{s.val}</div>
              <div className="text-xs text-muted mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Generate panel */}
        <div className="space-y-4">
          <Card title="New License">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted">Client name</label>
                <input
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full bg-black/40 border border-white/5 rounded-lg py-2.5 px-3 text-sm outline-none focus:border-white/20 text-white placeholder:text-muted transition-colors"
                />
              </div>
              {genError && (
                <p className="text-rose-400 text-xs">{genError}</p>
              )}

              <button
                type="submit"
                disabled={generating}
                className="w-full flex items-center justify-between bg-white text-black px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                <span>{generating ? 'Generating...' : 'Generate'}</span>
                <Plus size={15} />
              </button>
            </form>
          </Card>

          {newCode && (
            <Card title="Generated">
              <div className="space-y-3">
                <div className="bg-black/40 border border-white/5 rounded-lg p-4 text-center">
                  <div className="text-lg font-mono font-semibold text-primary mb-0.5">{newCode.code}</div>
                  <div className="text-xs text-muted">{newCode.clientName}</div>
                </div>
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white py-2.5 rounded-lg text-xs hover:bg-white/10 transition-colors"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy code'}
                </button>
              </div>
            </Card>
          )}
        </div>

        {/* License list */}
        <div className="lg:col-span-2">
          <Card title="All Licenses">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted">{licenses.length} total</span>
              <button
                onClick={fetchLicenses}
                disabled={loadingList}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors disabled:opacity-40"
              >
                <RefreshCw size={12} className={loadingList ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {loadingList ? (
              <div className="text-center py-10 text-muted text-xs animate-pulse">Loading...</div>
            ) : licenses.length === 0 ? (
              <div className="text-center py-10 text-muted text-xs">No licenses yet</div>
            ) : (
              <div className="space-y-2">
                {licenses.map(l => (
                  <div
                    key={l.code}
                    className="bg-black/30 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-white">{l.clientName}</span>
                          <Badge status={statusMap[l.status]?.badge || 'Unknown'}>
                            {statusMap[l.status]?.label || l.status}
                          </Badge>
                        </div>
                        <div className="font-mono text-xs text-primary">{l.code}</div>
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> {fmtDate(l.createdAt)}
                          </span>
                          {l.lastSeen && (
                            <span className="flex items-center gap-1">
                              <Cpu size={10} /> {fmtDate(l.lastSeen)}
                            </span>
                          )}
                        </div>
                      </div>

                      {l.status !== 'revoked' && (
                        <button
                          onClick={() => handleRevoke(l.code)}
                          disabled={revoking === l.code}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs hover:bg-rose-500/20 transition-colors disabled:opacity-40 shrink-0"
                        >
                          <ShieldOff size={11} />
                          {revoking === l.code ? 'Revoking...' : 'Revoke'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};