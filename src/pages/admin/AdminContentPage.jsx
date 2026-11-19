import React, { useState, useEffect } from 'react';
import { getWebsiteContent, saveWebsiteContent } from '../../services/dataService';
import { FileText, Save, CheckCircle2, UserCheck, Sparkles, Phone, Award } from 'lucide-react';

export default function AdminContentPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedMsg, setSavedMsg] = useState('');

  const load = async () => {
    const c = await getWebsiteContent();
    setContent(c);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaveSection = async (sectionKey, data) => {
    await saveWebsiteContent(sectionKey, data);
    setSavedMsg(`"${sectionKey.toUpperCase()}" content updated successfully!`);
    setTimeout(() => setSavedMsg(''), 3000);
    load();
  };

  if (loading || !content) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      <div>
        <h1 className="text-2xl font-black text-white">Website Content CMS</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Edit landing page headlines, CEO profile, mission & vision, and contact channels without touching code.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* 1. Hero Section Content */}
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Hero Section Headlines
          </h3>
          <button
            onClick={() => handleSaveSection('hero', content.hero)}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save Hero
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold uppercase mb-1">Headline *</label>
            <input
              type="text"
              value={content.hero?.headline || ''}
              onChange={(e) =>
                setContent({ ...content, hero: { ...content.hero, headline: e.target.value } })
              }
              className="w-full text-xs font-semibold rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase mb-1">Subtext / Supporting Description *</label>
            <textarea
              rows={3}
              value={content.hero?.subtext || ''}
              onChange={(e) =>
                setContent({ ...content, hero: { ...content.hero, subtext: e.target.value } })
              }
              className="w-full text-xs rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>
        </div>
      </div>

      {/* 2. Meet the CEO Profile */}
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Meet the CEO Details
          </h3>
          <button
            onClick={() => handleSaveSection('ceo', content.ceo)}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save CEO Info
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold uppercase mb-1">CEO Name *</label>
            <input
              type="text"
              value={content.ceo?.name || ''}
              onChange={(e) =>
                setContent({ ...content, ceo: { ...content.ceo, name: e.target.value } })
              }
              className="w-full text-xs font-semibold rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase mb-1">Position / Title *</label>
            <input
              type="text"
              value={content.ceo?.title || ''}
              onChange={(e) =>
                setContent({ ...content, ceo: { ...content.ceo, title: e.target.value } })
              }
              className="w-full text-xs font-semibold rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white"
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="block text-slate-400 font-bold uppercase mb-1">Photograph Asset Path</label>
          <input
            type="text"
            value={content.ceo?.image || '/About CEO Image.jpg'}
            onChange={(e) =>
              setContent({ ...content, ceo: { ...content.ceo, image: e.target.value } })
            }
            className="w-full text-xs font-mono rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-emerald-400"
          />
        </div>

        <div className="text-xs">
          <label className="block text-slate-400 font-bold uppercase mb-1">Short Biography</label>
          <textarea
            rows={2}
            value={content.ceo?.bio || ''}
            onChange={(e) =>
              setContent({ ...content, ceo: { ...content.ceo, bio: e.target.value } })
            }
            className="w-full text-xs rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white"
          ></textarea>
        </div>

        <div className="text-xs">
          <label className="block text-slate-400 font-bold uppercase mb-1">Executive Message</label>
          <textarea
            rows={2}
            value={content.ceo?.message || ''}
            onChange={(e) =>
              setContent({ ...content, ceo: { ...content.ceo, message: e.target.value } })
            }
            className="w-full text-xs rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white italic"
          ></textarea>
        </div>
      </div>

      {/* 3. Mission and Vision */}
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            Mission & Vision
          </h3>
          <button
            onClick={() => handleSaveSection('missionVision', content.missionVision)}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save Mission & Vision
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold uppercase mb-1">Mission Statement *</label>
            <textarea
              rows={2}
              value={content.missionVision?.mission || ''}
              onChange={(e) =>
                setContent({
                  ...content,
                  missionVision: { ...content.missionVision, mission: e.target.value },
                })
              }
              className="w-full text-xs rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white"
            ></textarea>
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase mb-1">Vision Statement *</label>
            <textarea
              rows={2}
              value={content.missionVision?.vision || ''}
              onChange={(e) =>
                setContent({
                  ...content,
                  missionVision: { ...content.missionVision, vision: e.target.value },
                })
              }
              className="w-full text-xs rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white"
            ></textarea>
          </div>
        </div>
      </div>

      {/* 4. Contact Channels */}
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            Business Contact Channels
          </h3>
          <button
            onClick={() => handleSaveSection('contact', content.contact)}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save Contact Details
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold uppercase mb-1">Phone Number</label>
            <input
              type="text"
              value={content.contact?.phone || ''}
              onChange={(e) =>
                setContent({ ...content, contact: { ...content.contact, phone: e.target.value } })
              }
              className="w-full text-xs rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase mb-1">WhatsApp Number</label>
            <input
              type="text"
              value={content.contact?.whatsapp || ''}
              onChange={(e) =>
                setContent({ ...content, contact: { ...content.contact, whatsapp: e.target.value } })
              }
              className="w-full text-xs rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold uppercase mb-1">Official Email</label>
            <input
              type="email"
              value={content.contact?.email || ''}
              onChange={(e) =>
                setContent({ ...content, contact: { ...content.contact, email: e.target.value } })
              }
              className="w-full text-xs rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase mb-1">Physical Store Address</label>
            <input
              type="text"
              value={content.contact?.address || ''}
              onChange={(e) =>
                setContent({ ...content, contact: { ...content.contact, address: e.target.value } })
              }
              className="w-full text-xs rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
