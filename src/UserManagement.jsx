import React, { useState, useEffect } from 'react';
import { Users, Trash2, ShieldCheck, CreditCard, RefreshCw, Search, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from './config';

const Card = ({ children, className = '', title }) => (
  <div className={`bg-card/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl transition-all hover:bg-white/5 hover:border-white/10 ${className}`}>
    {title && <h3 className="text-sm font-bold text-muted uppercase tracking-widest mb-6">{title}</h3>}
    {children}
  </div>
);

export const UserManagement = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdate = async (email, updates) => {
    setUpdating(email);
    try {
      const res = await fetch(`${API_URL}/api/admin/update-user`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetEmail: email, ...updates })
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      alert("Failed to update user");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (email) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/delete-user`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetEmail: email })
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.hardwareId && u.hardwareId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">User Management</h1>
          <p className="text-muted text-sm font-medium">Control operative access, manage subscriptions, and monitor devices.</p>
        </div>
        
        <div className="relative group w-full md:w-auto md:min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by Email or HWID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold tracking-widest outline-none focus:border-primary/50 transition-all uppercase"
          />
        </div>
      </header>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-muted uppercase tracking-[0.2em]">
                <th className="px-6 py-4">Operative</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Machine ID</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-xs font-black uppercase tracking-widest text-primary/40 animate-pulse">Syncing Database...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-xs font-black uppercase tracking-widest text-white/20">No operatives found.</td>
                </tr>
              ) : filteredUsers.map(user => (
                <motion.tr key={user.email} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white/90">{user.email}</span>
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleUpdate(user.email, { isPaid: !user.isPaid })}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border transition-all ${
                        user.isPaid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                      }`}
                    >
                      {user.isPaid ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-white/40 max-w-[120px] truncate">
                        {user.hardwareId || 'NOT LINKED'}
                      </span>
                      {user.hardwareId && (
                        <button 
                          onClick={() => handleUpdate(user.email, { resetHardware: true, isPaid: user.isPaid })}
                          className="p-1.5 bg-white/5 rounded-lg text-white/20 hover:text-white/60 transition-colors"
                          title="FUSE RESET"
                        >
                          <RefreshCw size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        disabled={user.role === 'admin'}
                        onClick={() => handleUpdate(user.email, { role: user.role === 'admin' ? 'client' : 'admin', isPaid: true })}
                        className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/20 transition-all disabled:opacity-30"
                        title="Promote to Admin"
                      >
                        <ShieldCheck size={14} />
                      </button>
                      <button 
                        disabled={user.role === 'admin'}
                        onClick={() => handleDelete(user.email)}
                        className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-all disabled:opacity-30"
                        title="Delete Operative"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Database Health">
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-white">{users.length}</span>
            <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">Live Nodes</span>
          </div>
        </Card>
        <Card title="Traffic Metrics">
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-white">{users.filter(u => u.isPaid).length}</span>
            <span className="text-[10px] font-black text-primary tracking-widest uppercase">Licensed</span>
          </div>
        </Card>
        <Card title="Device Fusion">
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-white">{users.filter(u => u.hardwareId).length}</span>
            <span className="text-[10px] font-black text-muted tracking-widest uppercase">Linked</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
