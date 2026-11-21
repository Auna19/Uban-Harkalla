import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import {
  getDeliveryLocations,
  getBusinessSettings,
  createOrderAtomic,
} from '../../services/dataService';
import { formatPrice, formatNumber } from '../../utils/formatters';
import {
  ShieldCheck,
  Truck,
  Store,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
} from 'lucide-react';

export default function CheckoutPage() {
  const { items, subtotal, deliveryFee, discount, totalAmount, clearCart, setSelectedLocation } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Customer Contact Fields
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || user?.email || '');
  const [phone, setPhone] = useState(profile?.phone_number || '');

  // Delivery Method: 'home_delivery' or 'physical_pickup'
  const [deliveryMethod, setDeliveryMethod] = useState('home_delivery');
  const [selectedState, setSelectedState] = useState('Kano');
  const [city, setCity] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Payment Method: 'pay_on_delivery' | 'bank_transfer' | 'paystack'
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [bankTransferSessionId, setBankTransferSessionId] = useState('');

  useEffect(() => {
    async function loadConfig() {
      const [locs, s] = await Promise.all([getDeliveryLocations(), getBusinessSettings()]);
      setLocations(locs);
      setSettings(s);

      // Pre-select Kano location in cart
      const kanoLoc = locs.find((l) => l.state === 'Kano') || locs[0];
      if (kanoLoc) setSelectedLocation(kanoLoc);
    }
    loadConfig();
  }, [setSelectedLocation]);

  // Sync state delivery fee when customer switches delivery state or method
  useEffect(() => {
    if (deliveryMethod === 'physical_pickup') {
      const pickupLoc = locations.find((l) => l.state === 'Physical Pickup') || { fee: 0 };
      setSelectedLocation(pickupLoc);
    } else {
      const match = locations.find((l) => l.state.toLowerCase() === selectedState.toLowerCase());
      if (match) {
        setSelectedLocation(match);
      }
    }
  }, [deliveryMethod, selectedState, locations, setSelectedLocation]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">Please add products before checking out.</p>
          <Link to="/shop" className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl">
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    // Form validations
    if (!fullName.trim()) return setError('Please enter your full name.');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setError('Please enter a valid email address.');
    if (!phone.trim() || phone.trim().length < 10) return setError('Please enter a valid phone number.');

    if (deliveryMethod === 'home_delivery') {
      if (!streetAddress.trim()) return setError('Please enter your delivery street address.');
      if (!city.trim()) return setError('Please enter your delivery city / area.');

      // Validate delivery fee against backend configuration
      const locMatch = locations.find((l) => l.state.toLowerCase() === selectedState.toLowerCase());
      if (!locMatch) {
        return setError(
          `Delivery is not currently automated for "${selectedState}". Please contact support via WhatsApp to arrange specialized delivery.`
        );
      }
    }

    if (paymentMethod === 'bank_transfer' && !bankTransferSessionId.trim()) {
      return setError('Please enter your transfer reference or session ID for payment verification.');
    }

    setLoading(true);

    try {
      const orderPayload = {
        user_id: user?.id || null,
        customer_name: fullName.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        subtotal,
        delivery_fee: deliveryMethod === 'physical_pickup' ? 0 : deliveryFee,
        discount,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'paystack' ? 'verified' : 'pending',
        delivery_method: deliveryMethod,
        delivery_state: deliveryMethod === 'physical_pickup' ? 'Kano (Pickup)' : selectedState,
        delivery_city: deliveryMethod === 'physical_pickup' ? 'Flagship Store' : city,
        delivery_address: deliveryMethod === 'physical_pickup' ? 'UBAN HARKALLA Main Flagship Store' : streetAddress,
        delivery_notes: deliveryNotes,
        items: items.map((i) => ({
          product_id: i.product_id,
          variation_id: i.variation_id,
          product_name: i.name,
          variation_details: i.variation_details,
          unit_price: i.unit_price,
          quantity: i.quantity,
        })),
      };

      const placedOrder = await createOrderAtomic(orderPayload);
      clearCart();
      navigate(`/checkout/success?ref=${placedOrder.order_reference}`, { state: { order: placedOrder } });
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.message || 'An error occurred while creating your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">Checkout</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete your recipient details, select your preferred delivery or pickup method, and choose payment.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs sm:text-sm text-red-600">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 2/3: Customer, Delivery, and Payment Details */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Section 1: Customer Information */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
                  1. Customer Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Musa Abdullahi"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Phone Number (Active for Delivery Calls) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 08012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Address (For Confirmation & Tracking Receipt) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. aliyu@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Section 2: Delivery or Physical Pickup */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
                  2. Delivery or Store Pickup
                </h2>

                {/* Method Switcher Tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('home_delivery')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      deliveryMethod === 'home_delivery'
                        ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Doorstep Delivery</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Free in Kano; standard courier nationwide.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('physical_pickup')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      deliveryMethod === 'physical_pickup'
                        ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Physical Store Pickup (FREE)</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Collect in 2 hours at our Kano store.</p>
                    </div>
                  </button>
                </div>

                {/* Conditional Fields based on Delivery Method */}
                {deliveryMethod === 'home_delivery' ? (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Delivery State *
                        </label>
                        <select
                          value={selectedState}
                          onChange={(e) => setSelectedState(e.target.value)}
                          className="w-full text-sm rounded-xl px-4 py-2.5 border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900"
                        >
                          <option value="Kano">Kano (FREE Delivery - ₦0)</option>
                          <option value="Niger">Niger (₦3,000 Delivery Fee)</option>
                          <option value="Abuja (FCT)">Abuja (FCT) (₦2,500 Delivery Fee)</option>
                          <option value="Katsina">Katsina (₦1,500 Delivery Fee)</option>
                          <option value="Kaduna">Kaduna (₦2,000 Delivery Fee)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          City / Town / Area *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Nassarawa GRA, Bompai, Maitama"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Street Address & Landmark *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. No. 15 Zoo Road, Opposite Total Filling Station"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="w-full text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Delivery Instructions (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Call my security man at gate if phone is busy"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        className="w-full text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-amber-900 space-y-2">
                    <p className="font-bold flex items-center gap-1.5 text-amber-800">
                      <Store className="w-4 h-4" />
                      Pickup Location Details:
                    </p>
                    <p><strong>Address:</strong> UBAN HARKALLA Main Flagship Store, Commercial District, Kano State, Nigeria.</p>
                    <p><strong>Operating Hours:</strong> Monday – Saturday: 9:00 AM – 7:00 PM</p>
                    <p className="text-xs text-amber-700 pt-1">
                      * Bring your Order Reference code and valid ID for inspection and collection upon arrival.
                    </p>
                  </div>
                )}
              </div>

              {/* Section 3: Payment Method */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
                  3. Payment Method
                </h2>

                <div className="space-y-3">
                  
                  {/* Paystack Online Payment */}
                  <label
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      paymentMethod === 'paystack'
                        ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'paystack'}
                      onChange={() => setPaymentMethod('paystack')}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">
                          Pay Online via Paystack (Debit Card / USSD / Bank Transfer)
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          Instant Confirmation
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Secure instant payment gateway powered by Paystack. Supports MasterCard, Visa, Verve, and Bank USSD.
                      </p>
                    </div>
                  </label>

                  {/* Direct Nigerian Bank Transfer */}
                  <label
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-sm text-slate-900">
                        Direct Bank Transfer
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        Transfer directly to our official business account and provide your transfer session ID.
                      </p>

                      {paymentMethod === 'bank_transfer' && (
                        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                          <p><strong>Bank:</strong> Jaiz Bank / Zenith Bank</p>
                          <p><strong>Account Name:</strong> UBAN HARKALLA ELECTRONICS VENTURES</p>
                          <p><strong>Account Number:</strong> <span className="font-mono font-bold text-slate-900">1029384756</span></p>
                          <div className="pt-2">
                            <label className="block text-[11px] font-bold text-slate-800 uppercase mb-1">
                              Enter Transfer Session ID / Transaction Reference *
                            </label>
                            <input
                              type="text"
                              required={paymentMethod === 'bank_transfer'}
                              placeholder="e.g. 100004928472910"
                              value={bankTransferSessionId}
                              onChange={(e) => setBankTransferSessionId(e.target.value)}
                              className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Pay on Delivery */}
                  {settings?.payOnDeliveryEnabled !== false && (
                    <label
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        paymentMethod === 'pay_on_delivery'
                          ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'pay_on_delivery'}
                        onChange={() => setPaymentMethod('pay_on_delivery')}
                        className="mt-1 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-sm text-slate-900">
                          Pay on Delivery (Cash or POS upon arrival)
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          Available for verified addresses within Kano and selected delivery routes.
                        </p>
                      </div>
                    </label>
                  )}

                </div>
              </div>

            </div>

            {/* Right 1/3: Sticky Order Summary & Submit Button */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5 sticky top-28">
                <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
                  Review & Confirm Order
                </h3>

                {/* Items Mini List */}
                <div className="space-y-3 max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1">
                  {items.map((i) => (
                    <div key={i.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div className="max-w-[180px]">
                        <p className="font-bold text-slate-900 truncate">{i.name}</p>
                        <p className="text-[10px] text-slate-400">Qty: {formatNumber(i.quantity)} × {formatPrice(i.unit_price)}</p>
                      </div>
                      <span className="font-bold text-slate-900">
                        {formatPrice(i.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Fee ({deliveryMethod === 'physical_pickup' ? 'Store Pickup' : selectedState})</span>
                    <span className="font-bold text-slate-900">
                      {deliveryMethod === 'physical_pickup' || deliveryFee === 0 ? (
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">FREE (₦0)</span>
                      ) : (
                        formatPrice(deliveryFee)
                      )}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-slate-950 pt-3 border-t border-slate-100">
                    <span>Total Payable</span>
                    <span className="text-emerald-700">{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Confirm & Place Order</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center leading-tight">
                  By placing your order, you agree to UBAN HARKALLA's standard terms of purchase and warranty.
                </p>

              </div>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}
