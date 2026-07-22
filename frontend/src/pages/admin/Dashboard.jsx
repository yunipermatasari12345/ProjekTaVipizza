import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  DollarSign, ClipboardList, Package, Users, Tag, Clock, Eye, X,
  Search, RefreshCw, ShoppingBag, CheckCircle2, TrendingUp, Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';

const STATUS_CONFIG = {
  menunggu_pembayaran: { label: 'Menunggu Bayar', color: '#ffc107', bg: '#fff8e1', text: '#856404' },
  menunggu_validasi: { label: 'Menunggu Validasi', color: '#ffc107', bg: '#fff8e1', text: '#856404' },
  diproses:         { label: 'Diproses', color: '#0d6efd', bg: '#e7f1ff', text: '#0a58ca' },
  dikirim:          { label: 'Dikirim',  color: '#6f42c1', bg: '#f3edff', text: '#5a32a3' },
  selesai:          { label: 'Selesai',  color: '#198754', bg: '#d1e7dd', text: '#0a5432' },
  dibatalkan:       { label: 'Dibatalkan', color: '#dc3545', bg: '#f8d7da', text: '#842029' },
};

export default function Dashboard() {
  const { token } = useAuth();
  const API = 'http://localhost:9000/api';
  const headers = { 'Authorization': `Bearer ${token}` };

  const [summary, setSummary] = useState(null);
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('semua');
  const [searchQ, setSearchQ] = useState('');
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    ambilData();
    const interval = setInterval(ambilData, 5000);
    return () => clearInterval(interval);
  }, []);

  const ambilData = async () => {
    setLoading(true);
    try {
      const [sumRes, ordRes] = await Promise.all([
        fetch(`${API}/reports/summary`, { headers }),
        fetch(`${API}/orders`, { headers }),
      ]);
      if (sumRes.ok) setSummary(await sumRes.json());
      if (ordRes.ok) setPesanan(await ordRes.json());
    } catch (e) {
      console.warn('Gagal ambil data dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, statusBaru) => {
    try {
      const res = await fetch(`${API}/orders/${id}/status`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusBaru }),
      });
      if (res.ok) {
        setDetail(null);
        ambilData();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal update status');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Hapus Pesanan?',
      text: `Yakin ingin menghapus pesanan #${id}? Data yang dihapus tidak bisa dikembalikan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API}/orders/${id}`, {
            method: 'DELETE',
            headers
          });
          if (res.ok) {
            Swal.fire('Terhapus!', 'Data pesanan telah dihapus.', 'success');
            ambilData();
          } else {
            const data = await res.json();
            Swal.fire('Gagal!', data.error || 'Gagal menghapus pesanan', 'error');
          }
        } catch (e) {
          console.warn(e);
          Swal.fire('Error!', 'Terjadi kesalahan saat menghapus pesanan', 'error');
        }
      }
    });
  };

  const formatRp = (v) => `Rp ${(v || 0).toLocaleString('id-ID')}`;
  const formatTgl = (t) => t ? new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

  const filteredPesanan = pesanan.filter(p => {
    if (filterStatus !== 'semua' && p.status !== filterStatus) return false;
    if (searchQ && !p.id?.toString().includes(searchQ) && !p.alamat_pengiriman?.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const statCards = [
    { icon: ShoppingBag, label: 'Total Pesanan', value: summary?.total_pesanan || 0, iconBg: '#e7f1ff', iconColor: '#0d6efd' },
    { icon: Package, label: 'Total Menu', value: summary?.total_menu || 0, iconBg: '#fff3cd', iconColor: '#ffc107' },
    { icon: Users, label: 'Total Pelanggan', value: summary?.total_pelanggan || 0, iconBg: '#d1e7dd', iconColor: '#198754' },
    { icon: DollarSign, label: 'Total Penjualan', value: formatRp(summary?.total_penjualan || 0), iconBg: '#e7f1ff', iconColor: '#0d6efd' },
    { icon: Tag, label: 'Promo Aktif', value: summary?.promo_aktif || 0, iconBg: '#f3edff', iconColor: '#6f42c1' },
    { icon: Clock, label: 'Menunggu Diproses', value: summary?.menunggu_diproses || 0, iconBg: '#fff8e1', iconColor: '#ffc107' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold text-gray-800 uppercase">Dashboard</h1>
        <button onClick={ambilData} className="border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.iconBg }}>
                <card.icon className="w-5 h-5" style={{ color: card.iconColor }} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">{card.label}</p>
                <p className="font-extrabold text-gray-800 text-sm mt-0.5">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daftar Pesanan */}
      <div className="bg-white border border-gray-300 rounded overflow-hidden">
        <div className="p-4 border-b border-gray-300 bg-gray-50 flex flex-wrap gap-3 items-center">
          <div className="relative w-56">
            <input type="text" placeholder="Cari ID atau alamat..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} className="w-full border border-gray-300 rounded pl-3 pr-8 py-1.5 text-sm outline-none focus:border-brand-orange" />
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {['semua', 'menunggu_pembayaran', 'menunggu_validasi', 'diproses', 'dikirim', 'selesai', 'dibatalkan'].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded border ${filterStatus === s ? 'bg-brand-orange text-white border-brand-orange' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
                {s === 'semua' ? 'Semua' : (STATUS_CONFIG[s]?.label || s)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-gray-300">
              <tr>
                <th className="py-3 px-4 font-semibold text-gray-700 w-14 text-center">No</th>
                <th className="py-3 px-4 font-semibold text-gray-700">ID Pesanan</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Pelanggan</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Total</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-center">Metode</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-8 text-gray-400">Memuat data...</td></tr>
              ) : filteredPesanan.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-gray-400">Tidak ada pesanan.</td></tr>
              ) : (
                filteredPesanan.slice(0, 20).map((p, i) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-center">{i + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-xs">#{p.id}</td>
                    <td className="py-3 px-4">{p.pengguna?.nama || '-'}</td>
                    <td className="py-3 px-4 font-bold">{formatRp(p.total_harga)}</td>
                    <td className="py-3 px-4 text-center text-[10px] uppercase font-bold">{p.metode_pembayaran || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: STATUS_CONFIG[p.status]?.bg || '#f1f5f9', color: STATUS_CONFIG[p.status]?.text || '#475569' }}>
                        {STATUS_CONFIG[p.status]?.label || p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => setDetail(p)} className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 text-blue-600" title="Detail"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 border border-gray-300 rounded hover:bg-red-50 text-red-600" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
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
              <h3 className="font-bold text-gray-800">Detail Pesanan #{detail.id}</h3>
              <button onClick={() => setDetail(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex flex-col gap-3 text-sm mb-4">
              <div className="flex justify-between"><span className="text-gray-500">Pelanggan</span><span className="font-bold">{detail.pengguna?.nama || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Telepon</span><span>{detail.telepon || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tanggal</span><span>{formatTgl(detail.tanggal_pesanan)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Metode Bayar</span><span className="text-[10px] font-bold uppercase">{detail.metode_pembayaran || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: STATUS_CONFIG[detail.status]?.bg || '#f1f5f9', color: STATUS_CONFIG[detail.status]?.text || '#475569' }}>
                  {STATUS_CONFIG[detail.status]?.label || detail.status}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-gray-500">Alamat</span><span className="text-right max-w-[250px]">{detail.alamat_pengiriman || '-'}</span></div>
            </div>

            {detail.bukti_pembayaran && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-600 mb-1">Bukti Pembayaran</p>
                <img src={detail.bukti_pembayaran.startsWith('http') ? detail.bukti_pembayaran : `http://localhost:9000${detail.bukti_pembayaran}`} alt="Bukti" className="w-full max-h-48 object-contain rounded-lg border border-gray-200" />
              </div>
            )}

            {detail.item_pesanan?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-600 mb-2">Item Pesanan</p>
                {detail.item_pesanan.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm border-b border-gray-100 py-1.5 last:border-0">
                    <span>{item.menu?.nama || 'Menu'} x{item.jumlah}</span>
                    <span className="font-bold">{formatRp(item.harga * item.jumlah)}</span>
                  </div>
                ))}
                
                {(() => {
                    const subtotal = detail.item_pesanan.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
                    const diskon = detail.diskon || 0;
                    const ongkir = detail.total_harga + diskon - subtotal;
                    return (
                      <div className="mt-2 pt-2 border-t border-gray-100 text-sm">
                        <div className="flex justify-between py-1">
                            <span className="text-gray-500">Subtotal</span>
                            <span>{formatRp(subtotal)}</span>
                        </div>
                        {ongkir > 0 && (
                          <div className="flex justify-between py-1">
                              <span className="text-gray-500">Ongkos Kirim</span>
                              <span>{formatRp(ongkir)}</span>
                          </div>
                        )}
                        {diskon > 0 && (
                          <div className="flex justify-between py-1 text-green-600">
                              <span>Diskon {detail.kode_promo ? `(${detail.kode_promo})` : ''}</span>
                              <span>-{formatRp(diskon)}</span>
                          </div>
                        )}
                      </div>
                    );
                })()}

                <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-gray-200">
                  <span>Total Akhir</span><span className="text-orange-600">{formatRp(detail.total_harga)}</span>
                </div>
              </div>
            )}

            {/* Tombol Aksi */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
              {detail.status === 'menunggu_pembayaran' && (
                <button onClick={() => handleStatus(detail.id, 'diproses')} className="btn-primary text-xs py-2 px-4 flex-1">Proses Pesanan</button>
              )}
              {detail.status === 'menunggu_validasi' && (
                <>
                  <button onClick={() => handleStatus(detail.id, 'diproses')} className="btn-primary text-xs py-2 px-4 flex-1">Setuju & Proses</button>
                  <button onClick={() => handleStatus(detail.id, 'dibatalkan')} className="bg-red-500 text-white text-xs py-2 px-4 rounded-lg hover:bg-red-600 flex-1">Tolak</button>
                </>
              )}
              {detail.status === 'diproses' && (
                <button onClick={() => handleStatus(detail.id, 'dikirim')} className="btn-primary text-xs py-2 px-4 flex-1">Tandai Dikirim</button>
              )}
              {detail.status === 'dikirim' && (
                <button onClick={() => handleStatus(detail.id, 'selesai')} className="btn-primary text-xs py-2 px-4 flex-1">Tandai Selesai</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
