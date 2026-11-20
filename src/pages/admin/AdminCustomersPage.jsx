import React, { useState, useEffect } from 'react';
import { getCustomers, toggleCustomerStatus, deleteCustomer } from '../../services/dataService';
import { useAdminToast } from '../../context/AdminToastContext';
import { Users, Search, CheckCircle2, XCircle, Mail, Phone, Trash2, UserX } from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useAdminToast();

  const load = async () => {
    setLoading(true);
    try {
      const list = await getCustomers();
      setCustomers(list);
    } catch (e) {
      console.error('Failed to load customers:', e);
      showToast('Failed to load customers list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (customer) => {
    try {
      await toggleCustomerStatus(customer.id);
      showToast(
        customer.is_active !== false
          ? `Suspended customer account "${customer.full_name}".`
          : `Activated customer account "${customer.full_name}".`,
        'info'
      );
      load();
    } catch (e) {
      console.error(e);
      showToast('Failed to update customer status.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCustomer(deleteTarget.id);
      showToast(`Customer account "${deleteTarget.full_name}" deleted.`, 'info');
      setDeleteTarget(null);
      load();
    } catch (e) {
      console.error(e);
      showToast('Failed to delete customer.', 'error');
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone_number?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Registered Customers</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Directory of registered customer profiles, orders summary, and account access.
        </p>
      </div>

      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search customers by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-xl pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs text-slate-400">Total: {filtered.length} customers</span>
      </div>

      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <p className="text-xs">Loading registered customers...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <UserX className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No Registered Customers Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm
                ? `No customers match your search "${searchTerm}".`
                : 'New customer accounts created during registration or checkout will appear here in real-time.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-800 bg-slate-950/80">
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Contact Info</th>
                  <th className="py-3 px-4 font-semibold">Orders Count</th>
                  <th className="py-3 px-4 font-semibold">Total Spent</th>
                  <th className="py-3 px-4 font-semibold">Registered</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs uppercase">
                        {(c.full_name || 'U')[0]}
                      </div>
                      <span>{c.full_name}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-slate-200">{c.email}</p>
                      <p className="text-[11px] text-slate-400">{c.phone_number || 'N/A'}</p>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-200">
                      {c.total_orders || 0} orders
                    </td>

                    <td className="py-3.5 px-4 font-black text-emerald-400">
                      ₦{(c.total_spent || 0).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Recent'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${c.is_active !== false
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                          }`}
                      >
                        {c.is_active !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(c)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${c.is_active !== false
                              ? 'bg-slate-900 text-amber-400 hover:bg-amber-950 hover:text-amber-300'
                              : 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900'
                            }`}
                        >
                          {c.is_active !== false ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Customer Account"
        message={`Are you sure you want to permanently delete customer "${deleteTarget?.full_name}" (${deleteTarget?.email})? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
