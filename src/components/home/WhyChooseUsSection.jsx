import React from 'react';
import { ShieldCheck, Tag, Truck, CreditCard, Clock, Headphones, Sparkles } from 'lucide-react';
import ScrollReveal from '../common/ScrollReveal';
import TiltCard from '../common/TiltCard';

export default function WhyChooseUsSection() {
  const features = [
    {
      icon: ShieldCheck,
      title: '100% Genuine Guaranteed',
      description: 'We do not sell refurbished clones or locked devices. Every device undergoes a strict 30-point hardware & battery health test.',
      badge: 'Certified Clean',
    },
    {
      icon: Tag,
      title: 'Direct Wholesale Pricing',
      description: 'Enjoy the most competitive retail prices in Nigeria on both brand new sealed and pristine certified pre-owned smartphones.',
      badge: 'Best Market Rates',
    },
    {
      icon: Truck,
      title: 'FREE Kano Delivery',
      description: 'Zero delivery fee for all orders within Kano metropolis, plus fast, trackable courier delivery to all Nigerian states.',
      badge: 'Same Day Dispatch',
    },
    {
      icon: Clock,
      title: '2-Hour Store Pickup',
      description: 'Prefer to inspect before taking home? Choose Physical Pickup and collect your order within 2 hours at our Kano flagship store.',
      badge: 'Walk-In Friendly',
    },
    {
      icon: CreditCard,
      title: 'Multiple Secure Payment Options',
      description: 'Pay safely via Paystack (Debit Card/USSD), direct Nigerian bank transfer with session verification, or Pay on Delivery.',
      badge: '100% Secure',
    },
    {
      icon: Headphones,
      title: 'Personalized WhatsApp Support',
      description: 'Real human assistance available to help you choose the right phone model, configuration, and durable accessories.',
      badge: 'Active Daily',
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <ScrollReveal direction="up" duration={500}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-4 py-1.5 rounded-full shadow-2xs">
              Our Value Proposition
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 mt-4 tracking-tight">
              Why Choose <span className="text-emerald-600">UBAN HARKALLA</span>?
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed font-normal">
              We hold ourselves to the highest standards of reliability, transparency, and product quality. Here is why thousands of tech lovers across Nigeria trust us.
            </p>
          </div>
        </ScrollReveal>

        {/* Feature Cards Grid with Tilt & Staggered Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <ScrollReveal
                key={idx}
                direction="up"
                delay={idx * 70}
                duration={550}
              >
                <TiltCard
                  maxTilt={6}
                  className="h-full p-8 rounded-3xl bg-slate-50/80 border border-slate-200/90 hover:border-emerald-300 hover:bg-white hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-black group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm group-hover:scale-110">
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-[10px] font-black tracking-wider uppercase bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full shadow-2xs">
                        {f.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-2.5 group-hover:text-emerald-700 transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      {f.description}
                    </p>
                  </div>
                </TiltCard>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
