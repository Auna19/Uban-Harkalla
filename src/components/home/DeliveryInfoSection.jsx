import React from 'react';
import { Truck, Store, MapPin, CheckCircle, Clock, ShieldCheck } from 'lucide-react';
import ScrollReveal from '../common/ScrollReveal';

export default function DeliveryInfoSection({ locations, pickupContent }) {
  const pickupAddress =
    pickupContent?.address ||
    'UBAN HARKALLA Main Flagship Store, Commercial District, Kano, Nigeria';
  const pickupHours =
    pickupContent?.workingHours ||
    'Monday - Saturday: 9:00 AM - 7:00 PM | Sunday: Closed';
  const pickupInstructions =
    pickupContent?.instructions ||
    'Please bring a valid photo ID and your Order Reference code (e.g. UBH-2026-00001) for pickup verification.';

  return (
    <section className="py-20 sm:py-28 bg-slate-50/80 border-t border-slate-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <ScrollReveal direction="up" duration={500}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-4 py-1.5 rounded-full shadow-2xs">
              Transparent Logistics
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 mt-4 tracking-tight">
              Delivery & Store Pickup Options
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed font-normal">
              We provide fast, reliable, and insured delivery across Nigeria, with complimentary same-day delivery for all customers in Kano.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Delivery Charges Table (Dynamic from backend) */}
          <div className="lg:col-span-7">
            <ScrollReveal direction="right" duration={600}>
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-lg">
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shadow-xs">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">Standard Delivery Rates</h3>
                    <p className="text-xs text-slate-500 font-medium">Live rates configured directly by UBAN HARKALLA</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] text-slate-400 uppercase tracking-wider">
                        <th className="pb-3.5 font-bold">State / Location</th>
                        <th className="pb-3.5 font-bold">Coverage</th>
                        <th className="pb-3.5 font-bold">Timeline</th>
                        <th className="pb-3.5 font-bold text-right">Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {locations.map((loc) => (
                        <tr key={loc.id} className="hover:bg-slate-50/90 transition-colors">
                          <td className="py-4 font-black text-slate-900 flex items-center gap-2">
                            {loc.state === 'Kano' ? (
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            ) : null}
                            {loc.state}
                          </td>
                          <td className="py-4 text-xs text-slate-500">{loc.city}</td>
                          <td className="py-4 text-xs font-semibold text-slate-700">{loc.estimated_days}</td>
                          <td className="py-4 text-right font-black text-sm">
                            {loc.fee === 0 ? (
                              <span className="text-emerald-700 font-black bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
                                FREE (₦0)
                              </span>
                            ) : (
                              <span className="text-slate-950">₦{loc.fee.toLocaleString()}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ordering outside these locations? Contact our support on WhatsApp for specialized dispatch.</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Physical Store Pickup Info */}
          <div className="lg:col-span-5">
            <ScrollReveal direction="left" duration={600} delay={100}>
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-7 sm:p-9 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      Zero Delivery Charge
                    </span>
                    <h3 className="font-black text-xl text-white">Physical Store Pickup</h3>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-slate-300">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Store Address</p>
                      <p className="font-semibold text-white text-xs sm:text-sm mt-0.5">{pickupAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                    <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Operating Hours</p>
                      <p className="font-semibold text-white text-xs sm:text-sm mt-0.5">{pickupHours}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 text-xs leading-relaxed text-slate-300">
                    <strong className="text-amber-400 block mb-1">Pickup Instructions:</strong>
                    {pickupInstructions}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="font-semibold">Pickup Charge:</span>
                    <span className="font-black text-emerald-400 text-sm">₦0.00 (Always Free)</span>
                  </div>
                </div>

              </div>
            </ScrollReveal>
          </div>

        </div>

      </div>
    </section>
  );
}
