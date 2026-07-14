import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit3, Trash2, X, Tag } from 'lucide-react';
import Swal from 'sweetalert2';

export default function KelolaKategori() {
  const { token } = useAuth();
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'tambah' | 'edit' | null
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nama: '', deskripsi: '', aktif: true });

  const API = 'http://localhost:9000/api';

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const ambilData = async () => {
    try {
      const res = await fetch(`${API}/categories`, { headers });
      if (res.ok) {
        const data = await res.json();
        setKategori(data);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { ambilData(); }, []);

  const bukaTambah = () => { setEditId(null); setForm({ nama: '', deskripsi: '', aktif: true }); setModal('tambah'); };
  const bukaEdit = (k) => { setEditId(k.id); setForm({ nama: k.nama, deskripsi: k.deskripsi || '', aktif: k.aktif }); setModal('edit'); };
  const tutupModal = () => { setModal(null); setEditId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama.trim()) return Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Nama kategori wajib diisi' });

    const isEdit = modal === 'edit';
    const url = isEdit ? `${API}/categories/${editId}` : `${API}/categories`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: data.message, timer: 1500, showConfirmButton: false });
        tutupModal();
        ambilData();
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: data.error || 'Terjadi kesalahan' });
      }
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Tidak dapat terhubung ke server' });
    }
  };

  const handleHapus = async (id) => {
    const result = await Swal.fire({ icon: 'warning', title: 'Hapus Kategori?', text: 'Kategori tidak bisa dihapus jika masih digunakan oleh menu.', showCancelButton: true, confirmButtonColor: '#dc3545', confirmButtonText: 'Ya, Hapus', cancelButtonText: 'Batal' });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API}/categories/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: data.message, timer: 1500, showConfirmButton: false });
        ambilData();
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: data.error || 'Terjadi kesalahan' });
      }
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Tidak dapat terhubung ke server' });
    }
  };

  const toggleAktif = async (k) => {
    try {
      const res = await fetch(`${API}/categories/${k.id}`, { method: 'PUT', headers, body: JSON.stringify({ ...k, aktif: !k.aktif }) });
      if (res.ok) ambilData();
    } catch (e) { console.warn(e); }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold text-gray-800 uppercase flex items-center gap-2">
          <Tag className="w-5 h-5 text-brand-orange" /> Kelola Kategori
        </h1>
        <button onClick={bukaTambah} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Tambah Kategori
        </button>
      </div>

      <div className="bg-white border border-gray-300 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-gray-300">
              <tr>
                <th className="py-3 px-4 font-semibold text-gray-700 w-12 text-center">No</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Nama Kategori</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Deskripsi</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-4 text-gray-500">Memuat data...</td></tr>
              ) : kategori.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-gray-500">Belum ada kategori.</td></tr>
              ) : (
                kategori.map((k, i) => (
                  <tr key={k.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-center">{i + 1}</td>
                    <td className="py-3 px-4 font-medium">{k.nama}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{k.deskripsi || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => toggleAktif(k)} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${k.aktif ? 'bg-green-50 text-green-700 border-green-300' : 'bg-red-50 text-red-700 border-red-300'}`}>
                        {k.aktif ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-1.5 justify-center">
                        <button onClick={() => bukaEdit(k)} className="p-1.5 border border-gray-300 rounded hover:bg-gray-100"><Edit3 className="w-3.5 h-3.5 text-blue-600" /></button>
                        <button onClick={() => handleHapus(k.id)} className="p-1.5 border border-gray-300 rounded hover:bg-gray-100"><Trash2 className="w-3.5 h-3.5 text-red-600" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={tutupModal}>
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">{modal === 'tambah' ? 'Tambah Kategori' : 'Edit Kategori'}</h3>
              <button onClick={tutupModal} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Nama Kategori</label>
                <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-orange" required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Deskripsi (opsional)</label>
                <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-orange resize-none" rows={2} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="aktif" checked={form.aktif} onChange={(e) => setForm({ ...form, aktif: e.target.checked })} className="accent-brand-orange" />
                <label htmlFor="aktif" className="text-sm text-gray-700">Aktif</label>
              </div>
              <button type="submit" className="btn-primary text-sm py-2.5 w-full">{modal === 'tambah' ? 'Simpan' : 'Update'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
