import React from 'react';
import { ShieldCheck, Tag, Truck, CreditCard, Clock, Headphones } from 'lucide-react';

export default function WhyChooseUsSection() {
  const features = [
    {
      icon: ShieldCheck,
      title: '100% Genuine Guaranteed',
      description: 'We do not sell refurbished clones or locked devices. Every device undergoes a strict 30-point hardware & battery health test.',
    },
    {
      icon: Tag,
      title: 'Direct Wholesale Pricing',
      description: 'Enjoy the most competitive retail prices in Nigeria on both brand new and pristine certified pre-owned smartphones.',
    },
    {
      icon: Truck,
      title: 'FREE Kano Delivery',
      description: 'Zero delivery fee for all orders within Kano metropolis, plus fast, insured courier delivery to other states.',
    },
    {
      icon: Clock,
      title: '2-Hour Store Pickup',
      description: 'Prefer to inspect before taking home? Choose Physical Pickup and collect your order within 2 hours at our Kano flagship store.',
    },
    {
      icon: CreditCard,
      title: 'Multiple Secure Payment Options',
      description: 'Pay safely via Paystack, direct Nigerian bank transfer, or Pay on Delivery where eligible.',
    },
    {
      icon: Headphones,
      title: 'Personalized WhatsApp Support',
      description: 'Real human support available to help you choose the right phone model, configuration, and accessories.',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Our Advantage
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">
            Why Choose <span className="text-emerald-600">UBAN HARKALLA</span>?
          </h2>
          <p className="text-base text-slate-600 mt-4 leading-relaxed">
            We hold ourselves to the highest standards of reliability, transparency, and product quality. Here is why thousands of tech lovers trust us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 group flex flex-col"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed flex-1">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
