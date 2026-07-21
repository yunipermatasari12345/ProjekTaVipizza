import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

export default function KelolaGaleri() {
  const [galeri, setGaleri] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  
  // State form
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [fileObj, setFileObj] = useState(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    muatGaleri();
  }, []);

  const muatGaleri = async () => {
    try {
      const res = await fetch('https://optimum-setting-incidence-barn.trycloudflare.com/api/galeri');
      const data = await res.json();
      setGaleri(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!fileObj) {
      Swal.fire('Peringatan', 'Mohon pilih gambar/foto terlebih dahulu!', 'warning');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('judul', judul);
    formData.append('deskripsi', deskripsi);
    formData.append('gambar', fileObj);

    try {
      const res = await fetch('https://optimum-setting-incidence-barn.trycloudflare.com/api/galeri', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        Swal.fire('Berhasil', 'Foto berhasil diunggah ke galeri!', 'success');
        setJudul('');
        setDeskripsi('');
        setFileObj(null);
        setPreview('');
        muatGaleri();
      } else {
        Swal.fire('Gagal', 'Gagal mengunggah foto.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Gagal terhubung ke server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleHapus = async (id) => {
    const confirm = await Swal.fire({
      title: 'Hapus foto ini?',
      text: "Foto akan dihapus secara permanen dari galeri publik.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`https://optimum-setting-incidence-barn.trycloudflare.com/api/galeri/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          Swal.fire('Terhapus', 'Foto berhasil dihapus.', 'success');
          muatGaleri();
        } else {
          Swal.fire('Gagal', 'Tidak dapat menghapus foto.', 'error');
        }
      } catch (err) {
        Swal.fire('Error', 'Gagal terhubung ke server', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] animate-in fade-in duration-300 relative">
      <div className="bg-white p-6 shadow-sm border-b border-[#e9ecef] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#212529] font-['Outfit']">Manajemen Galeri</h1>
          <p className="text-[#6c757d] text-sm mt-1">Unggah foto testimoni atau dokumentasi untuk ditampilkan di publik.</p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-y-auto">
        {/* Kolom Kiri: Form Upload */}
        <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-[#e9ecef] h-fit">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-blue-600"/> Unggah Foto Baru</h2>
          <form onSubmit={handleSimpan} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Foto *</label>
              <input 
                type="file" accept="image/*" required
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setFileObj(file);
                    const reader = new FileReader();
                    reader.onloadend = () => setPreview(reader.result);
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full text-sm border p-2 rounded-lg"
              />
              {preview && (
                <div className="mt-3 w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Judul Singkat (Opsional)</label>
              <input 
                type="text" value={judul} onChange={e => setJudul(e.target.value)} 
                className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500" 
                placeholder="Misal: Testimoni Bpk Budi"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Deskripsi (Opsional)</label>
              <textarea 
                value={deskripsi} onChange={e => setDeskripsi(e.target.value)} 
                className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 resize-none h-20" 
                placeholder="Keterangan singkat tentang foto ini..."
              />
            </div>
            <button 
              type="submit" disabled={loading}
              className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4" />
              {loading ? 'Mengunggah...' : 'Unggah Sekarang'}
            </button>
          </form>
        </div>

        {/* Kolom Kanan: Grid Foto Terunggah */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e9ecef]">
            <h2 className="text-lg font-bold mb-4">Galeri Tersimpan ({galeri.length})</h2>
            {galeri.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center text-gray-400">
                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                <p>Belum ada foto galeri.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {galeri.map(item => (
                  <div key={item.id} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-square bg-gray-50">
                    <img 
                      src={`https://optimum-setting-incidence-barn.trycloudflare.com${item.gambar_url}`} 
                      alt={item.judul}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-white font-bold text-sm truncate">{item.judul || 'Tanpa Judul'}</p>
                      <button 
                        onClick={() => handleHapus(item.id)}
                        className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
