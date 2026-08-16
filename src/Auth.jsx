import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { OCR_API } from './config';

export const AuthScreen = ({ onLogin }) => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${OCR_API}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      onLogin(data.token, { adminId, name: data.name, role: 'admin' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white p-6">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold mb-1">Vhagar</h1>
          <p className="text-xs text-[#71717a]">Admin access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-rose-400 text-sm text-center">{error}</p>
          )}

          <input
            type="text"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            required
            placeholder="Admin ID"
            autoComplete="off"
            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-sm outline-none focus:border-white/30 text-white placeholder:text-[#71717a] transition-colors"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-sm outline-none focus:border-white/30 text-white placeholder:text-[#71717a] transition-colors"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-[#71717a] hover:text-white transition-colors">
            ← Back
          </Link>
        </div>

      </div>
    </div>
  );
};