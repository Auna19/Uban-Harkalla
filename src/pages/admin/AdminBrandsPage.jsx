import React, { useState, useEffect } from 'react';
import { getBrands, saveBrand, deleteBrand } from '../../services/dataService';
import { Shield, Plus, Edit, Trash2 } from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    const list = await getBrands();
    setBrands(list);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await saveBrand({ name: name.trim() });
    setName('');
    load();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteBrand(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white">Brand Directory</h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage smartphone and accessory manufacturers.</p>
      </div>

      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm">
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            required
            placeholder="e.g. Huawei or OnePlus"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 text-xs rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl"
          >
            + Add Brand
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {brands.map((b) => (
          <div key={b.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {b.name[0]}
              </div>
              <div>
                <span className="font-bold text-sm text-white block">{b.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">/{b.slug}</span>
              </div>
            </div>
            <button
              onClick={() => setDeleteTarget(b)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition-colors"
              title="Delete Brand"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal for Brand Deletion */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Brand?"
        message="Are you sure you want to delete this manufacturer? Products linked to this brand may need their brand association updated."
        itemName={deleteTarget?.name}
        confirmText="Delete Brand"
      />
    </div>
  );
}
