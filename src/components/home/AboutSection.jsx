import React from 'react';
import { ShieldCheck, Award, ThumbsUp, Sparkles, CheckCircle, Smartphone } from 'lucide-react';
import ScrollReveal from '../common/ScrollReveal';
import TiltCard from '../common/TiltCard';

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
    <section id="about" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Decorative ambient blurred circles */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <ScrollReveal direction="up" duration={500}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-4 py-1.5 rounded-full shadow-2xs">
              Who We Are
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 mt-4 tracking-tight">
              About <span className="text-emerald-600">UBAN HARKALLA</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed font-normal">
              {intro}
            </p>
          </div>
        </ScrollReveal>

        {/* Story & Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16 sm:mb-20">
          <ScrollReveal direction="right" duration={600}>
            <div className="space-y-6">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Committed to Bringing Authentic Technology to Your Hands
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-normal">
                {story}
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">Direct Sourcing & Verified IMEI</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Every smartphone is clean, unlocked, and rigorously tested for optimum hardware & battery health.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">Fair & Transparent Nigerian Pricing</h4>
                    <p className="text-xs text-slate-500 mt-0.5">No hidden charges. Clear, competitive retail pricing for every capacity, color, and condition.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">Customer-Centric Care & Warranty</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Prompt delivery across Kano and nationwide, backed by verified warranty and WhatsApp assistance.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 to-white rounded-2xl border-l-4 border-emerald-500 text-sm font-medium text-slate-800 italic shadow-2xs">
                "{commitment}"
              </div>
            </div>
          </ScrollReveal>

          {/* Business Photos Showcase with 3D Tilt */}
          <ScrollReveal direction="left" duration={600} delay={100}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <TiltCard maxTilt={6} className="rounded-3xl overflow-hidden shadow-md border border-slate-200">
                  <img
                    src="/1001102629.jpg"
                    alt="Smartphone Inventory"
                    className="w-full h-56 object-cover hover:scale-106 transition-transform duration-500"
                    loading="lazy"
                  />
                </TiltCard>
                <TiltCard maxTilt={6} className="rounded-3xl overflow-hidden shadow-md border border-slate-200">
                  <img
                    src="/1001102635.jpg"
                    alt="Gadgets and Accessories"
                    className="w-full h-44 object-cover hover:scale-106 transition-transform duration-500"
                    loading="lazy"
                  />
                </TiltCard>
              </div>
              <div className="space-y-4 pt-6">
                <TiltCard maxTilt={6} className="rounded-3xl overflow-hidden shadow-md border border-slate-200">
                  <img
                    src="/1001102630.jpg"
                    alt="Store Gadgets Display"
                    className="w-full h-44 object-cover hover:scale-106 transition-transform duration-500"
                    loading="lazy"
                  />
                </TiltCard>
                <TiltCard maxTilt={6} className="rounded-3xl overflow-hidden shadow-md border border-slate-200">
                  <img
                    src="/1001102633.jpg"
                    alt="Gadgets and Devices"
                    className="w-full h-56 object-cover hover:scale-106 transition-transform duration-500"
                    loading="lazy"
                  />
                </TiltCard>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Mission and Vision Cards with Staggered Transition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-100">
          {/* Mission Card */}
          <ScrollReveal direction="up" delay={50} duration={600}>
            <div className="h-full bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 p-8 sm:p-10 rounded-3xl border border-emerald-200/80 shadow-md relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black mb-6 shadow-md shadow-emerald-600/25 group-hover:scale-110 transition-transform">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-950 mb-3 tracking-tight">Our Mission</h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                "{mission}"
              </p>
            </div>
          </ScrollReveal>

          {/* Vision Card */}
          <ScrollReveal direction="up" delay={150} duration={600}>
            <div className="h-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black mb-6 shadow-md shadow-amber-500/25 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Our Vision</h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                "{vision}"
              </p>
            </div>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
}
