import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquareText, Server, CreditCard, Radio, Github, Power, Activity, Terminal, Cloud, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Constants ---
// --- Constants ---
const EC2_IP = '65.0.246.225'; // PUT YOUR ELASTIC IP HERE
const LAMBDA_URL = 'https://64te6jvzb3ffxehmoun2z6tlha0fmyru.lambda-url.ap-south-1.on.aws';
const BACKEND_URL = LAMBDA_URL;
const RELAY_WS_URL = `ws://${EC2_IP}:3000`;
const INSTANCE_ID = 'i-0899ed741416cd5a5';

// --- Shared Elements ---
const Card = ({ children, className = '', title }) => (
  <div className={`bg-card/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl transition-all hover:bg-white/5 hover:border-white/10 ${className}`}>
    {title && <h3 className="text-sm font-bold text-muted uppercase tracking-widest mb-6">{title}</h3>}
    {children}
  </div>
);

const Badge = ({ children, status }) => {
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

// --- Pages ---
const CommandCenter = ({ isPaid }) => {
  const [text, setText] = useState('');
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(RELAY_WS_URL);
    ws.onopen = () => { setWsStatus('connected'); setSocket(ws); };
    ws.onclose = () => setWsStatus('disconnected');
    ws.onerror = () => setWsStatus('error');
    return () => ws.close();
  }, []);

  const broadcast = (val) => {
    setText(val);
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ source: 'hq', text: val.replace(/\n/g, '<br>') }));
    }
  };

  const insertTag = (tag, style = '') => {
    const s = document.getElementById('hq-input');
    if (!s) return;
    const start = s.selectionStart;
    const end = s.selectionEnd;
    const selected = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);
    let replacement = '';
    if (tag === 'b') replacement = `<b>${selected || 'bold text'}</b>`;
    if (tag === 'color') replacement = `<span style="color:${style}">${selected || style + ' text'}</span>`;
    broadcast(before + replacement + after);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">Command Center</h1>
        <p className="text-muted text-sm flex items-center gap-2 font-medium">
          Relay Active: <Badge status={wsStatus === 'connected' ? 'Running' : 'Stopped'}>{wsStatus}</Badge>
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card/40 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex bg-white/5 items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex gap-1.5">
                 <button onClick={() => insertTag('b')} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-black">B</button>
                 <button onClick={() => insertTag('color', '#ef4444')} className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-black">RED</button>
                 <button onClick={() => insertTag('color', '#10a37f')} className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-black">EMERALD</button>
              </div>
              <button onClick={() => { setText(''); socket?.send(JSON.stringify({source:'hq', text:''})); }} className="text-[10px] uppercase font-black text-rose-500/60 hover:text-rose-500 tracking-widest pt-1">Clear Display</button>
            </div>
            <textarea
              id="hq-input"
              value={text}
              onChange={(e) => broadcast(e.target.value)}
              placeholder="Start typing to broadcast to the invisible overlay v2.1..."
              className="w-full h-[500px] bg-transparent p-10 text-xl font-mono focus:outline-none resize-none placeholder:text-muted/20 text-white/90 selection:bg-primary/30"
            />
          </div>
        </div>

        <div className="space-y-6">
           <Card title="Streaming Metadata">
             <div className="space-y-4">
               {[
                 { label: 'Character Count', val: text.length },
                 { label: 'Encoding Mode', val: 'UTF-8 HTML' },
                 { label: 'Target Latency', val: '< 8ms' },
                 { label: 'Active Receivers', val: '1 (Portable v2)' }
               ].map(i => (
                 <div key={i.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-muted font-medium">{i.label}</span>
                    <span className="text-xs font-mono font-black text-white/60">{i.val}</span>
                 </div>
               ))}
             </div>
           </Card>

           <Card title="Network Load">
              <div className="h-32 flex items-end gap-1 px-2">
                {[20, 45, 30, 80, 50, 60, 90, 40, 70, 35, 65, 85].map((h, i) => (
                  <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} key={i} className="flex-1 bg-primary/20 hover:bg-primary rounded-t-sm transition-colors cursor-help" />
                ))}
              </div>
              <p className="text-[10px] text-center mt-4 text-muted font-medium tracking-widest uppercase">Simulated Internal Traffic</p>
           </Card>
        </div>
      </div>
    </div>
  );
};

