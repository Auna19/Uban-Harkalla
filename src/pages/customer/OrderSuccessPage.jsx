import React, { useEffect } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Package, ArrowRight, Home, Download, Truck, ShieldCheck } from 'lucide-react';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const orderRef = searchParams.get('ref') || 'UBH-2026-00001';
  const order = location.state?.order;

  // Trigger celebration confetti
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // non-critical
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-2xl mx-auto px-4 text-center">
        
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xl space-y-6">
          
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-scale-in">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Order Confirmed & Logged
            </span>
            <h1 className="text-3xl font-black text-slate-950 mt-3 tracking-tight">
              Thank You for Your Order!
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              We have received your purchase request. Our dispatch team is preparing your package.
            </p>
          </div>

          {/* Reference Highlight Box */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Order Reference Code</p>
              <p className="text-xl font-mono font-extrabold text-emerald-400 tracking-wider">
                {orderRef}
              </p>
            </div>
            <Link
              to={`/dashboard/orders/${orderRef}`}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
            >
              Track Live Status
            </Link>
          </div>

          {/* Receipt Breakdown if available in location state */}
          {order && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-3">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                Order Summary Details
              </h4>
              <div className="flex justify-between text-slate-600">
                <span>Customer:</span>
                <strong className="text-slate-900">{order.customer_name} ({order.customer_phone})</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Arrangement:</span>
                <strong className="text-slate-900 capitalize">
                  {order.delivery_method?.replace(/_/g, ' ')} ({order.delivery_state})
                </strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Method:</span>
                <strong className="text-slate-900 uppercase">
                  {order.payment_method?.replace(/_/g, ' ')}
                </strong>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-700">₦{order.total_amount?.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={`/dashboard/orders/${orderRef}`}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>View Order Details</span>
            </Link>

            <Link
              to="/shop"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>

          <div className="text-xs text-slate-400 pt-4 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>A confirmation receipt has also been recorded in your customer dashboard.</span>
          </div>

        </div>

      </div>
    </div>
  );
}
