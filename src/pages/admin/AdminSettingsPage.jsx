import React, { useState, useEffect } from 'react';
import { getBusinessSettings, saveBusinessSettings } from '../../services/dataService';
import { Settings, Save, CheckCircle2, Music, Image as ImageIcon } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    async function load() {
      const s = await getBusinessSettings();
      setSettings(s);
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    await saveBusinessSettings(settings);
    setSavedMsg('General settings saved successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white">General Store Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure business brand identity, currency, and background audio parameters.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Brand Details Card */}
        <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
          <h3 className="font-bold text-base text-white pb-3 border-b border-slate-800">
            Brand Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold uppercase mb-1">Business Name</label>
              <input
                type="text"
                value={settings.storeName || ''}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full text-xs font-bold rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase mb-1">Currency Symbol</label>
              <input
                type="text"
                value={settings.currency || '₦'}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full text-xs font-bold rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-emerald-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold uppercase mb-1">Official Logo File Path</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings.logoUrl || '/Logo.jpg'}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  className="w-full text-xs font-mono rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-emerald-400"
                />
                <img src={settings.logoUrl || '/Logo.jpg'} alt="" className="w-10 h-10 rounded-xl object-contain border border-slate-700 shrink-0" />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase mb-1">Brand Audio Asset Path</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings.audioUrl || '/UBAN HARKALLA MP3.mp3'}
                  onChange={(e) => setSettings({ ...settings, audioUrl: e.target.value })}
                  className="w-full text-xs font-mono rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-emerald-400"
                />
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Music className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Store Settings</span>
        </button>

      </form>
    </div>
  );
}
