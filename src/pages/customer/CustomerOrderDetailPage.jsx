import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderById } from '../../services/dataService';
import {
  Package,
  Truck,
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  CreditCard,
  MapPin,
  Calendar,
} from 'lucide-react';

export default function CustomerOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const found = await getOrderById(id);
        setOrder(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-slate-900">Order Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">We could not locate this order reference.</p>
        <Link
          to="/dashboard/orders"
          className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  // Determine stage on timeline (1 to 5)
  const timelineStages = [
    { title: 'Order Placed', code: 'Pending' },
    { title: 'Payment Confirmed', code: 'Confirmed' },
    { title: 'Processing & Packed', code: 'Processing' },
    {
      title: order.delivery_method === 'physical_pickup' ? 'Ready for Store Pickup' : 'Out for Delivery',
      code: order.delivery_method === 'physical_pickup' ? 'Ready for Pickup' : 'Out for Delivery',
    },
    { title: 'Delivered / Completed', code: 'Delivered' },
  ];

  const getStageIndex = (status) => {
    if (status === 'Delivered' || status === 'Completed') return 4;
    if (status === 'Out for Delivery' || status === 'Ready for Pickup') return 3;
    if (status === 'Processing') return 2;
    if (status === 'Confirmed') return 1;
    return 0; // Pending
  };

  const currentStageIdx = getStageIndex(order.order_status);

  return (
    <div className="space-y-6">
      
      {/* Top Bar with Back Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/orders')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders List
        </button>
      </div>

      {/* Main Order Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Order Tracking
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  order.order_status === 'Delivered' || order.order_status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : order.order_status === 'Cancelled'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {order.order_status}
              </span>
            </div>
            <h1 className="text-2xl font-black font-mono text-slate-950">
              {order.order_reference}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount</span>
            <div className="text-2xl font-black text-emerald-700">
              ₦{order.total_amount?.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400 capitalize">
              Paid via {order.payment_method?.replace(/_/g, ' ')} ({order.payment_status})
            </span>
          </div>
        </div>

        {/* Visual Fulfillment Step-by-Step Tracker */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            Live Shipment Timeline
          </h3>

          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-5 left-4 right-4 h-1 bg-slate-100 -z-0 hidden md:block">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(currentStageIdx / (timelineStages.length - 1)) * 100}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
              {timelineStages.map((stage, idx) => {
                const isPassed = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <div key={idx} className="flex md:flex-col items-center md:items-center gap-3 md:gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                        isPassed
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <div className="md:text-center">
                      <p
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-emerald-700' : isPassed ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {stage.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ordered Items Breakdown */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Purchased Items</h3>

          <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {order.items?.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.product_name}</h4>
                  {item.variation_details && (
                    <p className="text-slate-500 font-medium mt-0.5">{item.variation_details}</p>
                  )}
                  <p className="text-slate-400 mt-1">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-extrabold text-slate-950 text-sm">
                    ₦{item.subtotal?.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    ₦{item.unit_price?.toLocaleString()} each
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-Column Grid: Delivery & Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          
          {/* Delivery Info */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Delivery Arrangement</span>
            </div>
            <div className="space-y-1.5 text-slate-600">
              <p><strong>Method:</strong> <span className="capitalize">{order.delivery_method?.replace(/_/g, ' ')}</span></p>
              <p><strong>State:</strong> {order.delivery_state}</p>
              <p><strong>City / Area:</strong> {order.delivery_city}</p>
              <p><strong>Address:</strong> {order.delivery_address}</p>
              {order.delivery_notes && (
                <p><strong>Notes:</strong> {order.delivery_notes}</p>
              )}
            </div>
          </div>

          {/* Payment & Contact Info */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Payment & Recipient</span>
            </div>
            <div className="space-y-1.5 text-slate-600">
              <p><strong>Customer Name:</strong> {order.customer_name}</p>
              <p><strong>Phone:</strong> {order.customer_phone}</p>
              <p><strong>Email:</strong> {order.customer_email}</p>
              <p><strong>Payment Method:</strong> <span className="uppercase">{order.payment_method?.replace(/_/g, ' ')}</span></p>
              <p><strong>Payment Status:</strong> <span className="font-bold text-emerald-700 capitalize">{order.payment_status}</span></p>
            </div>
          </div>

        </div>

        {/* Status Change History Log */}
        {order.status_history && order.status_history.length > 0 && (
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Fulfillment Audit History
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {order.status_history.map((hist, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-slate-900">{hist.status}</span>
                    <span className="text-slate-400 text-[11px] ml-2">({hist.changed_by || 'Admin'})</span>
                    {hist.notes && (
                      <p className="text-slate-500 text-[11px] mt-0.5">{hist.notes}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(hist.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
