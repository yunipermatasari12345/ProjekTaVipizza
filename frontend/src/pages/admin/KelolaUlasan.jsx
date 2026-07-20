import React, { useState, useEffect } from 'react';
import { Trash2, Star, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';
import Swal from 'sweetalert2';

export default function KelolaUlasan() {
  const { token } = useAuth();
  const [ulasan, setUlasan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    muatUlasan();
  }, []);

  const muatUlasan = async () => {
    try {
      const res = await fetch('https://power-payee-annex.ngrok-free.dev/api/ulasan', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUlasan(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Gagal memuat ulasan:', err);
    } finally {
      setLoading(false);
    }
  };

  const hapusUlasan = async (id) => {
    Swal.fire({
      title: 'Hapus Ulasan?',
      text: 'Ulasan ini akan dihapus secara permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`https://power-payee-annex.ngrok-free.dev/api/ulasan/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Gagal menghapus ulasan');
          
          // AUTO REFRESH INSTAN DI TAMPILAN
          setUlasan(prevUlasan => prevUlasan.filter(item => item.id !== id));

          Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Ulasan berhasil dihapus secara otomatis.',
            timer: 1500,
            showConfirmButton: false
          });
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Gagal', text: err.message });
        }
      }
    });
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
    ));
  };

  // Filter pencarian
  const filteredUlasan = ulasan.filter(u => {
    const namaMenu = u.menu?.nama?.toLowerCase() || '';
    const namaUser = (u.pengguna?.nama || u.nama_publik || '').toLowerCase();
    const komentar = (u.komentar || '').toLowerCase();
    const cari = searchTerm.toLowerCase();
    return namaMenu.includes(cari) || namaUser.includes(cari) || komentar.includes(cari);
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold text-gray-800 uppercase">Data Ulasan Pelanggan</h1>
      </div>

      <div className="bg-white border border-gray-300 rounded overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-300 bg-gray-50 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-600">
            Total Ulasan: {ulasan.length}
          </span>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Cari komentar atau menu..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#0b5345] w-64"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-gray-300">
              <tr>
                <th className="py-3 px-4 font-semibold text-gray-700 w-12 text-center">No</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Pelanggan</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Menu Pizza</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-center">Rating</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Komentar / Ulasan</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-center">Tanggal</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-6 text-gray-500">Memuat data ulasan...</td></tr>
              ) : filteredUlasan.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-6 text-gray-500">Tidak ada ulasan ditemukan.</td></tr>
              ) : (
                filteredUlasan.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-800">
                        {item.pengguna?.nama || item.nama_publik || 'Anonim'}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {item.pengguna_id ? 'Member' : 'Publik'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {item.menu?.gambar_url && (
                          <img src={getImageUrl(item.menu.gambar_url)} alt="Menu" className="w-8 h-8 rounded object-cover" />
                        )}
                        <span className="font-medium text-gray-700">{item.menu?.nama || 'Menu Dihapus'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {renderStars(item.rating)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-600 text-sm italic max-w-xs break-words">
                        "{item.komentar || 'Tidak ada komentar'}"
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => hapusUlasan(item.id)}
                        className="inline-flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-2.5 py-1.5 rounded text-xs font-semibold transition-colors border border-red-200"
                        title="Hapus Ulasan Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
