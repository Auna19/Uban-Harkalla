import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    try {
      await adminLogin({ email, password });
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Administrative login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@ubanharkalla.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <img
            src="/Logo.jpg"
            alt="UBAN HARKALLA Logo"
            className="w-16 h-16 object-contain rounded-2xl border border-slate-800 shadow-2xl mx-auto"
          />
        </Link>
        <div className="mt-4 flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" />
          <span>Staff & Executive Portal</span>
        </div>
        <h2 className="mt-1 text-2xl font-black text-white tracking-tight">
          UBAN HARKALLA Administration
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter administrative credentials to access store controls.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800">
          
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800 flex items-start gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@ubanharkalla.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm rounded-xl pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm rounded-xl pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Authenticating Admin...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Access Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Instant Admin Demo Login Fill */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-semibold text-emerald-400 hover:underline"
            >
              Auto-fill Pre-configured Admin Credentials
            </button>
          </div>

          <div className="mt-4 text-center text-xs text-slate-500">
            <Link to="/" className="hover:text-slate-400">
              ← Return to Public Storefront
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
