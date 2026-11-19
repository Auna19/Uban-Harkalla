import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import ScrollReveal from '../common/ScrollReveal';
import TiltCard from '../common/TiltCard';

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
    <section id="contact" className="relative py-24 bg-gradient-to-b from-slate-50 via-white to-slate-100 border-t border-slate-200/80 overflow-hidden">
      {/* Background ambient blur */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-100/70 border border-emerald-200/60 px-4 py-1.5 rounded-full shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Get In Touch
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 mt-4 tracking-tight">
              We Are Here to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Assist You</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed font-medium">
              Have questions about device specifications, warranty, or need advice on choosing your next smartphone? Reach out to our specialist team.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Direct Contact Channels & WhatsApp */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* WhatsApp Highlight Box wrapped in TiltCard */}
            <ScrollReveal direction="left" delay={100}>
              <TiltCard maxTilt={5} glare={true} className="rounded-3xl shadow-xl overflow-hidden">
                <div className="relative p-8 bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white space-y-4">
                  {/* Subtle inner mesh glow */}
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-inner">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                      Live Chat Active
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">Fast Response via WhatsApp</h3>
                  <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
                    Connect directly with our sales specialists for real-time video inspection of available devices, physical battery health confirmation, and instant guidance.
                  </p>

                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-emerald-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:bg-emerald-50 hover:shadow-xl transition-all duration-200 active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4 fill-emerald-700 text-emerald-700" />
                      <span>Chat on WhatsApp Now</span>
                    </a>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>

            {/* Contact Details Card */}
            <ScrollReveal direction="left" delay={200}>
              <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Phone Calls & Inquiries</h4>
                    <a href={`tel:${phone}`} className="text-sm sm:text-base font-extrabold text-slate-900 hover:text-emerald-600 transition-colors">
                      {phone}
                    </a>
                    <p className="text-xs text-slate-500 mt-0.5">Mon – Sat, 9:00 AM – 7:00 PM</p>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-200">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Official Email</h4>
                    <a href={`mailto:${email}`} className="text-sm sm:text-base font-extrabold text-slate-900 hover:text-emerald-600 transition-colors">
                      {email}
                    </a>
                    <p className="text-xs text-slate-500 mt-0.5">Prompt email replies within 4 business hours</p>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-200">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Physical Store Location</h4>
                    <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                      {address}
                    </p>
                    <p className="text-xs text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Free walk-in device inspection & pick-up
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <ScrollReveal direction="right" delay={150}>
              <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-lg">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-slate-950 tracking-tight">Send Us a Direct Message</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Fill in your request below and our customer service desk will respond promptly.</p>
                </div>

                {success ? (
                  <div className="p-8 text-center bg-emerald-50/80 rounded-2xl border border-emerald-200 shadow-inner">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/30">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-black text-slate-950">Message Delivered Successfully!</h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                      Thank you for reaching out to UBAN HARKALLA. Our support team has logged your inquiry and will contact you via your provided email or phone.
                    </p>
                    <button
                      onClick={() => setSuccess(false)}
                      className="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow hover:shadow-md transition-all active:scale-95"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl font-semibold">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ibrahim Sani"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. ibrahim@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="e.g. 08012345678"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Inquiry Subject</label>
                        <input
                          type="text"
                          placeholder="e.g. iPhone 15 Pro Max Availability"
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Message Details *</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Write your device question, order reference, or custom request here..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-y"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Delivering your message...</span>
                        </div>
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
            </ScrollReveal>
          </div>

        </div>

      </div>
    </section>
  );
}
