import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  User,
  MapPin,
  ShoppingBag,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function CustomerDashboardLayout() {
  const { profile, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const menu = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'My Orders & Tracking', path: '/dashboard/orders', icon: Package },
    { label: 'Shopping Cart', path: '/dashboard/cart', icon: ShoppingBag },
    { label: 'My Profile', path: '/dashboard/profile', icon: User },
    { label: 'Delivery Addresses', path: '/dashboard/addresses', icon: MapPin },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Top Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center uppercase shadow-md">
              {(profile?.full_name || user?.email || 'U')[0]}
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Customer Account
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {profile?.full_name || 'Valued Customer'}
              </h1>
              <p className="text-xs text-slate-400">{profile?.email || user?.email}</p>
            </div>
          </div>

          {isAdmin && (
            <NavLink
              to="/admin/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors shadow"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Open Admin Dashboard</span>
            </NavLink>
          )}
        </div>

        {/* Dashboard Content Layout (Sidebar + Main View) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </NavLink>
              );
            })}

            <div className="pt-3 border-t border-slate-100 mt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>

          {/* Main Subview */}
          <main className="lg:col-span-9">
            <Outlet />
          </main>

        </div>

      </div>
    </div>
  );
}
