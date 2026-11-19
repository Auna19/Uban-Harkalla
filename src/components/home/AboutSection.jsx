import React from 'react';
import { ShieldCheck, Award, ThumbsUp, Sparkles, CheckCircle } from 'lucide-react';

export default function AboutSection({ aboutContent, missionVisionContent }) {
  const intro =
    aboutContent?.intro ||
    'UBAN HARKALLA is a premier Nigerian electronics and smartphone retail brand built on integrity, genuine authenticity, and uncompromised customer satisfaction.';

  const story =
    aboutContent?.story ||
    'We specialize in providing top-tier Apple iPhones, flagship Android devices, high-performance electronics, and essential everyday smartphone accessories. From brand new sealed devices with manufacturer warranties to pristine certified pre-owned phones thoroughly inspected by our technicians, we ensure every customer gets superior value.';

  const commitment =
    aboutContent?.commitment ||
    'Our commitment is simple: empowering our customers with dependable technology, swift delivery, transparent pricing, and respectful, personalized customer service every single time.';

  const mission =
    missionVisionContent?.mission ||
    'To provide customers with quality smartphones, gadgets, and accessories through a reliable, convenient, and customer-focused shopping experience.';

  const vision =
    missionVisionContent?.vision ||
    'To become a trusted destination for smartphones and electronic gadgets, recognised for quality products, excellent service, and customer satisfaction.';

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Who We Are
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">
            About <span className="text-emerald-600">UBAN HARKALLA</span>
          </h2>
          <p className="text-base text-slate-600 mt-4 leading-relaxed">
            {intro}
          </p>
        </div>

        {/* Story & Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              Committed to Bringing Authentic Technology to Your Hands
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              {story}
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Direct Sourcing & Verified IMEI</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Every smartphone is clean, unlocked, and rigorously tested for optimum performance.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Fair & Transparent Nigerian Pricing</h4>
                  <p className="text-xs text-slate-500 mt-0.5">No hidden charges. Clear prices for every variation (storage, color, condition).</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Customer-Centric Care</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Swift delivery in Kano and across Nigeria, backed by active after-sales support.</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border-l-4 border-emerald-500 text-sm text-slate-700 italic">
              "{commitment}"
            </div>
          </div>

          {/* Business Photos Showcase */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img
                src="/1001102629.jpg"
                alt="Smartphone Inventory"
                className="w-full h-56 object-cover rounded-2xl shadow-sm border border-slate-200"
              />
              <img
                src="/1001102635.jpg"
                alt="Gadgets and Accessories"
                className="w-full h-44 object-cover rounded-2xl shadow-sm border border-slate-200"
              />
            </div>
            <div className="space-y-4 pt-6">
              <img
                src="/1001102630.jpg"
                alt="Store Gadgets Display"
                className="w-full h-44 object-cover rounded-2xl shadow-sm border border-slate-200"
              />
              <img
                src="/1001102633.jpg"
                alt="Gadgets and Devices"
                className="w-full h-56 object-cover rounded-2xl shadow-sm border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Mission and Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
          {/* Mission Card */}
          <div className="bg-gradient-to-br from-emerald-50/60 to-white p-8 rounded-3xl border border-emerald-100/80 shadow-xs relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold mb-5 shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Our Mission</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              "{mission}"
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-8 rounded-3xl border border-slate-800 shadow-xs relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold mb-5 shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Our Vision</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              "{vision}"
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
