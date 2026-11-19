import React from 'react';
import { Quote, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import ScrollReveal from '../common/ScrollReveal';
import TiltCard from '../common/TiltCard';

export default function CeoSection({ ceoContent }) {
  const name = ceoContent?.name || 'Executive Director & Founder';
  const title = ceoContent?.title || 'Founder & CEO, UBAN HARKALLA';
  const image = ceoContent?.image || '/About CEO Image.jpg';
  const bio =
    ceoContent?.bio ||
    'The visionary leader driving UBAN HARKALLA with an unwavering passion for bringing authentic, cutting-edge consumer technology to smartphone enthusiasts and everyday shoppers across Nigeria.';
  const message =
    ceoContent?.message ||
    'At UBAN HARKALLA, our reputation is built on trust, honesty, and premium customer service. When you invest in a phone or gadget with us, you are investing in peace of mind and long-lasting quality.';

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-y border-slate-200/80 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal direction="up" duration={600}>
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              
              {/* CEO Photograph Column with Dynamic Frame */}
              <div className="lg:col-span-5 relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-[440px] lg:min-h-full flex items-center justify-center p-8 sm:p-10">
                {/* Ambient backlight */}
                <div className="absolute inset-0 bg-radial from-emerald-500/15 via-transparent to-transparent pointer-events-none" />

                <TiltCard maxTilt={6} className="relative w-full max-w-sm mx-auto">
                  <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl group">
                    <img
                      src={image}
                      alt="CEO - UBAN HARKALLA"
                      className="w-full h-auto max-h-[460px] object-cover object-top hover:scale-106 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                    
                    {/* Photo Title Overlay */}
                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <p className="font-black text-xl leading-tight text-white">{name}</p>
                      <p className="text-xs text-emerald-400 font-extrabold mt-0.5">{title}</p>
                    </div>
                  </div>

                  {/* Badge Floating */}
                  <div className="absolute -bottom-3.5 -right-3.5 bg-emerald-600 text-white rounded-2xl p-3 shadow-xl flex items-center gap-2 text-xs font-black tracking-wide border border-emerald-400/40 animate-float">
                    <ShieldCheck className="w-4 h-4 text-emerald-100" />
                    <span>Executive Leadership</span>
                  </div>
                </TiltCard>
              </div>

              {/* CEO Story & Message Column */}
              <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-black tracking-wider uppercase mb-4 w-fit shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Leadership & Vision
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                  Meet the Leadership
                </h2>
                
                <div className="mt-2 mb-6">
                  <h3 className="text-2xl font-black text-slate-900">{name}</h3>
                  <p className="text-sm font-extrabold text-emerald-600 tracking-wide">{title}</p>
                </div>

                {/* Bio */}
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8 font-normal">
                  {bio}
                </p>

                {/* CEO Direct Quote Box */}
                <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm">
                  <Quote className="w-12 h-12 text-emerald-600/15 absolute top-5 right-5" />
                  <p className="text-slate-900 font-medium text-sm sm:text-base italic relative z-10 leading-relaxed">
                    "{message}"
                  </p>
                  <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span className="text-slate-700 flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Official Executive Message
                    </span>
                    <span className="text-emerald-700 font-black">UBAN HARKALLA</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
