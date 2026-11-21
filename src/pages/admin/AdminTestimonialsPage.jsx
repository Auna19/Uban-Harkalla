import React, { useState, useEffect } from 'react';
import { getTestimonials, saveTestimonial, deleteTestimonial } from '../../services/dataService';
import { Star, CheckCircle2, XCircle, Trash2, Edit, Plus, Quote } from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function AdminTestimonialsPage() {
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ customer_name: '', customer_role: '', content: '', rating: 5, is_approved: true });

  const load = async () => {
    const data = await getTestimonials(false); // all, including unapproved
    setList(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleApproval = async (item) => {
    const nextVal = !item.is_approved;
    setTestimonials((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, is_approved: nextVal } : t))
    );
    try {
      await saveTestimonial({
        ...item,
        is_approved: nextVal,
      });
    } catch (e) {
      console.error(e);
      setTestimonials((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, is_approved: !nextVal } : t))
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteTestimonial(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await saveTestimonial(form);
    setShowModal(false);
    setForm({ customer_name: '', customer_role: '', content: '', rating: 5, is_approved: true });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Customer Reviews & Testimonials</h1>
          <p className="text-xs text-slate-400 mt-0.5">Approve, edit, or feature customer testimonials.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {list.map((item) => (
          <div
            key={item.id}
            className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${item.is_approved
                ? 'bg-slate-950 border-slate-800'
                : 'bg-amber-950/20 border-amber-800/60'
              }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.is_approved
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                >
                  {item.is_approved ? 'Approved' : 'Pending Review'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{item.content}"
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-xs">{item.customer_name}</p>
                <p className="text-[10px] text-slate-500">{item.customer_role}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleApproval(item)}
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg ${item.is_approved
                      ? 'bg-slate-900 text-slate-400 hover:text-white'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                >
                  {item.is_approved ? 'Unpublish' : 'Approve'}
                </button>
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="p-1 text-red-400 hover:text-red-300"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white space-y-4">
            <h3 className="font-bold text-base">Add Customer Review</h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className="w-full text-xs rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Role / City *</label>
                <input
                  type="text"
                  required
                  value={form.customer_role}
                  onChange={(e) => setForm({ ...form, customer_role: e.target.value })}
                  className="w-full text-xs rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Rating</label>
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  className="w-full text-xs rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                  <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Testimonial Content *</label>
                <textarea
                  rows={3}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full text-xs rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-white"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-semibold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Testimonial Deletion */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Testimonial Review?"
        message="Are you sure you want to delete this customer review? It will be permanently removed from the storefront testimonials section."
        itemName={deleteTarget ? `${deleteTarget.customer_name}: "${deleteTarget.content?.slice(0, 50)}..."` : ''}
        confirmText="Delete Review"
      />

    </div>
  );
}
