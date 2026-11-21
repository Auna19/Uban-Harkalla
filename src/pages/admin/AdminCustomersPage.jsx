import React, { useState, useEffect } from 'react';
import { getCustomers, toggleCustomerStatus, deleteCustomer, deleteCustomers } from '../../services/dataService';
import { useAdminToast } from '../../context/AdminToastContext';
import { formatPrice, formatNumber } from '../../utils/formatters';
import { Users, Search, CheckCircle2, XCircle, Mail, Phone, Trash2, UserX } from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
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
    const nextVal = customer.is_active === false;

    // 1. Instant 0ms Optimistic UI update
    setCustomers((prev) =>
      prev.map((c) => (c.id === customer.id ? { ...c, is_active: nextVal } : c))
    );
    showToast(
      nextVal
        ? `Activated customer account "${customer.full_name}".`
        : `Suspended customer account "${customer.full_name}".`,
      'info'
    );

    // 2. Background database persistence
    try {
      await toggleCustomerStatus(customer.id);
    } catch (e) {
      console.error(e);
      // Revert if error
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, is_active: !nextVal } : c))
      );
      showToast('Failed to update customer status.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    try {
      await deleteCustomer(targetId);
      setSelectedIds((prev) => prev.filter((id) => id !== targetId));
      showToast(`Customer account "${deleteTarget.full_name}" deleted.`, 'info');
      setDeleteTarget(null);
      load();
    } catch (e) {
      console.error(e);
      showToast('Failed to delete customer.', 'error');
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeletingBulk(true);
    try {
      const count = selectedIds.length;
      await deleteCustomers(selectedIds);
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
      showToast(`Successfully deleted ${count} selected customer account${count > 1 ? 's' : ''}!`, 'info');
      load();
    } catch (err) {
      console.error('Failed to bulk delete customers:', err);
      showToast('Failed to delete selected customer accounts.', 'error');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone_number?.includes(searchTerm)
  );

  const isAllFilteredSelected =
    filtered.length > 0 && filtered.every((c) => selectedIds.includes(c.id));

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      const filteredIdSet = new Set(filtered.map((c) => c.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      const allFilteredIds = filtered.map((c) => c.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleToggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Registered Customers</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Directory of registered customer profiles, orders summary, and account access.
        </p>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/80 border border-red-800/80 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-red-950/20 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center bg-red-600 text-white font-extrabold px-2.5 py-0.5 rounded-full text-xs shadow-xs">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold text-red-200">
              {selectedIds.length} customer{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-colors"
            >
              Clear Selection
            </button>
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-md transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

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
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      onChange={handleToggleSelectAll}
                      aria-label="Select all customers"
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                    />
                  </th>
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
                {filtered.map((c) => {
                  const isSelected = selectedIds.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-emerald-950/20 hover:bg-emerald-950/30' : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <td className="py-3.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(c.id)}
                          aria-label={`Select ${c.full_name}`}
                          className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                        />
                      </td>

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
                        {formatNumber(c.total_orders || 0)} orders
                      </td>

                      <td className="py-3.5 px-4 font-black text-emerald-400">
                        {formatPrice(c.total_spent || 0)}
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
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer ${c.is_active !== false
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Single Customer Deletion */}
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

      {/* Confirmation Modal for Bulk Customer Deletion */}
      <ConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        title={`Delete ${selectedIds.length} Customers`}
        message={`Are you sure you want to permanently delete the ${selectedIds.length} selected customer account${selectedIds.length > 1 ? 's' : ''}? Their profiles and account access will be removed.`}
        confirmText={isDeletingBulk ? 'Deleting...' : `Delete ${selectedIds.length} Customers`}
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => !isDeletingBulk && setIsBulkDeleteModalOpen(false)}
        onClose={() => !isDeletingBulk && setIsBulkDeleteModalOpen(false)}
      />
    </div>
  );
}
