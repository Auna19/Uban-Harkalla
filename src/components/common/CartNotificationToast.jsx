import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Check, X, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartNotificationToast() {
  const { cartNotification, dismissNotification, itemCount, subtotal } = useCart();

  if (!cartNotification) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 right-4 sm:top-24 sm:right-6 z-[9999] w-[calc(100vw-2rem)] sm:w-96 max-w-md animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto"
    >
      <div className="bg-white/95 backdrop-blur-md border-2 border-emerald-500/80 rounded-2xl shadow-2xl p-4 sm:p-5 ring-4 ring-emerald-500/10 relative overflow-hidden">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="font-black text-xs sm:text-sm text-slate-900 tracking-tight">
              Added to Shopping Cart!
            </span>
          </div>

          <button
            onClick={dismissNotification}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Details Row */}
        <div className="flex items-center gap-3.5 py-3">
          <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 p-1 flex items-center justify-center">
            <img
              src={cartNotification.productImage || '/Logo.jpg'}
              alt={cartNotification.productName}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
              {cartNotification.productName}
            </h4>
            {cartNotification.variationDetails && (
              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                {cartNotification.variationDetails}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-black text-emerald-600">
                ₦{cartNotification.unitPrice?.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                × {cartNotification.quantity}
              </span>
            </div>
          </div>
        </div>

        {/* Cart Subtotal Snapshot */}
        <div className="bg-slate-50 rounded-xl px-3 py-2 mb-3 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
            <span>Total in Cart ({itemCount} item{itemCount === 1 ? '' : 's'}):</span>
          </span>
          <span className="font-black text-slate-900">
            ₦{subtotal?.toLocaleString()}
          </span>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            to="/cart"
            onClick={dismissNotification}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold text-center transition-colors shadow-2xs"
          >
            View Cart
          </Link>
          <Link
            to="/checkout"
            onClick={dismissNotification}
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black text-center flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Auto-dismiss timer progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
          <div className="h-full bg-emerald-500 animate-[shrink_5s_linear_forwards] origin-left" />
        </div>

      </div>
    </div>
  );
}
