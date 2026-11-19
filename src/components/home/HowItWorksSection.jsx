import React from 'react';
import { Search, Sliders, ShoppingBag, ArrowRightCircle, MapPin, CreditCard, CheckCircle2 } from 'lucide-react';
import ScrollReveal from '../common/ScrollReveal';

export default function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Browse Available Products',
      desc: 'Explore our curated catalog of genuine Apple iPhones, Androids, and tech accessories.',
    },
    {
      number: '02',
      icon: Sliders,
      title: 'Choose Preferred Variation',
      desc: 'Select your preferred storage capacity, color, and condition (Brand New or Pristine Used).',
    },
    {
      number: '03',
      icon: ShoppingBag,
      title: 'Add to Cart',
      desc: 'Review your selection, check live stock availability, and adjust quantities.',
    },
    {
      number: '04',
      icon: ArrowRightCircle,
      title: 'Proceed to Checkout',
      desc: 'Enter your recipient details and contact information seamlessly.',
    },
    {
      number: '05',
      icon: MapPin,
      title: 'Select Delivery or Pickup',
      desc: 'Choose free delivery in Kano, affordable state shipping, or free 2-hour physical store pickup.',
    },
    {
      number: '06',
      icon: CreditCard,
      title: 'Make Secure Payment',
      desc: 'Pay online via Paystack, make a verified Nigerian bank transfer, or select Pay on Delivery.',
    },
    {
      number: '07',
      icon: CheckCircle2,
      title: 'Track Your Purchase',
      desc: 'Receive immediate order confirmation (e.g. UBH-2026-00001) and follow step-by-step dispatch updates.',
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden border-t border-slate-800">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <ScrollReveal direction="up" duration={500}>
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-4 py-1.5 rounded-full border border-emerald-500/30 shadow-sm">
              Simple 7-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 tracking-tight">
              How Shopping Works at <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">UBAN HARKALLA</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-300 mt-4 leading-relaxed font-normal">
              From discovering your dream device to doorstep delivery or store pickup, we make purchasing technology effortless, transparent, and secure.
            </p>
          </div>
        </ScrollReveal>

        {/* Steps Grid with Staggered Cascading Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isLast = idx === 6;
            return (
              <ScrollReveal
                key={idx}
                direction="up"
                delay={idx * 60}
                duration={500}
                className={isLast ? 'md:col-span-2 lg:col-span-2' : ''}
              >
                <div
                  className={`h-full p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/90 shadow-xl transition-all duration-300 flex flex-col justify-between group ${isLast ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-500/30' : ''
                    }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-3xl font-black text-slate-700/80 group-hover:text-slate-500 transition-colors font-mono">
                        {s.number}
                      </span>
                    </div>

                    <h3 className="font-black text-base sm:text-lg text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                      {s.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                    <span>Step {s.number} of 07</span>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
