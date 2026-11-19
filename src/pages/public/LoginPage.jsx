import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      // Redirect to dashboard or previous route
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to log in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <img
            src="/Logo.jpg"
            alt="UBAN HARKALLA Logo"
            className="w-14 h-14 object-contain rounded-2xl border border-slate-200 shadow-md group-hover:scale-105 transition-transform"
          />
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Welcome to <span className="text-emerald-600">UBAN HARKALLA</span>
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
          Sign in to access your orders, saved addresses, and shopping cart.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200/80">
          
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. musa@example.com"
                  className="w-full text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm rounded-xl pl-10 pr-10 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-lg"
                  aria-label={showPassword ? 'Mask password' : 'Unmask password'}
                  title={showPassword ? 'Mask password' : 'Unmask password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-bold text-emerald-600 hover:underline">
              Create an account
            </Link>
          </div>

          {/* Staff Portal Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Staff & Administration
            </p>
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200/90 hover:border-emerald-300 rounded-xl transition-all shadow-sm group"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>[Staff Portal]</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform ml-auto" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
