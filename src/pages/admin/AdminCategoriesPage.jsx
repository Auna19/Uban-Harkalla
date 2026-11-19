import React, { useState, useEffect } from 'react';
import { getCategories, saveCategory, deleteCategory } from '../../services/dataService';
import { Layers, Plus, Edit, Trash2, CheckCircle2, Save, X } from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '/1001102628.jpg', is_active: true });

  const load = async () => {
    const list = await getCategories();
    setCategories(list);
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setForm({ name: '', slug: '', description: '', image_url: '/1001102628.jpg', is_active: true });
    setShowModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || '/1001102628.jpg',
      is_active: cat.is_active !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveCategory({
      id: editingCat?.id,
      ...form,
    });
    setShowModal(false);
    load();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteCategory(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Categories Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Add or edit store categories (e.g. iPhones, Android Phones, Accessories).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div className="relative aspect-video bg-slate-900 overflow-hidden">
              <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    cat.is_active !== false ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {cat.is_active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-white text-base">{cat.name}</h3>
                <span className="text-[10px] text-slate-400 font-mono">/{cat.slug}</span>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">{cat.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 rounded-lg text-emerald-400 hover:bg-slate-900"
                  title="Edit Category"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(cat)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-slate-900"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base">
                {editingCat ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: editingCat ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    });
                  }}
                  className="w-full text-xs rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full text-xs font-mono rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Image URL / Path</label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full text-xs rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full text-xs rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-white"
                ></textarea>
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Category Deletion */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category?"
        message="Are you sure you want to delete this category? Products linked to this category may need to be recategorized."
        itemName={deleteTarget?.name}
        confirmText="Delete Category"
      />

    </div>
  );
}
