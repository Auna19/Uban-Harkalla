import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getOrders } from '../../services/dataService';
import { Package, Search, ExternalLink, Clock, ShoppingBag } from 'lucide-react';

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await getOrders({ userId: user?.id });
        setOrders(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.order_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items?.some((i) => i.product_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus =
      filterStatus === 'all' || o.order_status?.toLowerCase() === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950">My Orders & Purchases</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track shipment progress and review past order receipts.</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by reference code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-xl pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No orders found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            You don't have any orders matching this criteria.
          </p>
          <Link
            to="/shop"
            className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow mt-2"
          >
            Explore Catalogue
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3 font-semibold">Reference</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Items & Variations</th>
                <th className="pb-3 font-semibold">Delivery Option</th>
                <th className="pb-3 font-semibold">Total Amount</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 font-mono font-bold text-slate-900">
                    {order.order_reference}
                  </td>
                  <td className="py-4 text-slate-500 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 font-medium max-w-xs">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="truncate">
                        <span className="font-bold text-slate-900">{item.product_name}</span>
                        {item.variation_details && (
                          <span className="text-[10px] text-slate-400 block truncate">
                            {item.variation_details}
                          </span>
                        )}
                      </div>
                    )) || '1 Item'}
                  </td>
                  <td className="py-4 text-slate-600 capitalize">
                    {order.delivery_method?.replace(/_/g, ' ')} ({order.delivery_state || 'Standard'})
                  </td>
                  <td className="py-4 font-extrabold text-slate-950">
                    ₦{order.total_amount?.toLocaleString()}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        order.order_status === 'Delivered' || order.order_status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : order.order_status === 'Cancelled'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {order.order_status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <Link
                      to={`/dashboard/orders/${order.order_reference}`}
                      className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      Track Order <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
