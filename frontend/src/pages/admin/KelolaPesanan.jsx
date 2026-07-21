import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';
import { Search, Eye, CheckCircle2, X, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function KelolaPesanan() {
  const { token } = useAuth();
  const [pesananList, setPesananList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalBuka, setModalBuka] = useState(false);
  const [pesananTerpilih, setPesananTerpilih] = useState(null);

  const muatPesanan = useCallback(async () => {
    try {
      const res = await fetch('https://optimum-setting-incidence-barn.trycloudflare.com/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPesananList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Gagal muat pesanan:', err);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { 
    muatPesanan(); 
    const interval = setInterval(() => {
      muatPesanan();
    }, 5000);
    return () => clearInterval(interval);
  }, [muatPesanan]);

  const handleUpdateStatus = async (id, statusBaru) => {
    try {
      const res = await fetch(`https://optimum-setting-incidence-barn.trycloudflare.com/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: statusBaru })
      });
      if (!res.ok) throw new Error('Gagal dari server');
      
      Swal.fire({ icon: 'success', title: 'Berhasil', text: `Status pesanan diubah menjadi ${statusBaru}`, timer: 1500, showConfirmButton: false });
      muatPesanan();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal update status pesanan.' });
      console.warn('Gagal update status:', err);
    }
    setModalBuka(false);
    setPesananTerpilih(null);
  };

  const handleDeletePesanan = async (id) => {
    Swal.fire({
      title: 'Hapus Pesanan?',
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`https://optimum-setting-incidence-barn.trycloudflare.com/api/orders/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            Swal.fire('Terhapus!', 'Data pesanan telah dihapus.', 'success');
            muatPesanan();
          } else {
            Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus.', 'error');
          }
        } catch (err) {
          console.warn('Gagal hapus:', err);
        }
      }
    });
  };

  const getStatusPembayaranBadge = (statusBayar) => {
    switch (statusBayar?.toLowerCase()) {
      case 'lunas':
        return <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200 shadow-sm">Lunas</span>;
      case 'belum_dibayar':
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-1 rounded-full border border-yellow-200 shadow-sm">Belum Dibayar</span>;
      case 'gagal':
        return <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200 shadow-sm">Gagal</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">{statusBayar || 'Belum Dibayar'}</span>;
    }
  };

  const getStatusPesananBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'menunggu_pembayaran':
        return <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200">Menunggu Pembayaran</span>;
      case 'menunggu_validasi':
        return <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-1 rounded-full border border-orange-200 animate-pulse">Menunggu Validasi</span>;
      case 'diproses':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200">Diproses (Masak)</span>;
      case 'dikirim':
        return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-200">Dikirim</span>;
      case 'selesai':
        return <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">Selesai</span>;
      case 'dibatalkan':
        return <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">Dibatalkan</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200">{status || 'Diproses'}</span>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Kelola Pesanan</h1>
      </div>

      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr>
                <th className="py-3 px-4 font-semibold text-gray-700 w-12 text-center">No</th>
                <th className="py-3 px-4 font-semibold text-gray-700">No. Pesanan</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Pelanggan</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-right">Total</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-center">Status Bayar</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-center">Status Pesanan</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-center w-64">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-8 text-gray-500">Memuat data...</td></tr>
              ) : pesananList.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-gray-500">Tidak ada pesanan.</td></tr>
              ) : (
                pesananList.map((p, index) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-center text-gray-600">{index + 1}</td>
                    <td className="py-4 px-4 font-semibold text-gray-800">#VFZ{p.id.toString().padStart(6, '0')}</td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-800">{p.nama_penerima || p.pengguna?.nama || 'Anonim'}</div>
                      <div className="text-xs text-gray-500">{p.telepon}</div>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-gray-800">Rp {(p.total_harga || p.total || 0).toLocaleString('id-ID')}</td>
                    <td className="py-4 px-4 text-center">{getStatusPembayaranBadge(p.status_pembayaran)}</td>
                    <td className="py-4 px-4 text-center">{getStatusPesananBadge(p.status)}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {/* Edit (Sebenarnya Detail & Status) */}
                        <button 
                          onClick={() => { setPesananTerpilih(p); setModalBuka(true); }}
                          className="inline-flex bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold transition-colors items-center gap-1"
                          title="Edit Status & Lihat Detail"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>

                        {/* Hapus */}
                        <button 
                          onClick={() => handleDeletePesanan(p.id)}
                          className="inline-flex bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold transition-colors items-center gap-1"
                          title="Hapus Pesanan secara Permanen"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>

                        {/* Quick Actions berdasarkan Status */}
                        {p.status === 'menunggu_pembayaran' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'diproses')}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors shadow-sm"
                            >
                              Proses
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'dibatalkan')}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-semibold transition-colors"
                            >
                              Batal
                            </button>
                          </>
                        )}

                        {p.status === 'menunggu_validasi' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'diproses')}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors shadow-sm"
                            >
                              Terima
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'dibatalkan')}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-semibold transition-colors"
                            >
                              Tolak
                            </button>
                          </>
                        )}

                        {p.status === 'diproses' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'dikirim')}
                              className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold transition-colors shadow-sm"
                            >
                              Kirim
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'dibatalkan')}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-semibold transition-colors"
                            >
                              Batal
                            </button>
                          </>
                        )}

                        {p.status === 'dikirim' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'selesai')}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition-colors shadow-sm"
                            >
                              Selesai
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'dibatalkan')}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-semibold transition-colors"
                            >
                              Batal
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer / Pagination */}
        <div className="p-4 border-t border-gray-300 flex justify-between items-center bg-gray-50">
          <span className="text-xs text-gray-500">Menampilkan 1 - {pesananList.length} data</span>
          <div className="flex gap-1">
            <button className="border border-gray-300 px-2 py-1 bg-white text-gray-600 rounded text-xs">&lt;</button>
            <button className="border border-gray-300 px-2 py-1 bg-white text-gray-600 rounded text-xs">1</button>
            <span className="px-1 text-gray-400">...</span>
            <button className="border border-gray-300 px-2 py-1 bg-white text-gray-600 rounded text-xs">&gt;</button>
          </div>
        </div>
      </div>

      {/* Modal Detail & Validasi */}
      {modalBuka && pesananTerpilih && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 transform transition-all">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-800 text-base">Detail Pesanan #VFZ{pesananTerpilih.id.toString().padStart(6, '0')}</h3>
                <p className="text-[10px] text-gray-500">Dibuat pada: {new Date(pesananTerpilih.created_at || pesananTerpilih.tanggal_pesanan).toLocaleString('id-ID')}</p>
              </div>
              <button onClick={() => { setModalBuka(false); setPesananTerpilih(null); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4">
              {/* Pelanggan */}
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Pelanggan</p>
                <div className="bg-gray-50 rounded p-3 border border-gray-200/60">
                  <p className="text-sm font-bold text-gray-800">{pesananTerpilih.nama_penerima || pesananTerpilih.pengguna?.nama || 'Anonim'}</p>
                  <p className="text-xs text-gray-600 mt-0.5">WhatsApp: {pesananTerpilih.telepon}</p>
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed bg-white p-2 rounded border border-gray-100">{pesananTerpilih.alamat_pengiriman}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Daftar Menu yang Dipesan</p>
                <div className="border border-gray-200 rounded divide-y divide-gray-100">
                  {pesananTerpilih.item_pesanan && pesananTerpilih.item_pesanan.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm p-3 hover:bg-gray-50/50 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">{item.menu?.nama || 'Menu'}</span>
                        <span className="text-xs text-gray-500">{item.jumlah} pcs x Rp {(item.harga || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <span className="font-bold text-gray-700 align-middle my-auto">Rp {((item.harga || 0) * item.jumlah).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bukti Transfer */}
              {pesananTerpilih.bukti_pembayaran && (
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Bukti Transfer Bank</p>
                  <div className="bg-gray-50 border border-gray-200 rounded p-2 text-center">
                    <a 
                      href={getImageUrl(pesananTerpilih.bukti_pembayaran)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block relative group"
                    >
                      <img 
                        src={getImageUrl(pesananTerpilih.bukti_pembayaran)} 
                        alt="Bukti Transfer" 
                        className="max-h-48 rounded border border-gray-200 shadow-sm object-contain mx-auto group-hover:opacity-90 transition-opacity"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=Bukti+Gagal+Dimuat'; }}
                      />
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded font-bold">Buka Gambar Asli ↗</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="font-bold text-gray-800">Total Pembayaran</span>
                <span className="font-extrabold text-[#8B3A0F] text-xl">Rp {(pesananTerpilih.total_harga || pesananTerpilih.total || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2 justify-end">
              {pesananTerpilih.status === 'menunggu_pembayaran' && (
                <>
                  <button onClick={() => handleUpdateStatus(pesananTerpilih.id, 'diproses')} className="bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-blue-700 shadow-sm transition-colors">
                    Terima & Proses (Lunas)
                  </button>
                  <button onClick={() => handleUpdateStatus(pesananTerpilih.id, 'dibatalkan')} className="bg-white border border-red-500 text-red-500 px-4 py-2 rounded text-xs font-bold hover:bg-red-50 transition-colors">
                    Batalkan
                  </button>
                </>
              )}

              {pesananTerpilih.status === 'menunggu_validasi' && (
                <>
                  <button onClick={() => handleUpdateStatus(pesananTerpilih.id, 'diproses')} className="bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-blue-700 shadow-sm transition-colors">
                    Validasi & Terima (Lunas)
                  </button>
                  <button onClick={() => handleUpdateStatus(pesananTerpilih.id, 'dibatalkan')} className="bg-white border border-red-500 text-red-500 px-4 py-2 rounded text-xs font-bold hover:bg-red-50 transition-colors">
                    Tolak Pembayaran
                  </button>
                </>
              )}

              {pesananTerpilih.status === 'diproses' && (
                <>
                  <button onClick={() => handleUpdateStatus(pesananTerpilih.id, 'dikirim')} className="bg-purple-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-purple-700 shadow-sm transition-colors">
                    Kirim Pesanan
                  </button>
                  <button onClick={() => handleUpdateStatus(pesananTerpilih.id, 'dibatalkan')} className="bg-white border border-red-500 text-red-500 px-4 py-2 rounded text-xs font-bold hover:bg-red-50 transition-colors">
                    Batalkan
                  </button>
                </>
              )}

              {pesananTerpilih.status === 'dikirim' && (
                <>
                  <button onClick={() => handleUpdateStatus(pesananTerpilih.id, 'selesai')} className="bg-green-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-green-700 shadow-sm transition-colors">
                    Selesaikan Pesanan
                  </button>
                  <button onClick={() => handleUpdateStatus(pesananTerpilih.id, 'dibatalkan')} className="bg-white border border-red-500 text-red-500 px-4 py-2 rounded text-xs font-bold hover:bg-red-50 transition-colors">
                    Batalkan
                  </button>
                </>
              )}              {(pesananTerpilih.status === 'selesai' || pesananTerpilih.status === 'dibatalkan') && (
                <button onClick={() => { setModalBuka(false); setPesananTerpilih(null); }} className="bg-gray-800 text-white px-4 py-2 rounded text-xs font-bold hover:bg-gray-900 transition-colors">
                  Tutup
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
