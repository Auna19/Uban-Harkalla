import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, updateOrderStatus } from '../../services/dataService';
import {
  Package,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Truck,
  Filter,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const list = await getOrders();
    setOrders(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleQuickStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus, `Quick updated via orders list to ${newStatus}`, 'Super Admin');
    load();
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.order_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_phone?.includes(searchTerm);
    const matchStatus =
      filterStatus === 'all' || o.order_status?.toLowerCase() === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Order Fulfillment & Tracking</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Process incoming sales, update courier delivery states, and verify payment proof.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by code, customer, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-xl pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            'all',
            'Pending',
            'Confirmed',
            'Processing',
            'Ready for Pickup',
            'Out for Delivery',
            'Delivered',
            'Cancelled',
          ].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === st
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-800 bg-slate-950/80">
                <th className="py-3 px-4 font-semibold">Reference</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Delivery Target</th>
                <th className="py-3 px-4 font-semibold">Payment</th>
                <th className="py-3 px-4 font-semibold">Total</th>
                <th className="py-3 px-4 font-semibold">Fulfillment Status</th>
                <th className="py-3 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                    {order.order_reference}
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white">{order.customer_name}</p>
                    <p className="text-[10px] text-slate-400">{order.customer_phone}</p>
                  </td>

                  <td className="py-3.5 px-4 max-w-[160px] truncate text-slate-300">
                    <span className="capitalize font-semibold">{order.delivery_method?.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {order.delivery_city}, {order.delivery_state}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-bold uppercase text-[10px] text-slate-300 block">
                      {order.payment_method?.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${
                        order.payment_status === 'verified' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-black text-emerald-400 whitespace-nowrap">
                    ₦{order.total_amount?.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <select
                      value={order.order_status}
                      onChange={(e) => handleQuickStatusChange(order.id, e.target.value)}
                      className={`text-[11px] font-bold rounded-lg px-2 py-1 bg-slate-900 border focus:outline-none ${
                        order.order_status === 'Delivered'
                          ? 'border-emerald-600 text-emerald-400'
                          : order.order_status === 'Cancelled'
                          ? 'border-red-600 text-red-400'
                          : 'border-amber-600 text-amber-400'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Ready for Pickup">Ready for Pickup</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Link
                      to={`/admin/orders/${order.order_reference}`}
                      className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
                    >
                      Inspect <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
