import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Plus, Trash2, CheckCircle2, Home, Building } from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const ADDRESS_STORAGE_KEY = 'ubh_customer_saved_addresses';

export default function CustomerAddressesPage() {
  const { user, profile } = useAuth();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [addresses, setAddresses] = useState(() => {
    try {
      const raw = localStorage.getItem(`${ADDRESS_STORAGE_KEY}_${user?.id || 'demo'}`);
      return raw
        ? JSON.parse(raw)
        : [
            {
              id: 'addr-1',
              label: 'Home',
              recipient_name: profile?.full_name || 'Aliyu Haruna',
              phone_number: profile?.phone_number || '08031234567',
              state: 'Kano',
              city: 'Kano Metropolis',
              street_address: '14 Bompai Road, Near Central Hospital',
              is_default: true,
            },
          ];
    } catch {
      return [];
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    recipient_name: profile?.full_name || '',
    phone_number: profile?.phone_number || '',
    state: 'Kano',
    city: '',
    street_address: '',
    is_default: false,
  });

  useEffect(() => {
    localStorage.setItem(
      `${ADDRESS_STORAGE_KEY}_${user?.id || 'demo'}`,
      JSON.stringify(addresses)
    );
  }, [addresses, user]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!newAddr.recipient_name || !newAddr.phone_number || !newAddr.street_address) return;

    let updated = [...addresses];
    if (newAddr.is_default) {
      updated = updated.map((a) => ({ ...a, is_default: false }));
    }

    const created = {
      ...newAddr,
      id: `addr-${Date.now()}`,
    };

    setAddresses([...updated, created]);
    setShowAddModal(false);
    setNewAddr({
      label: 'Home',
      recipient_name: profile?.full_name || '',
      phone_number: profile?.phone_number || '',
      state: 'Kano',
      city: '',
      street_address: '',
      is_default: false,
    });
  };

  const handleDelete = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefault = (id) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, is_default: a.id === id }))
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950">Saved Delivery Addresses</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage recipient locations for swift one-click checkout.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No addresses saved yet</h3>
          <p className="text-xs text-slate-400">Add your regular delivery locations for quicker checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                addr.is_default
                  ? 'border-emerald-500 bg-emerald-50/20 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase px-2 py-0.5 bg-slate-200/70 text-slate-800 rounded">
                    {addr.label}
                  </span>
                  {addr.is_default ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Default Address
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[11px] text-slate-500 hover:text-emerald-600 font-semibold"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{addr.recipient_name}</h4>
                  <p className="text-xs text-slate-500">{addr.phone_number}</p>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {addr.street_address}, {addr.city}, {addr.state}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-200/60 flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteTarget(addr)}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Delivery Address</h3>
            <p className="text-xs text-slate-500 mb-4">Enter shipping recipient details.</p>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Label</label>
                  <select
                    value={newAddr.label}
                    onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                    className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State</label>
                  <select
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 font-semibold"
                  >
                    <option value="Kano">Kano (Free Delivery)</option>
                    <option value="Niger">Niger</option>
                    <option value="Abuja (FCT)">Abuja (FCT)</option>
                    <option value="Katsina">Katsina</option>
                    <option value="Kaduna">Kaduna</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={newAddr.recipient_name}
                    onChange={(e) => setNewAddr({ ...newAddr, recipient_name: e.target.value })}
                    className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newAddr.phone_number}
                    onChange={(e) => setNewAddr({ ...newAddr, phone_number: e.target.value })}
                    className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City / Area *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nassarawa GRA"
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Street Address & Landmark *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot 12, Commercial Road"
                  value={newAddr.street_address}
                  onChange={(e) => setNewAddr({ ...newAddr, street_address: e.target.value })}
                  className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newAddr.is_default}
                    onChange={(e) => setNewAddr({ ...newAddr, is_default: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                  />
                  <span>Set as default address for checkout</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Address Removal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            handleDelete(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Saved Address?"
        message="Are you sure you want to remove this delivery address? You will need to re-enter it for future orders."
        itemName={deleteTarget ? `${deleteTarget.label}: ${deleteTarget.street_address}, ${deleteTarget.city}` : ''}
        confirmText="Delete Address"
      />

    </div>
  );
}
