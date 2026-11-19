import React, { useState, useEffect } from 'react';
import { getAnalytics, getOrders, getProducts } from '../../services/dataService';
import { BarChart3, Download, Calendar, Package, TrendingUp } from 'lucide-react';

export default function AdminReportsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [a, o, p] = await Promise.all([getAnalytics(), getOrders(), getProducts()]);
      setAnalytics(a);
      setOrders(o);
      setProducts(p);
      setLoading(false);
    }
    load();
  }, []);

  const handleExportCSV = () => {
    if (!orders.length) return;
    const headers = ['Order Reference', 'Customer Name', 'Phone', 'Email', 'Payment Method', 'Status', 'Total (NGN)', 'Created Date'];
    const rows = orders.map((o) => [
      o.order_reference,
      `"${o.customer_name}"`,
      `"${o.customer_phone}"`,
      o.customer_email,
      o.payment_method,
      o.order_status,
      o.total_amount,
      new Date(o.created_at).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `uban_harkalla_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Business Reports & Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit store sales, payment channels, and inventory trends.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow w-fit"
        >
          <Download className="w-4 h-4" />
          <span>Export Orders CSV</span>
        </button>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
          <span className="text-xs font-bold uppercase text-slate-400">Total Net Revenue</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            ₦{analytics.totalRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Verified and fulfilled purchases</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
          <span className="text-xs font-bold uppercase text-slate-400">Total Transactions</span>
          <p className="text-2xl font-black text-white mt-1">{analytics.totalOrders}</p>
          <p className="text-[11px] text-slate-500 mt-1">Lifetime customer orders</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
          <span className="text-xs font-bold uppercase text-slate-400">Average Order Value</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            ₦{analytics.totalOrders ? Math.round(analytics.totalRevenue / analytics.totalOrders).toLocaleString() : 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Across all smartphone categories</p>
        </div>
      </div>

      {/* Best-selling Stock */}
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-base text-white">Top Catalogue Inventory</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-800">
                <th className="pb-3 font-semibold">Device</th>
                <th className="pb-3 font-semibold">Brand</th>
                <th className="pb-3 font-semibold">Price</th>
                <th className="pb-3 font-semibold">Current Stock</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {products.slice(0, 6).map((p) => (
                <tr key={p.id}>
                  <td className="py-3 font-bold text-white">{p.name}</td>
                  <td className="py-3 text-slate-400">{p.brand_name}</td>
                  <td className="py-3 font-black text-emerald-400">
                    ₦{(p.discounted_price || p.base_price).toLocaleString()}
                  </td>
                  <td className="py-3 font-semibold text-slate-200">{p.stock_quantity} units</td>
                  <td className="py-3">
                    <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      In Demand
                    </span>
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
