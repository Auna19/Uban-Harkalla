import React, { useState, useEffect } from 'react';
import { getCategories, saveCategory, deleteCategory } from '../../services/dataService';
import { Layers, Plus, Edit, Trash2, CheckCircle2, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { processLocalImage } from '../../utils/imageUpload';
import { useAdminToast } from '../../context/AdminToastContext';

export default function AdminCategoriesPage() {
  const { showToast } = useAdminToast();
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
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

  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const dataUrl = await processLocalImage(file);
      setForm((prev) => ({ ...prev, image_url: dataUrl }));
      showToast('Category image uploaded and optimized!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to process image', 'error');
    } finally {
      setUploadingImage(false);
    }
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
    const isEdit = Boolean(editingCat);
    const catName = form.name;
    const cleanSlug = (form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) || `cat-${Date.now()}`;
    await saveCategory({
      id: editingCat?.id,
      ...form,
      slug: cleanSlug,
    });
    setShowModal(false);
    showToast(isEdit ? `Category "${catName}" updated successfully!` : `Category "${catName}" created successfully!`, 'success');
    load();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const catName = deleteTarget.name;
    await deleteCategory(deleteTarget.id);
    setDeleteTarget(null);
    showToast(`Category "${catName}" deleted successfully!`, 'info');
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
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.is_active !== false ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
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
                  placeholder="e.g. iPhones, Android Phones, Accessories"
                  value={form.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setForm({
                      ...form,
                      name: newName,
                      slug: editingCat?.slug || newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
                    });
                  }}
                  className="w-full text-xs rounded-xl px-3.5 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Category Image Asset
                </label>
                <div className="flex items-start gap-3 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
                  {/* Thumbnail Preview */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 shrink-0 relative">
                    <img
                      src={form.image_url || '/1001102628.jpg'}
                      alt="Category Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl cursor-pointer text-xs font-bold transition-all w-fit">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'Processing...' : 'Upload Image from Computer'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCategoryImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                    <input
                      type="text"
                      value={form.image_url}
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                      placeholder="e.g. /1001102628.jpg or data:image/..."
                      className="w-full text-[11px] font-mono rounded-lg px-2.5 py-1.5 bg-slate-950 border border-slate-700 text-slate-300"
                    />
                  </div>
                </div>
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
