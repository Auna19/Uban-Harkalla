import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../../services/dataService';
import {
  Package,
  Truck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  User,
  Calendar,
  Save,
} from 'lucide-react';

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Pending');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState('');

  const load = async () => {
    try {
      const found = await getOrderById(id);
      if (found) {
        setOrder(found);
        setStatus(found.order_status);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, status, notes || `Status changed to ${status}`, 'Super Admin');
      setFeedback('Order status updated successfully and customer notified!');
      setNotes('');
      load();
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 text-center text-white">
        <h3 className="text-lg font-bold">Order Not Found</h3>
        <Link to="/admin/orders" className="mt-3 inline-block text-xs font-bold text-emerald-400">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders List
        </Link>
        <span className="font-mono text-xs text-slate-500">ID: {order.id}</span>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Order Card */}
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-sm">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Customer Order Review
            </span>
            <h1 className="text-2xl font-black font-mono text-white mt-1">
              {order.order_reference}
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Bill</span>
            <p className="text-2xl font-black text-emerald-400">
              ₦{order.total_amount?.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-400 uppercase">
              {order.payment_method?.replace(/_/g, ' ')} ({order.payment_status})
            </span>
          </div>
        </div>

        {/* Update Status Form Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Update Order Status & Log Internal Note
          </h3>

          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Change Fulfillment Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-xs font-bold rounded-xl px-4 py-2.5 bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Audit Notes / Reason for Status Change
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dispatched with courier rider (Rider: Sani, 080...)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs rounded-xl px-4 py-2.5 bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{updating ? 'Updating Status...' : 'Apply Status Change'}</span>
            </button>
          </form>
        </div>

        {/* Ordered Items Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-white">Items in this Order</h3>
          <div className="rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800 text-xs">
            {order.items?.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm">{item.product_name}</h4>
                  {item.variation_details && (
                    <p className="text-slate-400 font-medium mt-0.5">{item.variation_details}</p>
                  )}
                  <p className="text-slate-500 mt-1">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <div className="font-black text-emerald-400 text-sm">
                    ₦{item.subtotal?.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    ₦{item.unit_price?.toLocaleString()} each
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid: Delivery Destination & Customer Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800 text-xs">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-400" />
              Delivery Arrangement
            </h4>
            <p><strong className="text-slate-400">Method:</strong> <span className="text-white capitalize">{order.delivery_method?.replace(/_/g, ' ')}</span></p>
            <p><strong className="text-slate-400">State:</strong> <span className="text-white">{order.delivery_state}</span></p>
            <p><strong className="text-slate-400">City / Town:</strong> <span className="text-white">{order.delivery_city}</span></p>
            <p><strong className="text-slate-400">Address:</strong> <span className="text-white">{order.delivery_address}</span></p>
            {order.delivery_notes && (
              <p><strong className="text-slate-400">Instructions:</strong> <span className="text-amber-400">{order.delivery_notes}</span></p>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-400" />
              Customer Contact Details
            </h4>
            <p><strong className="text-slate-400">Full Name:</strong> <span className="text-white font-bold">{order.customer_name}</span></p>
            <p><strong className="text-slate-400">Phone:</strong> <a href={`tel:${order.customer_phone}`} className="text-emerald-400 font-bold hover:underline">{order.customer_phone}</a></p>
            <p><strong className="text-slate-400">Email:</strong> <span className="text-white">{order.customer_email}</span></p>
            <p><strong className="text-slate-400">Payment Channel:</strong> <span className="text-white uppercase">{order.payment_method?.replace(/_/g, ' ')}</span></p>
          </div>
        </div>

        {/* Audit Log Timeline */}
        {order.status_history && order.status_history.length > 0 && (
          <div className="pt-6 border-t border-slate-800 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Internal Audit History
            </h3>
            <div className="divide-y divide-slate-800/80 text-xs">
              {order.status_history.map((hist, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-white">{hist.status}</span>
                    <span className="text-slate-400 text-[11px] ml-2">by {hist.changed_by}</span>
                    {hist.notes && (
                      <p className="text-slate-400 text-[11px] mt-0.5">{hist.notes}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 shrink-0">
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
