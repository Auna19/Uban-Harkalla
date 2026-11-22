import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from '../common/ConfirmationModal';
import {
  LayoutDashboard,
  Smartphone,
  Layers,
  Package,
  Users,
  Truck,
  CreditCard,
  FileText,
  Star,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  Search,
} from 'lucide-react';

export default function AdminLayout() {
  const { profile, user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Dynamic Navigation Items with Strict Role-Based Visibility (RBAC)
  const allNavItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Products & Variations', path: '/admin/products', icon: Smartphone },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Brands', path: '/admin/brands', icon: Shield },
    { label: 'Customer Orders', path: '/admin/orders', icon: Package },
    { label: 'Customers', path: '/admin/customers', icon: Users, superAdminOnly: true },
    { label: 'Delivery Locations', path: '/admin/delivery', icon: Truck, superAdminOnly: true },
    { label: 'Payments & Banks', path: '/admin/payments', icon: CreditCard, superAdminOnly: true },
    { label: 'Website Content', path: '/admin/content', icon: FileText, superAdminOnly: true },
    { label: 'Testimonials', path: '/admin/testimonials', icon: Star },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3, superAdminOnly: true },
    { label: 'Admin Staff & Roles', path: '/admin/users', icon: Users, superAdminOnly: true },
    { label: 'General Settings', path: '/admin/settings', icon: Settings, superAdminOnly: true },
  ];

  // Store Inventory Manager only sees inventory, catalog, and order fulfillment modules
  const navItems = allNavItems.filter((item) => !item.superAdminOnly || isSuperAdmin);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/admin/login');
  };

  const roleDisplayName = isSuperAdmin ? 'Super Administrator' : 'Store Inventory Manager';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-950 border-r border-slate-800 shrink-0">
        
        {/* Brand Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800">
          <img
            src="/Logo.jpg"
            alt="UBAN HARKALLA"
            className="w-10 h-10 object-contain rounded-xl border border-slate-800"
          />
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block">
              UBAN <span className="text-emerald-400">HARKALLA</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer Admin User Info */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">{profile?.full_name || roleDisplayName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${isSuperAdmin ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate">
                {roleDisplayName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            title="Log Out"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-bold rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>

          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold rounded-xl border border-slate-800 transition-colors"
          >
            <span>Open Live Store</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
        
        {/* Top Header Bar */}
        <header className="h-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <img src="/Logo.jpg" alt="UBAN HARKALLA" className="w-8 h-8 rounded-lg object-contain border border-slate-800 shrink-0" />
              <span className="font-extrabold text-xs tracking-tight text-white">
                UBAN <span className="text-emerald-400">HARKALLA</span>
              </span>
            </div>
            <span className="text-sm font-bold text-slate-300 hidden sm:inline">
              Store Management Console
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center gap-2.5">
              <span className={`hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isSuperAdmin
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              }`}>
                {roleDisplayName}
              </span>
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                {(profile?.full_name || 'A')[0]}
              </div>
              <span className="text-xs font-semibold text-white hidden md:inline">
                {profile?.full_name?.split(' ')[0] || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex lg:hidden">
          <div className="w-72 bg-slate-950 h-full p-4 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <img src="/Logo.jpg" alt="" className="w-8 h-8 rounded-lg" />
                  <span className="font-bold text-white text-sm">UBAN HARKALLA</span>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                          isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-900'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setMobileSidebarOpen(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-400 hover:bg-slate-900 rounded-xl cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Prompt Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        icon={LogOut}
        title="Are you sure you want to logout?"
        message={`Are you sure you want to log out of your administrative session as ${roleDisplayName}? You will need to enter your email and password to access the admin portal again.`}
        confirmText="Yes, Log Out"
        cancelText="Cancel"
        confirmVariant="danger"
        itemName={profile?.email || user?.email || roleDisplayName}
      />

    </div>
  );
}
