import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AdminRoute({ children, requireSuperAdmin = false }) {
  const { user, profile, isAdmin, isSuperAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Not logged in or not admin -> redirect to admin login
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Super Admin privilege barrier
  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-950 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Access Restricted
            </span>
            <h2 className="text-xl font-bold text-white mt-2">Super Admin Privileges Required</h2>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              You are currently authenticated as <strong className="text-white">{profile?.full_name || 'Staff User'}</strong> (<span className="text-emerald-400 font-bold uppercase">{profile?.role || 'admin'}</span>). This management module is strictly restricted to Super Administrators.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Products & Inventory</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