const Infrastructure = ({ isPaid }) => {
  const [status, setStatus] = useState('Checking...');
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const resp = await fetch(`${BACKEND_URL}/status/${INSTANCE_ID}`);
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
    if (!isPaid) return alert('Purchase Required');
    setLoading(true);
    try {
      const resp = await fetch(`${BACKEND_URL}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
              <div>
                <h3 className="text-xs font-black text-muted tracking-widest uppercase mb-1">PROD-RELAY-INSTANCE-01</h3>
                <p className="text-3xl font-mono font-black tracking-tighter text-white">{EC2_IP}</p>
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

           {isPaid ? (
             <div className="flex gap-4">
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
             <Link to="/subs" className="flex items-center justify-center p-6 border-2 border-dashed border-white/5 rounded-3xl group hover:border-primary/40 transition-all">
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

const Subscriptions = ({ isPaid, setIsPaid }) => {
  const plans = [
    { name: 'Standard', price: '0', icon: <Terminal size={24} />, features: ['Single Relay Node', 'Basic Invisible Overlay', 'Community Support'] },
    { name: 'Elite', price: '29', icon: <Cloud size={24} />, features: ['Global Relay Network', 'Advanced Cloaking', 'Priority Support', 'Custom Overrides'], popular: true },
    { name: 'Corporate', price: '99', icon: <ShieldCheck size={24} />, features: ['Private EC2 Cluster', 'Team Dashboard', 'API Access', '24/7 Concierge'] }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in duration-500">
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
                onClick={() => setIsPaid(true)} 
                className={`w-full py-5 rounded-2xl font-black tracking-widest uppercase text-xs transition-all ${p.popular ? 'bg-primary text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-95' : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'}`}
             >
                {isPaid ? 'Already Subscribed' : `Select ${p.name}`}
             </button>
          </div>
        ))}
      </div>

      {isPaid && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-12 bg-white/[0.02] border border-dashed border-primary/40 rounded-[40px] text-center space-y-6">
           <h3 className="text-3xl font-black text-white">Download Vhagar Pro Client</h3>
           <p className="text-muted max-w-xl mx-auto font-medium">The ultimate undetectable assistant. Mirror ChatGPT results in a dedicated invisible layer that Zoom and Teams can't see.</p>
           <button className="bg-primary text-white px-14 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl shadow-primary/40 active:scale-95">
              Download Client v2.2.0
           </button>
           <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Latest stable build for Windows 10/11</p>
        </motion.div>
      )}
    </div>
  );
};

// --- Shell Layout ---
const App = () => {
  const [isPaid, setIsPaid] = useState(false);
  const location = useLocation();
  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'COMMANDER', path: '/' },
    { icon: <Server size={18} />, label: 'INFRASTRUCTURE', path: '/ec2' },
    { icon: <CreditCard size={18} />, label: 'BILLING', path: '/subs' }
  ];

  return (
    <div className="min-h-screen flex text-[#fafafa] bg-[#09090b]">
      {/* Sidebar Overlay for Blur */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[180px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-[340px] border-r border-white/5 p-12 flex flex-col gap-12 bg-[#09090b]/80 backdrop-blur-3xl z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40">
            <Radio className="text-white" size={24} />
          </div>
          <div>
            <span className="block text-2xl font-black tracking-tighter leading-none">VHAGAR</span>
            <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">v2 Control Hub</span>
          </div>
        </div>

        <nav className="flex flex-col gap-2 mt-12">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${
                  active ? 'bg-white/5 border border-white/10 text-white font-black shadow-2xl' : 'text-muted font-bold hover:text-white'
                }`}
              >
                {React.cloneElement(item.icon, { size: 18, className: active ? 'text-primary' : '' })}
                <span className="text-xs uppercase tracking-widest">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto space-y-6">
           <div className="p-8 bg-white/5 rounded-3xl border border-white/5 space-y-2">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#10a37f]">
                <ShieldCheck size={12} /> Cloud Secure
             </div>
             <div className="text-[10px] font-mono font-bold text-muted truncate">ID: {Math.random().toString(36).substr(2, 9)}</div>
           </div>
           
           <div className="flex items-center gap-4 px-4 opacity-40 hover:opacity-100 transition-opacity cursor-pointer grayscale hover:grayscale-0">
              <Github size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">v2.1.0 STABLE</span>
           </div>
        </div>
      </aside>

      {/* Main View */}
      <main className="flex-1 h-screen overflow-y-auto relative p-16 z-0">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<CommandCenter isPaid={isPaid} />} />
            <Route path="/ec2" element={<Infrastructure isPaid={isPaid} />} />
            <Route path="/subs" element={<Subscriptions isPaid={isPaid} setIsPaid={setIsPaid} />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
