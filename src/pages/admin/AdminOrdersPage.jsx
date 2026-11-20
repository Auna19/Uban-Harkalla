import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  X,
  XCircle,
  Store,
  RotateCcw,
  Calendar,
  Phone,
  MapPin,
  CreditCard,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const tabsContainerRef = useRef(null);

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

  // Real-time status counts
  const statusCounts = useMemo(() => {
    const counts = {
      all: orders.length,
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      'Ready for Pickup': 0,
      'Out for Delivery': 0,
      Delivered: 0,
      Cancelled: 0,
    };
    orders.forEach((o) => {
      const st = o.order_status;
      if (counts[st] !== undefined) {
        counts[st] += 1;
      }
    });
    return counts;
  }, [orders]);

  // Overall KPIs
  const metrics = useMemo(() => {
    const total = orders.length;
    const pending = (statusCounts.Pending || 0) + (statusCounts.Processing || 0);
    const inTransit = statusCounts['Out for Delivery'] || 0;
    const revenue = orders.reduce((sum, o) => {
      if (o.order_status !== 'Cancelled') {
        return sum + Number(o.total_amount || 0);
      }
      return sum;
    }, 0);
    return { total, pending, inTransit, revenue };
  }, [orders, statusCounts]);

  // Filter tabs definition with dynamic status counts & icons
  const filterTabs = [
    {
      key: 'all',
      label: 'All Orders',
      icon: Package,
      count: statusCounts.all,
      badgeColor: 'bg-slate-800 text-slate-300',
      activeBg: 'bg-emerald-600 text-white shadow-emerald-900/30',
    },
    {
      key: 'Pending',
      label: 'Pending',
      icon: Clock,
      count: statusCounts.Pending || 0,
      badgeColor: (statusCounts.Pending || 0) > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' : 'bg-slate-800 text-slate-400',
      activeBg: 'bg-amber-600 text-white shadow-amber-900/30',
    },
    {
      key: 'Confirmed',
      label: 'Confirmed',
      icon: CheckCircle2,
      count: statusCounts.Confirmed || 0,
      badgeColor: (statusCounts.Confirmed || 0) > 0 ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-slate-800 text-slate-400',
      activeBg: 'bg-sky-600 text-white shadow-sky-900/30',
    },
    {
      key: 'Processing',
      label: 'Processing',
      icon: Package,
      count: statusCounts.Processing || 0,
      badgeColor: (statusCounts.Processing || 0) > 0 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400',
      activeBg: 'bg-indigo-600 text-white shadow-indigo-900/30',
    },
    {
      key: 'Out for Delivery',
      label: 'In Transit',
      icon: Truck,
      count: statusCounts['Out for Delivery'] || 0,
      badgeColor: (statusCounts['Out for Delivery'] || 0) > 0 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-800 text-slate-400',
      activeBg: 'bg-blue-600 text-white shadow-blue-900/30',
    },
    {
      key: 'Ready for Pickup',
      label: 'Pickup Desk',
      icon: Store,
      count: statusCounts['Ready for Pickup'] || 0,
      badgeColor: (statusCounts['Ready for Pickup'] || 0) > 0 ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-slate-800 text-slate-400',
      activeBg: 'bg-teal-600 text-white shadow-teal-900/30',
    },
    {
      key: 'Delivered',
      label: 'Delivered',
      icon: CheckCircle2,
      count: statusCounts.Delivered || 0,
      badgeColor: (statusCounts.Delivered || 0) > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400',
      activeBg: 'bg-emerald-600 text-white shadow-emerald-900/30',
    },
    {
      key: 'Cancelled',
      label: 'Cancelled',
      icon: XCircle,
      count: statusCounts.Cancelled || 0,
      badgeColor: (statusCounts.Cancelled || 0) > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-400',
      activeBg: 'bg-rose-600 text-white shadow-rose-900/30',
    },
  ];

  // Filter and sort logic
  const filtered = useMemo(() => {
    let result = orders.filter((o) => {
      // 1. Search filter
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        o.order_reference?.toLowerCase().includes(term) ||
        o.customer_name?.toLowerCase().includes(term) ||
        o.customer_phone?.includes(term) ||
        o.customer_email?.toLowerCase().includes(term) ||
        o.delivery_city?.toLowerCase().includes(term) ||
        o.delivery_state?.toLowerCase().includes(term);

      // 2. Status filter
      const matchStatus =
        filterStatus === 'all' || o.order_status?.toLowerCase() === filterStatus.toLowerCase();

      // 3. Payment filter
      const matchPayment =
        paymentFilter === 'all' ||
        (paymentFilter === 'verified' && (o.payment_status === 'verified' || o.payment_status === 'Paid')) ||
        (paymentFilter === 'pending' && (o.payment_status === 'pending' || o.payment_status === 'Pending')) ||
        (paymentFilter === 'failed' && (o.payment_status === 'failed' || o.payment_status === 'Failed'));

      // 4. Delivery method filter
      const matchDelivery =
        deliveryFilter === 'all' || o.delivery_method === deliveryFilter;

      return matchSearch && matchStatus && matchPayment && matchDelivery;
    });

    // Sort result
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sortBy === 'highest_amount') {
        return (b.total_amount || 0) - (a.total_amount || 0);
      }
      if (sortBy === 'lowest_amount') {
        return (a.total_amount || 0) - (b.total_amount || 0);
      }
      return 0;
    });

    return result;
  }, [orders, searchTerm, filterStatus, paymentFilter, deliveryFilter, sortBy]);

  const hasActiveFilters =
    filterStatus !== 'all' ||
    paymentFilter !== 'all' ||
    deliveryFilter !== 'all' ||
    searchTerm.trim() !== '' ||
    sortBy !== 'newest';

  const resetFilters = () => {
    setFilterStatus('all');
    setPaymentFilter('all');
    setDeliveryFilter('all');
    setSearchTerm('');
    setSortBy('newest');
  };

  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      const offset = direction === 'left' ? -200 : 200;
      tabsContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* 1. Header & Live Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Customer Orders & Fulfillment
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track customer orders, update dispatch states, verify payments, and manage fulfillment.
          </p>
        </div>

        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold w-fit transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* 2. Top Metric KPI Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-300">
            <Package className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
            <span className="text-lg font-black text-white">{metrics.total}</span>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Needs Action</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-amber-400">{metrics.pending}</span>
              {metrics.pending > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-300 rounded-md">Pending</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">In Transit</span>
            <span className="text-lg font-black text-blue-400">{metrics.inTransit}</span>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Value</span>
            <span className="text-lg font-black text-emerald-400">₦{metrics.revenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 3. Redesigned Filter Segment & Control Center */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
        
        {/* Status Pill Filters with Horizontal Scroll Cues */}
        <div className="relative">
          {/* Scroll hint buttons for desktop / tablet */}
          <button
            type="button"
            onClick={() => scrollTabs('left')}
            className="hidden sm:flex absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded-full items-center justify-center shadow-lg cursor-pointer"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => scrollTabs('right')}
            className="hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded-full items-center justify-center shadow-lg cursor-pointer"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Swipeable Track */}
          <div
            ref={tabsContainerRef}
            className="flex items-center gap-2 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none snap-x touch-pan-x"
          >
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = filterStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterStatus(tab.key)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer snap-start ${
                    isActive
                      ? `${tab.activeBg} shadow-sm scale-102`
                      : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black transition-colors ${
                      isActive ? 'bg-black/25 text-white' : tab.badgeColor
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Multi-facet Filter Row */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Instant Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search reference, customer, phone, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded-xl pl-9 pr-9 py-2.5 bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white rounded-md cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Secondary Select Dropdowns */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            
            {/* Payment Filter */}
            <div className="w-full sm:w-auto">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full sm:w-auto text-xs font-semibold rounded-xl px-3 py-2.5 bg-slate-900 border border-slate-700/80 text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="all">All Payments</option>
                <option value="verified">Verified / Paid</option>
                <option value="pending">Pending Payment</option>
                <option value="failed">Failed Payment</option>
              </select>
            </div>

            {/* Delivery Method Filter */}
            <div className="w-full sm:w-auto">
              <select
                value={deliveryFilter}
                onChange={(e) => setDeliveryFilter(e.target.value)}
                className="w-full sm:w-auto text-xs font-semibold rounded-xl px-3 py-2.5 bg-slate-900 border border-slate-700/80 text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="all">All Deliveries</option>
                <option value="home_delivery">Door Delivery</option>
                <option value="physical_pickup">Store Pickup</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto text-xs font-semibold rounded-xl px-3 py-2.5 bg-slate-900 border border-slate-700/80 text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest_amount">Highest Value</option>
                <option value="lowest_amount">Lowest Value</option>
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-rose-400 hover:text-rose-300 border border-slate-700/80 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                title="Reset all active filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

          </div>

        </div>

        {/* Active Filter Chips & Summary */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-900 gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>Showing <strong className="text-white font-bold">{filtered.length}</strong> of <strong className="text-slate-300">{orders.length}</strong> orders</span>
            {filterStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                Status: <strong className="text-emerald-400 font-semibold">{filterStatus}</strong>
              </span>
            )}
            {paymentFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                Payment: <strong className="text-amber-400 font-semibold">{paymentFilter}</strong>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                Query: <strong className="text-white font-semibold">"{searchTerm}"</strong>
              </span>
            )}
          </div>
          {filtered.length > 0 && (
            <span className="text-[11px] text-slate-500">
              Page Total: <strong className="text-emerald-400 font-bold">₦{filtered.reduce((s, o) => s + (Number(o.total_amount) || 0), 0).toLocaleString()}</strong>
            </span>
          )}
        </div>

      </div>

      {/* 4. Orders View: Desktop Dense Table & Mobile Touch Cards */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-400">Loading order records...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-950 p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Orders Match Your Criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try switching filter statuses, clearing the search query, or resetting filters to view all customer orders.
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* A. MOBILE PHONE VIEW: Touch-optimized Cards (< md: 768px) */}
          <div className="block md:hidden space-y-3.5">
            {filtered.map((order) => (
              <div
                key={order.id}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xs"
              >
                {/* Top: Reference, Date, Status */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                  <div>
                    <span className="font-mono font-bold text-white text-xs block">
                      {order.order_reference}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      order.order_status === 'Delivered'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : order.order_status === 'Cancelled'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : order.order_status === 'Pending'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                    }`}
                  >
                    {order.order_status}
                  </span>
                </div>

                {/* Customer Details */}
                <div className="flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block">{order.customer_name}</span>
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{order.customer_phone}</span>
                    </a>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total</span>
                    <span className="font-black text-emerald-400 text-sm">
                      ₦{order.total_amount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Delivery & Payment Badges */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Delivery</span>
                    <span className="text-slate-300 font-medium block truncate">
                      {order.delivery_city || order.delivery_state || 'Kano'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Payment</span>
                    <span
                      className={`font-semibold capitalize ${
                        order.payment_status === 'verified' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </div>
                </div>

                {/* Quick Status & Inspect Action */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <select
                      value={order.order_status}
                      onChange={(e) => handleQuickStatusChange(order.id, e.target.value)}
                      className="w-full text-[11px] font-bold rounded-xl px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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

                  <Link
                    to={`/admin/orders/${order.order_reference}`}
                    className="px-3.5 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm shrink-0"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* B. DESKTOP / TABLET DENSE TABLE VIEW (>= md: 768px) */}
          <div className="hidden md:block bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-950">
                    <th className="py-3.5 px-4 font-bold">Reference</th>
                    <th className="py-3.5 px-4 font-bold">Date</th>
                    <th className="py-3.5 px-4 font-bold">Customer</th>
                    <th className="py-3.5 px-4 font-bold">Destination & Mode</th>
                    <th className="py-3.5 px-4 font-bold">Payment</th>
                    <th className="py-3.5 px-4 font-bold">Total</th>
                    <th className="py-3.5 px-4 font-bold">Fulfillment Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{order.order_reference}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white">{order.customer_name}</p>
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="text-[10px] text-slate-400 hover:text-emerald-400 transition-colors font-mono"
                        >
                          {order.customer_phone}
                        </a>
                      </td>

                      <td className="py-3.5 px-4 max-w-[170px] truncate text-slate-300">
                        <span className="capitalize font-semibold text-slate-200 block truncate">
                          {order.delivery_method?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {order.delivery_city}, {order.delivery_state}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold uppercase text-[10px] text-slate-300 block">
                          {order.payment_method?.replace(/_/g, ' ')}
                        </span>
                        <span
                          className={`text-[10px] font-semibold capitalize ${
                            order.payment_status === 'verified' ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-black text-emerald-400 whitespace-nowrap text-sm">
                        ₦{order.total_amount?.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={order.order_status}
                          onChange={(e) => handleQuickStatusChange(order.id, e.target.value)}
                          className={`text-[11px] font-bold rounded-xl px-2.5 py-1.5 bg-slate-900 border focus:outline-none cursor-pointer transition-colors ${
                            order.order_status === 'Delivered'
                              ? 'border-emerald-600/70 text-emerald-400'
                              : order.order_status === 'Cancelled'
                              ? 'border-rose-600/70 text-rose-400'
                              : order.order_status === 'Pending'
                              ? 'border-amber-600/70 text-amber-400'
                              : 'border-sky-600/70 text-sky-400'
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-800"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
