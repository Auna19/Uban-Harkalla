import React from 'react';
import { Quote, Sparkles, ShieldCheck } from 'lucide-react';

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
    <section className="py-20 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* CEO Photograph Column */}
            <div className="lg:col-span-5 relative bg-slate-900 min-h-[400px] lg:min-h-full flex items-center justify-center p-6 sm:p-8">
              <div className="relative w-full max-w-sm mx-auto">
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl">
                  <img
                    src={image}
                    alt="CEO - UBAN HARKALLA"
                    className="w-full h-auto max-h-[460px] object-cover object-top hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  
                  {/* Photo Title Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="font-bold text-lg leading-tight">{name}</p>
                    <p className="text-xs text-emerald-400 font-semibold">{title}</p>
                  </div>
                </div>

                {/* Badge Floating */}
                <div className="absolute -bottom-3 -right-3 bg-emerald-600 text-white rounded-xl p-2.5 shadow-lg flex items-center gap-1.5 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Executive Leadership</span>
                </div>
              </div>
            </div>

            {/* CEO Story & Message Column */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold tracking-wider uppercase mb-4 w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                Leadership & Vision
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Meet the Leadership
              </h2>
              
              <div className="mt-2 mb-6">
                <h3 className="text-xl font-bold text-slate-800">{name}</h3>
                <p className="text-sm font-semibold text-emerald-600">{title}</p>
              </div>

              {/* Bio */}
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
                {bio}
              </p>

              {/* CEO Direct Quote Box */}
              <div className="relative p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200/80">
                <Quote className="w-10 h-10 text-emerald-500/20 absolute top-4 right-4" />
                <p className="text-slate-800 font-medium text-sm sm:text-base italic relative z-10 leading-relaxed">
                  "{message}"
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Official Executive Message</span>
                  <span className="text-emerald-600 font-semibold">UBAN HARKALLA</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
