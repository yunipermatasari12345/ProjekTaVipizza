import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Save, Lock, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Profil() {
  const { user, token, updateUser } = useAuth();
  const API = 'https://power-payee-annex.ngrok-free.dev/api';
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const [form, setForm] = useState({ nama: user?.nama || '', telepon: user?.telepon || '', alamat: user?.alamat || '' });
  const [loading, setLoading] = useState(false);

  const [pwForm, setPwForm] = useState({ password_lama: '', password_baru: '', konfirmasi: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const handleUpdateProfil = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/me`, { method: 'PUT', headers, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: data.message, timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: data.error || 'Terjadi kesalahan' });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Tidak dapat terhubung ke server' });
    } finally {
      setLoading(false);
    }
  };

  const handleGantiPassword = async (e) => {
    e.preventDefault();
    if (pwForm.password_baru !== pwForm.konfirmasi) {
      return Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Password baru tidak cocok' });
    }
    if (pwForm.password_baru.length < 6) {
      return Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Password baru minimal 6 karakter' });
    }
    setPwLoading(true);
    try {
      const res = await fetch(`${API}/auth/change-password`, { method: 'PUT', headers, body: JSON.stringify({ password_lama: pwForm.password_lama, password_baru: pwForm.password_baru }) });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: data.message, timer: 1500, showConfirmButton: false });
        setPwForm({ password_lama: '', password_baru: '', konfirmasi: '' });
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: data.error || 'Terjadi kesalahan' });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Tidak dapat terhubung ke server' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-lg font-bold text-gray-800 uppercase flex items-center gap-2 mb-6">
        <User className="w-5 h-5 text-brand-orange" /> Profil Admin
      </h1>

      {/* Info Profil */}
      <div className="bg-white border border-gray-300 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-orange text-white flex items-center justify-center text-2xl font-bold">
            {user?.nama?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{user?.nama}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{user?.peran}</span>
          </div>
        </div>

        <form onSubmit={handleUpdateProfil} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Nama Lengkap</label>
              <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Email</label>
              <input type="email" value={user?.email || ''} disabled className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">No. Telepon</label>
            <input type="text" value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-orange" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Alamat</label>
            <textarea value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-orange resize-none" rows={2} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary text-sm py-2.5 w-full sm:w-auto px-8 flex items-center gap-2 justify-center">
            <Save className="w-4 h-4" /> {loading ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>
      </div>

      {/* Ganti Password */}
      <div className="bg-white border border-gray-300 rounded-xl p-6">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-brand-orange" /> Ganti Password
        </h3>
        <form onSubmit={handleGantiPassword} className="flex flex-col gap-4 max-w-md">
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Password Lama</label>
            <div className="relative">
              <input type={showOldPw ? 'text' : 'password'} value={pwForm.password_lama} onChange={(e) => setPwForm({ ...pwForm, password_lama: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-orange pr-10" required />
              <button type="button" onClick={() => setShowOldPw(!showOldPw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Password Baru</label>
            <div className="relative">
              <input type={showNewPw ? 'text' : 'password'} value={pwForm.password_baru} onChange={(e) => setPwForm({ ...pwForm, password_baru: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-orange pr-10" required />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Konfirmasi Password Baru</label>
            <div className="relative">
              <input type={showConfirmPw ? 'text' : 'password'} value={pwForm.konfirmasi} onChange={(e) => setPwForm({ ...pwForm, konfirmasi: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-orange pr-10" required />
              <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={pwLoading} className="btn-primary text-sm py-2.5 w-full sm:w-auto px-8 flex items-center gap-2 justify-center bg-slate-700 hover:bg-slate-600">
            <Lock className="w-4 h-4" /> {pwLoading ? 'Mengganti...' : 'Ganti Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
