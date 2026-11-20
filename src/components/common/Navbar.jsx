import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogOut, ShieldCheck, Search, ChevronDown, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, profile, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact Us', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-white text-[12px] py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>✨ <strong>FREE Delivery</strong> in Kano • Fast Express Nationwide Delivery</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-300">
            <span>Call / WhatsApp: <a href="tel:+2348123456789" className="text-emerald-400 hover:underline font-semibold">+234 812 345 6789</a></span>
            <span>•</span>
            <span>Mon - Sat: 9AM - 7PM</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="/Logo.jpg"
              alt="UBAN HARKALLA Logo"
              className="w-12 h-12 object-contain rounded-xl border border-slate-200 shadow-sm group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-950 font-sans">
                UBAN <span className="text-emerald-600">HARKALLA</span>
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase -mt-1">
                Phones • Gadgets • Accessories
              </span>
            </div>
          </Link>

          {/* Desktop & Tablet Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 min-w-[260px] max-w-lg mx-3 xl:mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search phones, gadgets, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-full pl-9 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute left-3 top-1/2 -translate-y-1/2 p-0 border-0 bg-transparent cursor-pointer flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-6 shrink-0">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-emerald-600 ${
                    isActive ? 'text-emerald-600 font-semibold' : 'text-slate-700'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Action Buttons & Profile & Cart */}
          <div className="flex items-center gap-3">
            
            {/* Shopping Cart Button with Live Counter Badge */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors flex items-center justify-center group"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-slate-700 group-hover:text-emerald-600 transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-scale-in">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth State */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-sm font-medium transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {(profile?.full_name || user.email || 'U')[0]}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline">
                    {profile?.full_name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-slide-down"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {profile?.full_name || user.email}
                      </p>
                      <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full">
                        {isAdmin ? 'Administrator' : 'Customer'}
                      </span>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Dashboard Overview
                    </Link>

                    <Link
                      to="/dashboard/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      My Orders & Tracking
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/60 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile & Tablet Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 xl:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg animate-slide-down">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search phones, gadgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-200"
            />
            <button
              type="submit"
              aria-label="Submit mobile search"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-0 border-0 bg-transparent cursor-pointer flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {!user && (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium border border-slate-300 rounded-xl text-slate-700"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl shadow"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
