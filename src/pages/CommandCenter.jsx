import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RELAY_WS_URL } from '../config';
import { Badge, Card } from '../components/SharedElements';

export const CommandCenter = ({ isPaid }) => {
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
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) { 
        alert("CRITICAL: You MUST select 'Chrome Tab' and check 'Share Tab Audio'!"); 
        stream.getTracks().forEach(t => t.stop()); 
        return; 
      }
      setAudioStream(new MediaStream([audioTrack]));
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
      setIsListening(false);
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      if (dgSocketRef.current && dgSocketRef.current.readyState === WebSocket.OPEN) {
        dgSocketRef.current.close();
      }
      const finalText = `${textRef.current.session} ${textRef.current.interim}`.trim();
      if (finalText && socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'AUTO_TYPE_COMMAND', text: finalText }));
      }
      
      textRef.current = { session: '', interim: '' };
      setTimeout(() => {
        setSessionText('');
        setInterimText('');
      }, 500); 
    } else {
      setIsListening(true);
      textRef.current = { session: '', interim: '' };
      setSessionText('');
      setInterimText('');
      
      const formats = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
      const supportedFormat = formats.find(f => MediaRecorder.isTypeSupported(f)) || '';
      
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
              className="w-full h-[300px] md:h-[500px] bg-transparent p-6 md:p-10 text-xl font-mono focus:outline-none resize-none placeholder:text-muted/20 text-white/90 selection:bg-primary/30"
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
