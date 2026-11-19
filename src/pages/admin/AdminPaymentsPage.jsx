import React, { useState, useEffect } from 'react';
import { getBusinessSettings, saveBusinessSettings } from '../../services/dataService';
import { CreditCard, Building, ShieldCheck, CheckCircle2, Save } from 'lucide-react';

export default function AdminPaymentsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedMsg, setSavedMsg] = useState('');

  const load = async () => {
    const s = await getBusinessSettings();
    setSettings(s);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    await saveBusinessSettings(settings);
    setSavedMsg('Payment settings saved successfully!');
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
        <h1 className="text-2xl font-black text-white">Payment Methods & Banking</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure active customer payment gateways, bank accounts, and checkout rules.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Paystack Integration */}
        <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Paystack Gateway</h3>
                <p className="text-xs text-slate-400">Debit cards, USSD, Apple Pay, and automated Nigerian bank transfers.</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
              <input
                type="checkbox"
                checked={settings.paystackEnabled !== false}
                onChange={(e) => setSettings({ ...settings, paystackEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
              />
              <span>Enabled</span>
            </label>
          </div>

          <div className="text-xs text-slate-400">
            <p className="leading-relaxed">
              Paystack credentials are securely bound to backend environment variables (<code className="text-emerald-400">VITE_PAYSTACK_PUBLIC_KEY</code> and server secret key).
            </p>
          </div>
        </div>

        {/* Bank Transfer Details */}
        <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Direct Bank Transfer</h3>
                <p className="text-xs text-slate-400">Business account details presented to customers during checkout.</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
              <input
                type="checkbox"
                checked={settings.bankTransferEnabled !== false}
                onChange={(e) => setSettings({ ...settings, bankTransferEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
              />
              <span>Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold uppercase mb-1">Bank Name</label>
              <input
                type="text"
                value={settings.bankDetails?.bankName || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bankDetails: { ...settings.bankDetails, bankName: e.target.value },
                  })
                }
                className="w-full text-xs rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase mb-1">Account Number</label>
              <input
                type="text"
                value={settings.bankDetails?.accountNumber || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bankDetails: { ...settings.bankDetails, accountNumber: e.target.value },
                  })
                }
                className="w-full text-xs font-mono font-bold rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-bold uppercase mb-1">Account Name</label>
            <input
              type="text"
              value={settings.bankDetails?.accountName || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  bankDetails: { ...settings.bankDetails, accountName: e.target.value },
                })
              }
              className="w-full text-xs font-bold rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-bold uppercase mb-1">Customer Transfer Instructions</label>
            <textarea
              rows={2}
              value={settings.bankDetails?.instruction || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  bankDetails: { ...settings.bankDetails, instruction: e.target.value },
                })
              }
              className="w-full text-xs rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white"
            ></textarea>
          </div>
        </div>

        {/* Pay on Delivery */}
        <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-base text-white">Pay on Delivery (Cash / POS)</h3>
              <p className="text-xs text-slate-400">Allow customers to pay upon receiving their items in Kano.</p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
              <input
                type="checkbox"
                checked={settings.payOnDeliveryEnabled !== false}
                onChange={(e) => setSettings({ ...settings, payOnDeliveryEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
              />
              <span>Enabled</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Payment Configurations</span>
        </button>

      </form>
    </div>
  );
}
