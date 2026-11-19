import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function HeroSection({ content }) {
  const headline =
    content?.headline || 'Your Trusted Destination for Premium Smartphones and Gadgets.';
  const subtext =
    content?.subtext ||
    'Discover quality smartphones, essential gadgets, and accessories at competitive prices. Shop with confidence and enjoy a convenient shopping experience with UBAN HARKALLA.';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-16 sm:py-24">
      {/* Decorative background glow circles */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top Brand Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OFFICIAL UBAN HARKALLA STORE • KANO, NIGERIA</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Your Trusted Destination for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                Premium Smartphones
              </span>{' '}
              and Gadgets.
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {subtext}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                to="/shop"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 group text-base"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#about"
                className="w-full sm:w-auto px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold rounded-2xl border border-slate-700 transition-colors flex items-center justify-center text-base"
              >
                Learn More
              </a>
            </div>

            {/* Quick Guarantees Grid */}
            <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-4 text-left">
              <div>
                <p className="text-emerald-400 font-extrabold text-lg sm:text-xl">FREE</p>
                <p className="text-xs text-slate-400 mt-0.5">Delivery in Kano</p>
              </div>
              <div>
                <p className="text-emerald-400 font-extrabold text-lg sm:text-xl">100%</p>
                <p className="text-xs text-slate-400 mt-0.5">Genuine Guarantee</p>
              </div>
              <div>
                <p className="text-emerald-400 font-extrabold text-lg sm:text-xl">2-Hour</p>
                <p className="text-xs text-slate-400 mt-0.5">Physical Pickup</p>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Product Showcase Collage */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Showcase Card */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-800/50 shadow-2xl backdrop-blur-sm group">
                <img
                  src="/1001102628.jpg"
                  alt="Premium Apple iPhones and Gadgets"
                  className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                
                {/* Floating Overlay Badge on Image */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      Flagship Selection
                    </span>
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      Apple iPhones & Androids
                    </h3>
                    <p className="text-xs text-slate-400">Brand New & Certified Pre-Owned</p>
                  </div>
                  <Link
                    to="/shop"
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors shrink-0"
                  >
                    Explore
                  </Link>
                </div>
              </div>

              {/* Floating Pill Mini Card */}
              <div className="absolute -top-6 -left-6 sm:-left-8 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 shadow-xl backdrop-blur-md flex items-center gap-3">
                <img
                  src="/Logo.jpg"
                  alt="UBAN HARKALLA Logo"
                  className="w-10 h-10 rounded-xl object-contain"
                />
                <div>
                  <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Genuine
                  </div>
                  <span className="text-[11px] text-slate-400">Direct Importer</span>
                </div>
              </div>

              {/* Floating Second Thumbnail */}
              <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-2.5 shadow-xl backdrop-blur-md flex items-center gap-3 max-w-[200px]">
                <img
                  src="/1001102636.jpg"
                  alt="Accessories"
                  className="w-11 h-11 rounded-xl object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-white">Original Tech</p>
                  <p className="text-[10px] text-emerald-400">Accessories In Stock</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
