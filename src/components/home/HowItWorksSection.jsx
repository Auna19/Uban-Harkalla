import React from 'react';
import { Search, Sliders, ShoppingBag, ArrowRightCircle, MapPin, CreditCard, CheckCircle2 } from 'lucide-react';

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
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20">
            Simple 7-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
            How Shopping Works at <span className="text-emerald-400">UBAN HARKALLA</span>
          </h2>
          <p className="text-base text-slate-300 mt-4 leading-relaxed">
            From discovering your dream device to doorstep delivery or store pickup, we make purchasing technology effortless and secure.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 transition-all flex flex-col relative ${
                  idx === 6 ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-r from-emerald-950/40 to-slate-800' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-slate-700 font-mono">
                    {s.number}
                  </span>
                </div>
                <h3 className="font-bold text-base text-white mb-1.5">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed flex-1">{s.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
