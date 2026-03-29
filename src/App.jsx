import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquareText, Server, CreditCard, Radio, Github, Power, Activity, Terminal, Cloud, ShieldCheck, Lock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthScreen } from './Auth';

// --- Constants ---
export const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
export const RELAY_WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
// Added for Cloud Infrastructure & Deployment
export const BACKEND_URL = API_URL;
export const INSTANCE_ID = import.meta.env.VITE_INSTANCE_ID || 'i-0a276cb099b9cc65f';

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
  const [dgKey, setDgKey] = useState(localStorage.getItem('dg_key') || '');

  // Modes & Legacy State
  const [useAI, setUseAI] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);

  // Voice Push-To-Talk State
  const [audioStream, setAudioStream] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [sessionText, setSessionText] = useState('');
  const [interimText, setInterimText] = useState('');
  
  const dgSocketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const textRef = useRef({ session: '', interim: '' });

  useEffect(() => {
    const ws = new WebSocket(`${RELAY_WS_URL}/?token=${localStorage.getItem('vhagar_token')}&type=hq`);
    ws.onopen = () => { setWsStatus('connected'); setSocket(ws); };
    ws.onmessage = async (e) => {
      let rawData = e.data;
      if (rawData instanceof Blob) rawData = await rawData.text();
      try {
        const data = JSON.parse(rawData);
        if (data.source === 'google-meet') {
          setTranscriptions(prev => [data.text, ...prev].slice(0, 15));
        }
      } catch (err) {}
    };
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

  const connectAudioSource = async () => {
    try {
      if (!dgKey) { alert("Please enter your Deepgram API Key first!"); return; }
      
      // 1. Capture the Tab Audio
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const audioTrack = stream.getAudioTracks()[0];
      
      if (!audioTrack) { 
        alert("CRITICAL: You MUST select 'Chrome Tab' and check 'Share Tab Audio'!"); 
        stream.getTracks().forEach(t => t.stop()); 
        return; 
      }
      
      // Save it forever so we don't have to re-select 
      setAudioStream(new MediaStream([audioTrack]));
      
      // Stop stream if user hits "Stop Sharing" on Chrome banner
      audioTrack.onended = () => {
        setAudioStream(null);
        setIsListening(false);
      };
      
    } catch (err) {
      console.error(err);
      if (err.name !== 'NotAllowedError') alert("Error connecting: " + err.message);
    }
  };

  const toggleWalkieTalkie = () => {
    if (!audioStream) return;
    if (!dgKey) { alert("Deepgram API Key is missing!"); return; }

    if (isListening) {
      // --- STOP LISTENING & SEND ---
      setIsListening(false);
      
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      if (dgSocketRef.current && dgSocketRef.current.readyState === WebSocket.OPEN) {
        dgSocketRef.current.close();
      }
      
      // Fire it to GPT
      const finalText = `${textRef.current.session} ${textRef.current.interim}`.trim();
      if (finalText && socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'AUTO_TYPE_COMMAND', text: finalText }));
      }
      
      // Clear UI
      textRef.current = { session: '', interim: '' };
      setTimeout(() => {
        setSessionText('');
        setInterimText('');
      }, 500); // Tiny delay so user sees it empty AFTER sending
      
    } else {
      // --- START LISTENING ---
      setIsListening(true);
      textRef.current = { session: '', interim: '' };
      setSessionText('');
      setInterimText('');
      
      const formats = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
      const supportedFormat = formats.find(f => MediaRecorder.isTypeSupported(f)) || '';
      
      // Connecting with interim results
      const wsUrl = 'wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&interim_results=true&endpointing=500';
      const dgSocket = new WebSocket(wsUrl, ['token', dgKey]);
      dgSocketRef.current = dgSocket;
      
      dgSocket.onopen = () => {
        const mediaRecorder = new MediaRecorder(audioStream, { mimeType: supportedFormat });
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && dgSocket.readyState === WebSocket.OPEN) dgSocket.send(event.data);
        };
        mediaRecorder.start(250);
      };

      dgSocket.onmessage = (message) => {
        const received = JSON.parse(message.data);
        const transcript = received.channel?.alternatives[0]?.transcript;
        if (transcript) {
          if (received.is_final) {
            textRef.current.session += (textRef.current.session ? " " : "") + transcript;
            textRef.current.interim = '';
            setSessionText(textRef.current.session);
            setInterimText('');
          } else {
            textRef.current.interim = transcript;
            setInterimText(transcript);
          }
        }
      };

      dgSocket.onerror = (e) => {
        console.error("Deepgram Error", e);
        setIsListening(false);
      };
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
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-muted text-sm flex items-center gap-2 font-medium">
            Relay Active: <Badge status={wsStatus === 'connected' ? 'Running' : 'Stopped'}>{wsStatus}</Badge>
          </p>

          <div className="flex bg-black/40 border border-white/10 p-1 rounded-full text-xs font-black">
             <button onClick={() => setUseAI(false)} className={`px-4 py-1.5 rounded-full transition-all ${!useAI ? 'bg-primary text-black' : 'text-white/30 hover:text-white/70'}`}>Manual Mode</button>
             <button onClick={() => setUseAI(true)} className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${useAI ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'text-white/30 hover:text-white/70'}`}>✨ Deepgram AI</button>
          </div>

          {/* Secure Admin Uplink Copy Tool */}
          <button 
            onClick={() => {
                navigator.clipboard.writeText(localStorage.getItem('vhagar_token'));
                alert("Proxy Token Copied! Paste this into your Extension popup.");
            }}
            className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all ml-auto"
          >
            🔒 Copy Admin Token
          </button>

          <AnimatePresence>
            {useAI && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex items-center gap-2 bg-indigo-500/10 p-1 rounded-full border border-indigo-500/30 pl-4 pr-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Deepgram</span>
                <input 
                  type="password" 
                  placeholder="API Key" 
                  value={dgKey} 
                  onChange={(e) => { setDgKey(e.target.value); localStorage.setItem('dg_key', e.target.value); }}
                  className="bg-black/50 rounded-full text-[10px] px-3 py-1.5 w-32 outline-none text-white/70 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
            {!useAI ? (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <Card title="⌨️ Manual Broadcast Mode">
                    <div className="p-8 text-center bg-white/5 border border-white/5 rounded-xl space-y-4">
                       <p className="text-sm text-white/50 italic">
                         Deepgram AI Capture is currently disabled. 
                       </p>
                       <p className="text-xs text-white/40">
                         Use the large text area on the left to manually type and style messages, which are instantly broadcast to the Desktop Overlay.
                       </p>
                    </div>
                  </Card>
               </motion.div>
            ) : (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <Card title="🎤 AI Audio Mode (Deepgram)">
                    <div className="space-y-4">
                      
                      {!audioStream ? (
                        <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-xl space-y-3">
                          <p className="text-xs text-indigo-300 leading-relaxed italic">
                            Step 1: Connect your Google Meet tab's audio so Deepgram can process raw audio.
                          </p>
                          <button onClick={connectAudioSource} className="w-full p-4 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-400 uppercase font-black text-xs tracking-widest rounded-xl transition-all border border-indigo-500/30">
                            🔌 Connect Audio Tab
                          </button>
                        </div>
                      ) : (
                        <button onClick={toggleWalkieTalkie} className={`w-full p-6 text-sm font-black rounded-2xl uppercase tracking-widest transition-all ${isListening ? 'bg-rose-400 text-rose-950 animate-pulse shadow-lg shadow-rose-500/20' : 'bg-indigo-500 text-white hover:scale-105 shadow-[0_0_20px_rgba(99,102,241,0.4)]'}`}>
                          {isListening ? '🛑 Stop & Fire to GPT' : '🎙️ Tap to Listen'}
                        </button>
                      )}

                      <div className="p-5 bg-black/40 rounded-xl border border-white/5 h-64 overflow-y-auto relative outline-none focus:outline-none">
                          {!audioStream ? (
                              <p className="text-xs text-white/20 italic font-medium text-center mt-20">Awaiting audio source...</p>
                          ) : (
                            <p className="text-[14px] text-white/90 leading-relaxed font-mono">
                              {sessionText} <span className="text-indigo-400/80">{interimText}</span>
                              {!sessionText && !interimText && <span className="text-white/30 italic">Ready. Press 'Tap to Listen' when speech starts.</span>}
                            </p>
                          )}
                      </div>
                    </div>
                  </Card>
               </motion.div>
            )}

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

const Infrastructure = ({ isPaid, isAdmin }) => {
  const [status, setStatus] = useState('Checking...');
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const resp = await fetch(`${BACKEND_URL}/status/${INSTANCE_ID}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
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
    if (!isPaid) return alert('Purchase Required');
    setLoading(true);
    try {
      const resp = await fetch(`${BACKEND_URL}/action`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ action, instanceId: INSTANCE_ID })
      });
      const data = await resp.json();
      if (data.success) fetchStatus();
      else alert(data.error);
    } finally { setLoading(false); }
  };

  const handleAutoType = (textToType) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'AUTO_TYPE_COMMAND', text: textToType }));
    }
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
                <h3 className="text-xs font-black text-muted tracking-widest uppercase mb-1">VHAGAR-SECURE-RELAY-V3</h3>
                <p className="text-xl font-mono font-black tracking-tighter text-blue-400">
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

