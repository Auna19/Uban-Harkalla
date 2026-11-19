import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2 } from 'lucide-react';

export default function ContactSection({ contactInfo }) {
  const phone = contactInfo?.phone || '+234 812 345 6789';
  const whatsapp = contactInfo?.whatsapp || '+234 812 345 6789';
  const email = contactInfo?.email || 'contact@ubanharkalla.com';
  const address = contactInfo?.address || 'Commercial Avenue, Kano State, Nigeria';

  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!form.message.trim()) {
      setError('Please enter your message.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <section id="contact" className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3.5 py-1 rounded-full">
            Get In Touch
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">
            We Are Here to Assist You
          </h2>
          <p className="text-base text-slate-600 mt-4 leading-relaxed">
            Have questions about device specifications, warranty, or need advice on choosing your next smartphone? Reach out to us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Direct Contact Channels & WhatsApp */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* WhatsApp Highlight Box */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Fast Response via WhatsApp</h3>
              <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed">
                Connect directly with our sales specialists for real-time video inspection of available devices, stock confirmation, and instant guidance.
              </p>
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-800 font-bold text-xs sm:text-sm rounded-xl shadow hover:bg-emerald-50 transition-colors w-fit"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-800" />
                <span>Chat on WhatsApp Now</span>
              </a>
            </div>

            {/* Contact Details Card */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Calls</h4>
                  <a href={`tel:${phone}`} className="text-sm sm:text-base font-bold text-slate-900 hover:text-emerald-600">
                    {phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Email</h4>
                  <a href={`mailto:${email}`} className="text-sm sm:text-base font-bold text-slate-900 hover:text-emerald-600">
                    {email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Physical Store Location</h4>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                    {address}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Send Us a Direct Message</h3>
            <p className="text-xs text-slate-500 mb-6">Fill in the form below and we will get back to you within a few hours.</p>

            {success ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-slate-900">Message Delivered!</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Thank you for reaching out to UBAN HARKALLA. Our support team will respond promptly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded-xl">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ibrahim Sani"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ibrahim@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 08012345678"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. iPhone 15 Pro Max Inquiries"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write your question or request here..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Sending message...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
