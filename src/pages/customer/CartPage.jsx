import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getDeliveryLocations } from '../../services/dataService';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Tag, Truck, ShieldCheck } from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { formatPrice, formatNumber } from '../../utils/formatters';

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    discount,
    discountCode,
    totalAmount,
    selectedLocation,
    setSelectedLocation,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyPromoCode,
  } = useCart();

  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '', // 'item' | 'clear'
    itemId: null,
    itemName: '',
  });

  const handleOpenRemoveItem = (item) => {
    const displayName = item.name || item.product_name || 'Selected Item';
    setConfirmModal({
      isOpen: true,
      type: 'item',
      itemId: item.id,
      itemName: `${displayName}${item.variation_details ? ` (${item.variation_details})` : ''}`,
    });
  };

  const handleOpenClearCart = () => {
    setConfirmModal({
      isOpen: true,
      type: 'clear',
      itemId: null,
      itemName: '',
    });
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === 'item' && confirmModal.itemId) {
      removeFromCart(confirmModal.itemId);
    } else if (confirmModal.type === 'clear') {
      clearCart();
    }
    setConfirmModal({ isOpen: false, type: '', itemId: null, itemName: '' });
  };

  useEffect(() => {
    async function loadLocations() {
      const locs = await getDeliveryLocations();
      setLocations(locs);
      if (!selectedLocation && locs.length > 0) {
        setSelectedLocation(locs[0]); // default e.g. Kano (Free)
      }
    }
    loadLocations();
  }, [selectedLocation, setSelectedLocation]);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoMessage(res);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 shadow-sm space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-950">Your Shopping Cart is Empty</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              You haven't added any smartphones, gadgets, or accessories to your cart yet.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
              >
                <span>Start Shopping Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">Shopping Cart</h1>
            <p className="text-xs text-slate-500 mt-1">Review your items, select your delivery option, and proceed.</p>
          </div>
          <button
            onClick={handleOpenClearCart}
            className="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline"
          >
            Clear Entire Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  
                  {/* Item Image */}
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.slug || ''}`} className="font-bold text-slate-900 text-sm sm:text-base hover:text-emerald-600 line-clamp-1">
                      {item.name}
                    </Link>
                    {item.variation_details && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 font-medium">
                        {item.variation_details}
                      </p>
                    )}
                    <div className="text-xs font-bold text-slate-900 mt-1.5 sm:hidden">
                      {formatPrice(item.unit_price)} each
                    </div>
                  </div>

                  {/* Quantity Modifier */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center text-xs shadow-xs"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-900">{formatNumber(item.quantity)}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center text-xs shadow-xs"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right shrink-0 min-w-[90px]">
                    <div className="text-sm sm:text-base font-extrabold text-slate-950">
                      {formatPrice(item.subtotal)}
                    </div>
                    <div className="text-[11px] text-slate-400 hidden sm:block">
                      {formatPrice(item.unit_price)} / unit
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleOpenRemoveItem(item)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
                Order Summary
              </h3>

              {/* Delivery Destination Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  Delivery Destination
                </label>
                <select
                  value={selectedLocation?.id || ''}
                  onChange={(e) => {
                    const loc = locations.find((l) => l.id === e.target.value);
                    if (loc) setSelectedLocation(loc);
                  }}
                  className="w-full text-xs font-semibold rounded-xl px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.state} - {loc.fee === 0 ? 'FREE (₦0)' : formatPrice(loc.fee)}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedLocation?.estimated_days || 'Estimated delivery in 1-2 days'}
                </p>
              </div>

              {/* Promo Code Form */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  Promo Code
                </label>
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. UBAN10"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="flex-1 text-xs uppercase px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
                  >
                    Apply
                  </button>
                </form>
                {promoMessage && (
                  <p className={`text-[11px] mt-1.5 font-semibold ${promoMessage.success ? 'text-emerald-600' : 'text-red-500'}`}>
                    {promoMessage.message}
                  </p>
                )}
              </div>

              {/* Summary Rows */}
              <div className="space-y-2.5 text-xs pt-3 border-t border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({formatNumber(itemCount)} items)</span>
                  <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Delivery Fee</span>
                  <span className="font-bold text-slate-900">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        FREE
                      </span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount Applied</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-950 pt-3 border-t border-slate-100">
                  <span>Total Amount</span>
                  <span className="text-emerald-700">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Proceed to Checkout CTA */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Protected by Paystack & Secure SSL Encryption</span>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Confirmation Modal for Cart item removal and clearing */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: '', itemId: null, itemName: '' })}
        onConfirm={handleConfirmAction}
        title={confirmModal.type === 'clear' ? 'Clear Entire Shopping Cart?' : 'Remove Item From Cart?'}
        message={
          confirmModal.type === 'clear'
            ? 'Are you sure you want to remove all items from your cart? Your selection will be emptied.'
            : 'Are you sure you want to remove this item from your cart?'
        }
        itemName={confirmModal.itemName}
        confirmText={confirmModal.type === 'clear' ? 'Yes, Clear Cart' : 'Remove Item'}
      />
    </div>
  );
}
