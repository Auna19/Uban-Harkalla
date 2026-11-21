import React, { useState, useEffect } from 'react';
import {
  getDeliveryLocations,
  saveDeliveryLocation,
  deleteDeliveryLocation,
  getWebsiteContent,
  saveWebsiteContent,
} from '../../services/dataService';
import { Truck, Store, Plus, Edit, Trash2, CheckCircle2, Save } from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { formatPrice } from '../../utils/formatters';

export default function AdminDeliveryPage() {
  const [locations, setLocations] = useState([]);
  const [pickup, setPickup] = useState({ address: '', workingHours: '', instructions: '' });
  const [editingLoc, setEditingLoc] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ state: '', city: '', fee: 0, estimated_days: '1-2 business days' });
  const [showModal, setShowModal] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const load = async () => {
    const [locs, content] = await Promise.all([getDeliveryLocations(), getWebsiteContent()]);
    setLocations(locs);
    if (content?.pickup) {
      setPickup(content.pickup);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpenAdd = () => {
    setEditingLoc(null);
    setForm({ state: '', city: '', fee: 0, estimated_days: '1-2 business days' });
    setShowModal(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLoc(loc);
    setForm({
      state: loc.state,
      city: loc.city || '',
      fee: loc.fee || 0,
      estimated_days: loc.estimated_days || '1-2 business days',
    });
    setShowModal(true);
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    await saveDeliveryLocation({
      id: editingLoc?.id,
      state: form.state,
      city: form.city,
      fee: Number(form.fee),
      estimated_days: form.estimated_days,
      is_active: true,
    });
    setShowModal(false);
    load();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteDeliveryLocation(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const handleSavePickup = async (e) => {
    e.preventDefault();
    await saveWebsiteContent('pickup', pickup);
    setSavedMsg('Store physical pickup settings updated!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Delivery Charges & Store Pickup</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure state delivery fees and customer pickup guidelines.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Delivery Location</span>
        </button>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Locations Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            Configured State Shipping Rates
          </h3>
          <span className="text-xs text-slate-400">Total: {locations.length} options</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-800 bg-slate-950/80">
                <th className="py-3 px-4 font-semibold">State / Route</th>
                <th className="py-3 px-4 font-semibold">Coverage Cities</th>
                <th className="py-3 px-4 font-semibold">Delivery Timeline</th>
                <th className="py-3 px-4 font-semibold">Delivery Fee</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                    {loc.state}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{loc.city}</td>
                  <td className="py-3.5 px-4 text-slate-300 font-medium">{loc.estimated_days}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {loc.fee === 0 ? (
                      <span className="font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        FREE (₦0)
                      </span>
                    ) : (
                      <span className="font-black text-white">{formatPrice(loc.fee)}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(loc)}
                        className="p-1.5 rounded-lg text-emerald-400 hover:bg-slate-900"
                        title="Edit Fee"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(loc)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-slate-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Physical Store Pickup Management Card */}
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Store Physical Pickup Settings</h3>
            <p className="text-xs text-slate-400">Manage walk-in store pickup location and customer guidelines.</p>
          </div>
        </div>

        <form onSubmit={handleSavePickup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
              Store Pickup Address *
            </label>
            <input
              type="text"
              required
              value={pickup.address}
              onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
              className="w-full text-xs rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
              Pickup Operating Hours *
            </label>
            <input
              type="text"
              required
              value={pickup.workingHours}
              onChange={(e) => setPickup({ ...pickup, workingHours: e.target.value })}
              className="w-full text-xs rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
              Instructions for Customer Collection *
            </label>
            <textarea
              rows={3}
              required
              value={pickup.instructions}
              onChange={(e) => setPickup({ ...pickup, instructions: e.target.value })}
              className="w-full text-xs rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Pickup Guidelines</span>
          </button>
        </form>
      </div>

      {/* Location Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <h3 className="font-bold text-base">
              {editingLoc ? `Edit Location: ${editingLoc.state}` : 'Add New Delivery Route'}
            </h3>

            <form onSubmit={handleSaveLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">State Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sokoto"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full text-xs rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cities / Coverage Areas</label>
                <input
                  type="text"
                  placeholder="e.g. Sokoto Central, Wamakko"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full text-xs rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Delivery Fee (₦) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.fee}
                  onChange={(e) => setForm({ ...form, fee: e.target.value })}
                  className="w-full text-xs font-bold rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-emerald-400"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Set 0 for free delivery.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Estimated Timeline</label>
                <input
                  type="text"
                  placeholder="e.g. 1-2 business days"
                  value={form.estimated_days}
                  onChange={(e) => setForm({ ...form, estimated_days: e.target.value })}
                  className="w-full text-xs rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delivery Location Deletion */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Delivery Zone Rates?"
        message="Are you sure you want to delete delivery charges for this region? Customers selecting this location during checkout will not see custom rates."
        itemName={deleteTarget ? `${deleteTarget.state} - ${deleteTarget.city} (${formatPrice(deleteTarget.fee)})` : ''}
        confirmText="Delete Location"
      />

    </div>
  );
}
