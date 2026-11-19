import React from 'react';
import { Truck, Store, MapPin, CheckCircle, Clock } from 'lucide-react';

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
    <section className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3.5 py-1 rounded-full">
            Transparent Logistics
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">
            Delivery & Store Pickup Options
          </h2>
          <p className="text-base text-slate-600 mt-4 leading-relaxed">
            We provide fast, reliable, and insured delivery across Nigeria, with complimentary same-day delivery for all customers in Kano.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Delivery Charges Table (Dynamic from backend) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Standard Delivery Rates</h3>
                <p className="text-xs text-slate-500">Live rates configured directly by UBAN HARKALLA</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">State / Location</th>
                    <th className="pb-3 font-semibold">Coverage</th>
                    <th className="pb-3 font-semibold">Timeline</th>
                    <th className="pb-3 font-semibold text-right">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {locations.map((loc) => (
                    <tr key={loc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                        {loc.state === 'Kano' ? (
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                        ) : null}
                        {loc.state}
                      </td>
                      <td className="py-3.5 text-xs text-slate-500">{loc.city}</td>
                      <td className="py-3.5 text-xs font-medium text-slate-600">{loc.estimated_days}</td>
                      <td className="py-3.5 text-right font-extrabold text-sm">
                        {loc.fee === 0 ? (
                          <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                            FREE (₦0)
                          </span>
                        ) : (
                          <span className="text-slate-900">₦{loc.fee.toLocaleString()}</span>
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

          {/* Physical Store Pickup Info */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Zero Delivery Charge
                </span>
                <h3 className="font-bold text-lg text-white">Physical Store Pickup</h3>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Store Address</p>
                  <p className="font-medium text-white text-xs sm:text-sm mt-0.5">{pickupAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Operating Hours</p>
                  <p className="font-medium text-white text-xs sm:text-sm mt-0.5">{pickupHours}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs leading-relaxed text-slate-300">
                <strong className="text-amber-400 block mb-1">Pickup Instructions:</strong>
                {pickupInstructions}
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-800/50 p-3 rounded-xl">
                <span>Pickup Fee:</span>
                <span className="font-bold text-emerald-400 text-sm">₦0.00 (Always Free)</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
