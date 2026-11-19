import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAnalytics, getOrders, getProducts } from '../../services/dataService';
import {
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Smartphone,
  ArrowRight,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Real-time Analytics
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
          Store Operations Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Live financial overview, inventory levels, and customer orders.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              ₦{analytics.totalRevenue.toLocaleString()}
            </p>
            <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Realized Revenue
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <p className="text-2xl font-black text-white mt-1">{analytics.totalOrders}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">All recorded sales</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Orders</span>
            <p className="text-2xl font-black text-amber-400 mt-1">{analytics.pendingOrders}</p>
            <span className="text-[11px] text-amber-400 font-semibold mt-1 block">Awaiting Dispatch</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</span>
            <p className="text-2xl font-black text-red-400 mt-1">{analytics.lowStockCount}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">≤ 5 units remaining</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Charts Section: Monthly Sales & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Monthly Sales Revenue Chart */}
        <div className="lg:col-span-8 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Monthly Sales Volume</h3>
              <p className="text-xs text-slate-400">Past 6 months revenue performance (in Naira)</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full">
              Growth +24%
            </span>
          </div>

          <div className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.salesByMonth}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₦${v / 1000000}M`} />
                <Tooltip
                  formatter={(value) => [`₦${value.toLocaleString()}`, 'Sales']}
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="sales" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut */}
        <div className="lg:col-span-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-white">Category Distribution</h3>
            <p className="text-xs text-slate-400">Share of sales by product category</p>
          </div>

          <div className="h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.categoryDistribution}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {analytics.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Share']}
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            {analytics.categoryDistribution.map((cat, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span className="text-slate-400 truncate">{cat.name} ({cat.value}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-white">Recent Customer Orders</h3>
            <p className="text-xs text-slate-400">Latest transactions requiring fulfillment</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Manage All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-800">
                <th className="pb-3 font-semibold">Reference</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Items</th>
                <th className="pb-3 font-semibold">Payment</th>
                <th className="pb-3 font-semibold">Total Amount</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {analytics.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3.5 font-mono font-bold text-white">
                    {order.order_reference}
                  </td>
                  <td className="py-3.5">
                    <p className="font-bold text-white">{order.customer_name}</p>
                    <p className="text-[10px] text-slate-400">{order.customer_phone}</p>
                  </td>
                  <td className="py-3.5 max-w-[160px] truncate text-slate-400">
                    {order.items?.map((i) => i.product_name).join(', ') || '1 Item'}
                  </td>
                  <td className="py-3.5 uppercase text-[11px] text-slate-400">
                    {order.payment_method?.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3.5 font-extrabold text-emerald-400">
                    ₦{order.total_amount?.toLocaleString()}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.order_status === 'Delivered'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : order.order_status === 'Cancelled'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {order.order_status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      to={`/admin/orders/${order.order_reference}`}
                      className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center gap-1"
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
