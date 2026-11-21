import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getOrders } from '../../services/dataService';
import { formatPrice, formatNumber } from '../../utils/formatters';
import {
  Package,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  User,
  Truck,
  ExternalLink,
} from 'lucide-react';

export default function CustomerOverviewPage() {
  const { profile, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserOrders() {
      try {
        const list = await getOrders({ userId: user?.id });
        setOrders(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchUserOrders();
  }, [user]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.order_status === 'Pending' || o.order_status === 'Confirmed' || o.order_status === 'Processing').length;
  const completedOrders = orders.filter((o) => o.order_status === 'Delivered' || o.order_status === 'Completed').length;
  const recentOrders = orders.slice(0, 4);

  return (
    <div className="space-y-6">
      
      {/* 3 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalOrders}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Orders</span>
            <p className="text-2xl font-black text-amber-600 mt-1">{pendingOrders}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{completedOrders}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/shop"
          className="p-5 rounded-3xl bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="font-bold text-sm">Shop Catalogue</h4>
            <p className="text-[11px] text-emerald-100">Find new phones & gadgets</p>
          </div>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/dashboard/orders"
          className="p-5 rounded-3xl bg-white border border-slate-200 text-slate-800 hover:border-emerald-500 transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="font-bold text-sm text-slate-900">Track Orders</h4>
            <p className="text-[11px] text-slate-400">View progress & status</p>
          </div>
          <Package className="w-4 h-4 text-emerald-600" />
        </Link>

        <Link
          to="/dashboard/profile"
          className="p-5 rounded-3xl bg-white border border-slate-200 text-slate-800 hover:border-emerald-500 transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="font-bold text-sm text-slate-900">Account Details</h4>
            <p className="text-[11px] text-slate-400">Edit profile & passwords</p>
          </div>
          <User className="w-4 h-4 text-emerald-600" />
        </Link>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">Recent Purchases</h3>
            <p className="text-xs text-slate-400">Your latest orders and live fulfillment state</p>
          </div>
          <Link
            to="/dashboard/orders"
            className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">You haven't made any purchases yet.</p>
            <Link
              to="/shop"
              className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-3 font-semibold">Reference</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Items</th>
                  <th className="pb-3 font-semibold">Total Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-slate-900">
                      {o.order_reference}
                    </td>
                    <td className="py-3.5 text-slate-500">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 font-medium max-w-[150px] truncate">
                      {o.items?.map((i) => i.product_name).join(', ') || '1 Item'}
                    </td>
                    <td className="py-3.5 font-extrabold text-slate-900">
                      {formatPrice(o.total_amount)}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          o.order_status === 'Delivered' || o.order_status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : o.order_status === 'Cancelled'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {o.order_status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        to={`/dashboard/orders/${o.order_reference}`}
                        className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                      >
                        Track <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
