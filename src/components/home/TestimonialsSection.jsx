import React, { useState } from 'react';
import { Star, Quote, MessageSquarePlus, CheckCircle2 } from 'lucide-react';
import { saveTestimonial } from '../../services/dataService';
import ScrollReveal from '../common/ScrollReveal';
import TiltCard from '../common/TiltCard';

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
    <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <ScrollReveal direction="up" duration={500}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-4 py-1.5 rounded-full shadow-2xs">
                Real Experiences
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 mt-4 tracking-tight">
                What Our Customers Say
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mt-2 font-normal">
                Authentic feedback from satisfied smartphone buyers across Nigeria.
              </p>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-xs sm:text-sm font-black transition-all shadow-md w-fit active:scale-95"
            >
              <MessageSquarePlus className="w-4 h-4 text-emerald-400" />
              <span>Leave a Review</span>
            </button>
          </div>
        </ScrollReveal>

        {/* Testimonials Grid with Staggered Cascading Tilt */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <ScrollReveal
              key={t.id}
              direction="up"
              delay={idx * 90}
              duration={550}
            >
              <TiltCard
                maxTilt={6}
                className="h-full p-8 rounded-3xl bg-slate-50/90 border border-slate-200/90 hover:border-emerald-300 hover:bg-white hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Quote className="w-10 h-10 text-emerald-600/20" />
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                          }`}
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-slate-800 text-sm sm:text-base leading-relaxed flex-1 italic mb-6 font-normal">
                    "{t.content}"
                  </p>
                </div>

                {/* Customer Info */}
                <div className="pt-4 border-t border-slate-200/80 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                    {t.customer_name[0]}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{t.customer_name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{t.customer_role}</p>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>

        {/* Submit Review Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
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
