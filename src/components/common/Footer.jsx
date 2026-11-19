import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, ShieldCheck, Truck, Clock, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-900">
      {/* Top Highlights Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Free Delivery in Kano</h4>
              <p className="text-xs text-slate-400 mt-0.5">Prompt same-day delivery across Kano metropolis.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">100% Genuine Devices</h4>
              <p className="text-xs text-slate-400 mt-0.5">Authentic iPhones, Androids, and verified gadgets.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Dedicated WhatsApp Support</h4>
              <p className="text-xs text-slate-400 mt-0.5">Direct chat assistance from our expert team.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Store Physical Pickup</h4>
              <p className="text-xs text-slate-400 mt-0.5">Walk in, inspect your device, and pick up in 2 hours.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/Logo.jpg"
                alt="UBAN HARKALLA Logo"
                className="w-12 h-12 object-contain rounded-xl border border-slate-800 shadow"
              />
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white">
                  UBAN <span className="text-emerald-500">HARKALLA</span>
                </span>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                  Phones • Gadgets • Accessories
                </p>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Your premier retail destination for authentic Apple iPhones, flagship Android smartphones, essential electronics, and durable accessories at competitive prices in Nigeria.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://wa.me/2348123456789"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition-colors border border-emerald-500/30"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Chat on WhatsApp
              </a>
              <Link
                to="/admin/login"
                className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
              >
                Staff Portal
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-emerald-400 transition-colors">Shop Catalog</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact & Locations</Link></li>
              <li><Link to="/dashboard/orders" className="hover:text-emerald-400 transition-colors">Track Your Order</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Product Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/shop?category=iphones" className="hover:text-emerald-400 transition-colors">Apple iPhones</Link></li>
              <li><Link to="/shop?category=android-phones" className="hover:text-emerald-400 transition-colors">Android Smartphones</Link></li>
              <li><Link to="/shop?category=gadgets" className="hover:text-emerald-400 transition-colors">Audio & Smartwatches</Link></li>
              <li><Link to="/shop?category=accessories" className="hover:text-emerald-400 transition-colors">Chargers & Accessories</Link></li>
              <li><Link to="/shop?filter=featured" className="hover:text-emerald-400 transition-colors">Featured Deals</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">Commercial District, Kano State, Nigeria</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:+2348123456789" className="hover:text-emerald-400 transition-colors">
                  +234 812 345 6789
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:contact@ubanharkalla.com" className="hover:text-emerald-400 transition-colors truncate">
                  contact@ubanharkalla.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-10 mt-10 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} UBAN HARKALLA. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms & Conditions</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Return & Warranty Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
