import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, Trash2, Image as ImageIcon, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

export default function KelolaPromo() {
  const { token } = useAuth();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formBuka, setFormBuka] = useState(false);
  const [promoTerpilih, setPromoTerpilih] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    judul: '', deskripsi: '', kode_promo: '', diskon: '',
    tanggal_mulai: '', tanggal_selesai: '', aktif: true
  });

  useEffect(() => { muatPromo(); }, []);

  const muatPromo = async () => {
    try {
      const res = await fetch('https://power-payee-annex.ngrok-free.dev/api/promo/admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPromos(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Gagal muat promo:', err);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setPromoTerpilih(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData({
      judul: '', deskripsi: '', kode_promo: '', diskon: '',
      tanggal_mulai: '', tanggal_selesai: '', aktif: true
    });
  };

  const handleBukaTambah = () => {
    resetForm();
    setFormBuka(true);
  };

  const handleBukaEdit = (p) => {
    setPromoTerpilih(p);
    setSelectedFile(null);
    setPreviewUrl(p.banner_url ? `https://power-payee-annex.ngrok-free.dev${p.banner_url}` : null);
    setFormData({
      judul: p.judul, deskripsi: p.deskripsi, kode_promo: p.kode_promo,
      diskon: p.diskon.toString(),
      tanggal_mulai: p.tanggal_mulai ? p.tanggal_mulai.split('T')[0] : '',
      tanggal_selesai: p.tanggal_akhir ? p.tanggal_akhir.split('T')[0] : '',
      aktif: p.aktif
    });
    setFormBuka(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleHapusBanner = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSimpanPromo = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append('judul', formData.judul);
    fd.append('deskripsi', formData.deskripsi);
    fd.append('kode_promo', formData.kode_promo);
    fd.append('diskon', formData.diskon);
    fd.append('tanggal_mulai', formData.tanggal_mulai);
    fd.append('tanggal_akhir', formData.tanggal_selesai);
    fd.append('aktif', formData.aktif ? 'true' : 'false');
    if (selectedFile) fd.append('banner', selectedFile);

    const apiURL = promoTerpilih ? `https://power-payee-annex.ngrok-free.dev/api/promo/${promoTerpilih.id}` : 'https://power-payee-annex.ngrok-free.dev/api/promo';
    const apiMethod = promoTerpilih ? 'PUT' : 'POST';

    try {
      const res = await fetch(apiURL, {
        method: apiMethod,
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Gagal menyimpan promo');
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Promo berhasil disimpan!', timer: 1500, showConfirmButton: false });
      setFormBuka(false);
      muatPromo();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.message });
    }
  };

  const handleHapusPromo = async (id) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: 'Promo ini akan dihapus permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`https://power-payee-annex.ngrok-free.dev/api/promo/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Gagal menghapus promo');
          Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Promo telah berhasil dihapus.', timer: 1500, showConfirmButton: false });
          muatPromo();
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Gagal', text: err.message });
        }
      }
    });
  };

  const formatTgl = (tglStr) => {
    if (!tglStr) return '-';
    const d = new Date(tglStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Cek apakah promo sudah kadaluarsa (tanggal_akhir < hari ini)
  const isKadaluarsa = (tglAkhirStr) => {
    if (!tglAkhirStr) return false;
    const akhir = new Date(tglAkhirStr);
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);
    akhir.setHours(0, 0, 0, 0);
    return akhir < hariIni;
  };

  // Cek apakah promo belum dimulai
  const isBelumMulai = (tglMulaiStr) => {
    if (!tglMulaiStr) return false;
    const mulai = new Date(tglMulaiStr);
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);
    mulai.setHours(0, 0, 0, 0);
    return mulai > hariIni;
  };

  const getStatusLabel = (p) => {
    if (isKadaluarsa(p.tanggal_akhir)) return { label: 'Kadaluarsa', cls: 'bg-red-100 text-red-700' };
    if (!p.aktif)                      return { label: 'Nonaktif',   cls: 'bg-gray-100 text-gray-600' };
    if (isBelumMulai(p.tanggal_mulai)) return { label: 'Belum Mulai', cls: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Aktif', cls: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="p-6">
      {formBuka ? (
        <div className="bg-white border border-gray-300 rounded max-w-2xl mx-auto shadow-sm">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-bold text-gray-800 uppercase">{promoTerpilih ? 'Edit Promo' : 'Tambah Promo'}</h2>
            <button onClick={() => setFormBuka(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSimpanPromo} className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Judul Promo</label>
              <input type="text" value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})} className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#0b5345]" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Deskripsi</label>
              <textarea value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#0b5345] resize-none" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Kode Promo</label>
                <input type="text" value={formData.kode_promo} onChange={e => setFormData({...formData, kode_promo: e.target.value.toUpperCase()})} className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#0b5345]" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Diskon (%)</label>
                <input type="number" value={formData.diskon} onChange={e => setFormData({...formData, diskon: e.target.value})} className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#0b5345]" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Tanggal Mulai</label>
                <input type="date" value={formData.tanggal_mulai} onChange={e => setFormData({...formData, tanggal_mulai: e.target.value})} className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#0b5345]" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Tanggal Selesai</label>
                <input type="date" value={formData.tanggal_selesai} onChange={e => setFormData({...formData, tanggal_selesai: e.target.value})} className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#0b5345]" required />
              </div>
            </div>

            {/* Banner Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Banner Promo</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Pilih Gambar
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                {previewUrl && (
                  <button type="button" onClick={handleHapusBanner} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
                    <Trash2 className="w-4 h-4" /> Hapus
                  </button>
                )}
              </div>
              {previewUrl && (
                <div className="mt-3 relative w-full max-w-sm rounded overflow-hidden border border-gray-200">
                  <img src={previewUrl} alt="Preview banner" className="w-full h-32 object-cover" />
                </div>
              )}
              {!previewUrl && (
                <div className="mt-3 w-full max-w-sm h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-sm">
                  <ImageIcon className="w-6 h-6 mr-2" /> Belum ada gambar
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Status Aktif</label>
              <select value={formData.aktif ? 'true' : 'false'} onChange={e => setFormData({...formData, aktif: e.target.value === 'true'})} className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#0b5345]">
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
            <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
              <button type="button" onClick={() => setFormBuka(false)} className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-600 font-semibold hover:bg-gray-50">Batal</button>
              <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded text-sm font-semibold hover:bg-gray-700">Simpan</button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-lg font-bold text-gray-800 uppercase">Kelola Promo</h1>
          </div>

          <div className="bg-white border border-gray-300 rounded overflow-hidden">
            <div className="p-4 border-b border-gray-300 bg-gray-50 flex justify-end items-center">
              <button onClick={handleBukaTambah} className="inline-flex items-center gap-1 border border-gray-800 text-gray-800 bg-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-gray-800 hover:text-white transition-colors">
                <Plus className="w-4 h-4" /> Tambah Promo
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white border-b border-gray-300">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-gray-700 w-12 text-center">No</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Kode Promo</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-center w-24">Banner</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-center">Diskon</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-center">Tanggal Mulai</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-center">Tanggal Akhir</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan="8" className="text-center py-4 text-gray-500">Memuat data...</td></tr>
                  ) : promos.length === 0 ? (
                    <tr><td colSpan="8" className="text-center py-4 text-gray-500">Promo tidak ditemukan.</td></tr>
                  ) : (
                    promos.map((p, index) => {
                      const kadaluarsa = isKadaluarsa(p.tanggal_akhir);
                      const status = getStatusLabel(p);
                      return (
                      <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${kadaluarsa ? 'opacity-60 bg-red-50/30' : ''}`}>
                        <td className="py-3 px-4 text-center text-gray-500">{index + 1}</td>
                        <td className="py-3 px-4">
                          <div>
                            <span className={`font-bold text-sm tracking-wider ${kadaluarsa ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                              {p.kode_promo}
                            </span>
                            <p className="text-[11px] text-gray-400 truncate max-w-[160px]">{p.judul}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {p.banner_url ? (
                            <img src={`https://power-payee-annex.ngrok-free.dev${p.banner_url}`} alt={p.judul} className="w-16 h-10 object-cover rounded border border-gray-200 mx-auto" />
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-orange-600">{p.diskon}%</td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">{formatTgl(p.tanggal_mulai)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-sm font-medium ${kadaluarsa ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
                            {formatTgl(p.tanggal_akhir)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${status.cls}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => handleBukaEdit(p)} 
                              className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded text-xs font-semibold transition-colors shadow-sm"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button 
                              onClick={() => handleHapusPromo(p.id)} 
                              className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded text-xs font-semibold transition-colors shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
