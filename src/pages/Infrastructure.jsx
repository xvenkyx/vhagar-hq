import React, { useState, useEffect } from 'react';
import { Power, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BACKEND_URL, LAMBDA_URL, INSTANCE_ID } from '../config';
import { Badge, Card } from '../components/SharedElements';

export const Infrastructure = ({ isPaid, isAdmin }) => {
  const [status, setStatus] = useState('Checking...');
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const resp = await fetch(`${LAMBDA_URL}/status/${INSTANCE_ID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await resp.json();
      if (data.success) setStatus(data.status);
    } catch { setStatus('Unknown'); }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action) => {
    if (!isPaid && !isAdmin) return alert('Purchase Required');
    setLoading(true);
    try {
      const resp = await fetch(`${LAMBDA_URL}/action`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, instanceId: INSTANCE_ID })
      });
      const data = await resp.json();
      if (data.success) fetchStatus();
      else alert(data.error);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">Cloud Infrastructure</h1>
        <p className="text-muted text-sm font-medium">Cluster Health: <span className="text-emerald-500 font-black tracking-widest uppercase text-[10px]">Optimal</span></p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className={`lg:col-span-2 border-l-2 ${status === 'Running' ? 'border-l-primary' : 'border-l-rose-500'}`}>
           <div className="flex justify-between items-start mb-8">
              <div className="min-w-0">
                <h3 className="text-[10px] md:text-xs font-black text-muted tracking-widest uppercase mb-1">VHAGAR-SECURE-RELAY-V3</h3>
                <p className="text-sm md:text-xl font-mono font-black tracking-tighter text-blue-400 break-all">
                  quadrangled-untenable-maximiliano.ngrok-free.dev
                </p>
              </div>
              <Badge status={status}>{status}</Badge>
           </div>
           
           <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-white/5 rounded-2xl flex flex-col gap-1">
                 <span className="text-[10px] font-black text-muted tracking-widest uppercase">Instance Type</span>
                 <span className="text-sm font-bold text-white/80">AWS t2.micro (AL2023)</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl flex flex-col gap-1">
                 <span className="text-[10px] font-black text-muted tracking-widest uppercase">Security Group</span>
                 <span className="text-sm font-bold text-white/80">vhagar-relay-sg</span>
              </div>
           </div>

           {isAdmin ? (
             <div className="flex flex-col md:flex-row gap-4">
                <button 
                  disabled={loading || status === 'Running' || status === 'Pending'} 
                  onClick={() => handleAction('start')}
                  className={`flex-1 py-4 px-6 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 group disabled:opacity-30 ${
                     status === 'Running' ? 'bg-white/5 text-muted border border-white/5' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                   {status === 'Pending' ? (
                      <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
                   ) : <Power size={14} className="group-hover:scale-110 transition-transform" />}
                   {status === 'Pending' ? 'PROVISIONING...' : 'PROVISION'}
                </button>
                <button 
                  disabled={loading || status === 'Stopped' || status === 'Stopping'} 
                  onClick={() => handleAction('stop')}
                  className={`flex-1 py-4 px-6 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 group disabled:opacity-30 ${
                     status === 'Stopped' ? 'bg-white/5 text-muted border border-white/5' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                  }`}
                >
                   {status === 'Stopping' ? (
                      <div className="w-3 h-3 border-2 border-rose-500 border-t-transparent animate-spin rounded-full" />
                   ) : <Activity size={14} className="group-hover:scale-110 transition-transform" />}
                   {status === 'Stopping' ? 'TERMINATING...' : 'TERMINATE'}
                </button>
             </div>
           ) : (
             <Link to="/dashboard/subs" className="flex items-center justify-center p-6 border-2 border-dashed border-white/5 rounded-3xl group hover:border-primary/40 transition-all">
                <span className="text-xs font-black text-muted group-hover:text-primary tracking-widest uppercase">Upgrade to Manage AWS Resources</span>
             </Link>
           )}
        </Card>

        <Card title="System Events">
          <div className="space-y-6">
             {[
               { time: 'T-02m', event: 'DHCP Lease Renewed' },
               { time: 'T-12m', event: 'Websocket Cluster Sync' },
               { time: 'T-45m', event: 'Periodic Health Check Pass' },
               { time: 'T-01h', event: 'AWS Auto-scaling Audit' },
             ].map(e => (
               <div key={e.event} className="flex gap-4 items-start">
                  <span className="text-[10px] font-mono font-black text-primary p-1 bg-primary/10 rounded shrink-0">{e.time}</span>
                  <p className="text-xs font-bold text-white/70 mt-1 leading-snug">{e.event}</p>
               </div>
             ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