const ProductHub = ({ isPaid, isAdmin }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">Vhagar Pro <span className="text-primary">Terminal</span></h1>
        <p className="text-muted text-sm font-medium tracking-wide">Welcome to the future of undeniable, invisible assistance.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card title="The Vanguard Advantage">
            <div className="space-y-6">
              <p className="text-sm leading-relaxed text-white/70">
                Vhagar allows you to seamlessly mirror live ChatGPT or Claude outputs directly to any screen in real-time, completely invisible to screen-sharing applications like Zoom, Microsoft Teams, and Google Meet.
              </p>
              <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Terminal size={20} />
                </div>
                <div>
                  <h4 className="font-black text-white text-xs tracking-widest uppercase mb-1">Hardware Bound</h4>
                  <p className="text-[10px] text-muted-foreground uppercase leading-relaxed font-bold tracking-wider">
                    Your license is cryptographically fused to your machine's hardware ID. 100% Secure.
                  </p>
                </div>
              </div>
               <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Activity size={20} />
                </div>
                <div>
                  <h4 className="font-black text-white text-xs tracking-widest uppercase mb-1">Zero-Latency Relay</h4>
                  <p className="text-[10px] text-muted-foreground uppercase leading-relaxed font-bold tracking-wider">
                    Our C++ desktop engine runs at &lt;8ms latency, drawing natively to the GPU overlay.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-8">
            <Card title="License Status">
              {(isPaid || isAdmin) ? (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-4">
                  <div className="w-12 h-12 mx-auto bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                     <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-emerald-400 font-black uppercase tracking-widest">{isAdmin ? 'Admin Terminal Active' : 'Active License'}</h3>
                  <p className="text-xs text-emerald-500/70 font-bold uppercase tracking-widest mb-6">{isAdmin ? 'Secure Proxy Uplink Enabled.' : 'Device fusion is enabled.'}</p>
                  
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(localStorage.getItem('vhagar_token'));
                        alert("Token Copied! Paste it into the Desktop Overlay (Ctrl+Space -> Ctrl+V).");
                    }}
                    className="w-full py-3 bg-emerald-500 text-emerald-950 font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                     Copy Activation Token
                  </button>
                </div>
              ) : (
                <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center space-y-4">
                  <div className="w-12 h-12 mx-auto bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mb-4">
                     <Lock size={24} />
                  </div>
                  <h3 className="text-rose-400 font-black uppercase tracking-widest">License Disabled</h3>
                  <p className="text-xs text-rose-500/70 font-bold uppercase tracking-widest mb-6">Purchase a subscription to unlock.</p>
                  <Link to="/subs" className="inline-block px-6 py-3 bg-rose-500 text-rose-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-rose-400 transition-colors text-center w-full">
                     Open Billing Portal
                  </Link>
                </div>
              )}
            </Card>
        </motion.div>
      </div>

      <AnimatePresence>
        {isPaid && (
          <motion.div initial={{ y: 20, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} className="mt-8 p-12 bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20 rounded-[40px] text-center space-y-6 relative overflow-hidden backdrop-blur-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
             <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Download Client</h3>
             <p className="text-white/60 max-w-xl mx-auto font-bold tracking-wide leading-relaxed">The ultimate undetectable assistant. Mirror ChatGPT results in a dedicated invisible layer that Zoom and Teams can't see.</p>
             <button className="bg-white text-black px-14 py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] gap-3 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] active:scale-95 flex items-center mx-auto mt-8 group">
                Download Client v2.2.0
                <ChevronRight className="group-hover:translate-x-1" size={18} />
             </button>
             <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.3em] mt-8">Latest stable build for Windows 10/11</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Shell Layout ---
const App = () => {
  const location = useLocation();

  // AUTH STATE
  const [token, setToken] = useState(localStorage.getItem('vhagar_token') || null);
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Validate Token on Load
    const verifyToken = async () => {
      if (!token) { setIsLoadingAuth(false); return; }
      try {
        const res = await fetch(`${API_URL}/api/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        if (data.valid) { setUser(data.user); } 
        else { setToken(null); localStorage.removeItem('vhagar_token'); }
      } catch (err) {
        setToken(null);
      }
      setIsLoadingAuth(false);
    };

    verifyToken();
  }, [token]);

  const handleLogin = (jwt, userData) => {
    localStorage.setItem('vhagar_token', jwt);
    setToken(jwt);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('vhagar_token');
    setToken(null);
    setUser(null);
  };

  const handleSimulateUpgrade = () => {
    if (user) {
      setUser({ ...user, isPaid: true });
      alert("Payment Successful! License unlocked.");
    }
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center font-black uppercase tracking-widest text-xs animate-pulse">Establishing Secure Uplink...</div>;
  }

  if (!token || !user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const isAdmin = user.role === 'admin';
  const isPaid = user.isPaid === true;

  // ROUTE GATING
  const navItems = [];
  if (isAdmin) {
      navItems.push({ icon: <LayoutDashboard size={18} />, label: 'COMMANDER', path: '/' });
      navItems.push({ icon: <Server size={18} />, label: 'INFRASTRUCTURE', path: '/ec2' });
  } else {
      navItems.push({ icon: <LayoutDashboard size={18} />, label: 'PRODUCT HUB', path: '/' });
  }
  navItems.push({ icon: <CreditCard size={18} />, label: 'BILLING', path: '/subs' });


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
             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#10a37f]">
                <span className="flex items-center gap-2"><ShieldCheck size={12} /> {isAdmin ? 'Admin Root Access' : 'Client Access'}</span>
             </div>
             <div className="text-[10px] font-mono font-bold text-muted truncate">{user.email}</div>
           </div>
           
           <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity cursor-pointer grayscale hover:grayscale-0">
                  <Github size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">v2.1.0 STABLE</span>
              </div>
              <button onClick={handleLogout} className="text-[10px] text-rose-500 hover:text-rose-400 uppercase font-black tracking-widest">
                  Terminate
              </button>
           </div>
        </div>
      </aside>

      {/* Main View */}
      <main className="flex-1 h-screen overflow-y-auto relative p-16 z-0">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={isAdmin ? <CommandCenter isPaid={isPaid} /> : <ProductHub isPaid={isPaid} isAdmin={isAdmin} />} />
            {isAdmin && <Route path="/ec2" element={<Infrastructure isPaid={isPaid} isAdmin={isAdmin} />} />}
            <Route path="/subs" element={<Subscriptions isPaid={isPaid} setIsPaid={handleSimulateUpgrade} />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
