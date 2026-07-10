import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Eye, X, Phone, Mail, MapPin, ShoppingBag } from 'lucide-react';

export default function DataPelanggan() {
  const { token } = useAuth();
  const [pelangganList, setPelangganList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [detail, setDetail] = useState(null);
  const [riwayat, setRiwayat] = useState([]);

  const API = 'http://localhost:8080/api';
  const headers = { 'Authorization': `Bearer ${token}` };

  useEffect(() => {
    const ambilData = async () => {
      try {
        const res = await fetch(`${API}/users`, { headers });
        if (res.ok) {
          const data = await res.json();
          setPelangganList(data);
        }
      } catch (e) {
        console.warn('Gagal ambil data pelanggan:', e);
      } finally {
        setLoading(false);
      }
    };
    ambilData();
  }, []);

  const lihatDetail = async (id) => {
    try {
      const res = await fetch(`${API}/users/${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setDetail(data.pelanggan);
        setRiwayat(data.riwayat || []);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const filteredData = pelangganList.filter(p =>
    p.nama?.toLowerCase().includes(searchQ.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const formatRp = (v) => `Rp ${(v || 0).toLocaleString('id-ID')}`;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold text-gray-800 uppercase">Data Pelanggan</h1>
      </div>

      <div className="bg-white border border-gray-300 rounded overflow-hidden">
        <div className="p-4 border-b border-gray-300 bg-gray-50">
          <div className="relative w-64">
            <input type="text" placeholder="Cari pelanggan..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} className="w-full border border-gray-300 rounded pl-3 pr-8 py-1.5 text-sm outline-none focus:border-[#0b5345]" />
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-gray-300">
              <tr>
                <th className="py-3 px-4 font-semibold text-gray-700 w-12 text-center">No</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Nama</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="py-3 px-4 font-semibold text-gray-700">No. HP</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Alamat</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-center">Tergabung</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4 text-gray-500">Memuat data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-gray-500">Tidak ada pelanggan.</td></tr>
              ) : (
                filteredData.map((p, i) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-center">{i + 1}</td>
                    <td className="py-3 px-4 font-medium">{p.nama}</td>
                    <td className="py-3 px-4">{p.email}</td>
                    <td className="py-3 px-4">{p.telepon || '-'}</td>
                    <td className="py-3 px-4 text-xs text-gray-500 max-w-[200px] truncate">{p.alamat || '-'}</td>
                    <td className="py-3 px-4 text-center text-xs text-gray-500">{p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => lihatDetail(p.id)} className="p-1.5 border border-gray-300 rounded hover:bg-gray-100" title="Detail">
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-orange" /> Detail Pelanggan
              </h3>
              <button onClick={() => setDetail(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-brand-orange text-white flex items-center justify-center text-lg font-bold">
                {detail.nama?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-bold text-gray-800">{detail.nama}</p>
                <p className="text-xs text-gray-500">{detail.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm mb-4">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> <span>{detail.telepon || '-'}</span></div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> <span>{detail.email}</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> <span>{detail.alamat || '-'}</span></div>
            </div>

            {/* Riwayat Transaksi */}
            <div>
              <h4 className="font-bold text-gray-700 text-sm flex items-center gap-1.5 mb-3">
                <ShoppingBag className="w-4 h-4 text-brand-orange" /> Riwayat Transaksi ({riwayat.length})
              </h4>
              {riwayat.length === 0 ? (
                <p className="text-xs text-gray-400">Belum ada transaksi.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {riwayat.map((r) => (
                    <div key={r.id} className="border border-gray-200 rounded-lg p-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-700">#{r.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === 'selesai' ? 'bg-green-50 text-green-700' : r.status === 'diproses' ? 'bg-blue-50 text-blue-700' : r.status === 'dikirim' ? 'bg-purple-50 text-purple-700' : 'bg-yellow-50 text-yellow-700'}`}>{r.status}</span>
                      </div>
                      <div className="flex justify-between mt-1 text-gray-500">
                        <span>{new Date(r.tanggal_pesanan || r.created_at).toLocaleDateString('id-ID')}</span>
                        <span className="font-bold text-gray-700">{formatRp(r.total_harga)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
