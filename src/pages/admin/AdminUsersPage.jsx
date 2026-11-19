import React, { useState } from 'react';
import { Users, Shield, Plus, CheckCircle2, Trash2 } from 'lucide-react';

const INITIAL_STAFF = [
  {
    id: 'staff-1',
    name: 'Super Administrator',
    email: 'admin@ubanharkalla.com',
    role: 'super_admin',
    is_active: true,
    last_login: 'Just now',
  },
  {
    id: 'staff-2',
    name: 'Store Inventory Manager',
    email: 'inventory@ubanharkalla.com',
    role: 'admin',
    is_active: true,
    last_login: '2 days ago',
  },
];

export default function AdminUsersPage() {
  const [staff, setStaff] = useState(() => {
    const raw = localStorage.getItem('ubh_admin_staff_users');
    return raw ? JSON.parse(raw) : INITIAL_STAFF;
  });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'admin' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.email || !form.name) return;

    const newStaff = {
      id: `staff-${Date.now()}`,
      name: form.name,
      email: form.email,
      role: form.role,
      is_active: true,
      last_login: 'Never',
    };

    const updated = [...staff, newStaff];
    setStaff(updated);
    localStorage.setItem('ubh_admin_staff_users', JSON.stringify(updated));
    setShowModal(false);
    setForm({ name: '', email: '', role: 'admin' });
  };

  const handleToggle = (id) => {
    const updated = staff.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s));
    setStaff(updated);
    localStorage.setItem('ubh_admin_staff_users', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Staff Roles & Permissions</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage administrative personnel, assign roles, and grant dashboard access.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Admin User</span>
        </button>
      </div>

      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-800 bg-slate-950/80">
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Assigned Role</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                      {s.name[0]}
                    </div>
                    <span>{s.name}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-300">{s.email}</td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        s.role === 'super_admin'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}
                    >
                      {s.role.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.is_active ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                      }`}
                    >
                      {s.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {s.role !== 'super_admin' && (
                      <button
                        onClick={() => handleToggle(s.id)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                          s.is_active
                            ? 'text-red-400 hover:bg-slate-900'
                            : 'text-emerald-400 hover:bg-slate-900'
                        }`}
                      >
                        {s.is_active ? 'Revoke Access' : 'Restore Access'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white space-y-4">
            <h3 className="font-bold text-base">Add Administrator Account</h3>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Staff Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Sani Bello"
                  className="w-full text-xs rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. sani@ubanharkalla.com"
                  className="w-full text-xs rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Role & Permissions</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full text-xs rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-white font-bold"
                >
                  <option value="admin">Admin (Orders, Products, Catalog)</option>
                  <option value="super_admin">Super Admin (All Privileges)</option>
                </select>
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
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
