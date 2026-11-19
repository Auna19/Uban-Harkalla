import React, { useState } from 'react';
import { Star, Quote, MessageSquarePlus, CheckCircle2 } from 'lucide-react';
import { saveTestimonial } from '../../services/dataService';

export default function TestimonialsSection({ testimonials }) {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', rating: 5, comment: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.comment) return;

    await saveTestimonial({
      customer_name: form.name,
      customer_role: form.location ? `Customer (${form.location})` : 'Verified Customer',
      content: form.comment,
      rating: Number(form.rating) || 5,
      is_approved: false, // requires admin approval
      is_featured: false,
    });

    setSubmitted(true);
    setTimeout(() => {
      setShowSubmitModal(false);
      setSubmitted(false);
      setForm({ name: '', location: '', rating: 5, comment: '' });
    }, 2500);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Real Experiences
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">
              What Our Customers Say
            </h2>
            <p className="text-base text-slate-600 mt-2">
              Authentic feedback from satisfied smartphone buyers across Nigeria.
            </p>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm w-fit"
          >
            <MessageSquarePlus className="w-4 h-4 text-emerald-400" />
            <span>Leave a Review</span>
          </button>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-xl transition-all duration-300 flex flex-col relative"
            >
              <Quote className="w-8 h-8 text-emerald-600/15 mb-4" />

              {/* Star Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-slate-700 text-sm leading-relaxed flex-1 italic mb-6">
                "{t.content}"
              </p>

              {/* Customer Info */}
              <div className="pt-4 border-t border-slate-200/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {t.customer_name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t.customer_name}</h4>
                  <p className="text-xs text-slate-500">{t.customer_role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Review Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-scale-in">
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-slate-900">Thank You!</h3>
                  <p className="text-xs text-slate-500 mt-2">
                    Your testimonial has been submitted and will appear after administrative review.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900">Share Your Experience</h3>
                  <p className="text-xs text-slate-500">Tell others how your shopping experience with UBAN HARKALLA went.</p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Aliyu Haruna"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City / Location</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. Kano or Abuja"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
                    <select
                      value={form.rating}
                      onChange={(e) => setForm({ ...form, rating: e.target.value })}
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 Stars - Outstanding)</option>
                      <option value="4">⭐⭐⭐⭐ (4 Stars - Great)</option>
                      <option value="3">⭐⭐⭐ (3 Stars - Satisfactory)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Review</label>
                    <textarea
                      required
                      rows={3}
                      value={form.comment}
                      onChange={(e) => setForm({ ...form, comment: e.target.value })}
                      placeholder="What device did you buy? How was delivery and service?"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow"
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
