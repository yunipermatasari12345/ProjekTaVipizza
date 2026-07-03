import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ClipboardList, Clock, CheckCircle2, XCircle, Package, Eye, User, Settings, LogOut } from 'lucide-react';

export default function DashboardPelanggan() {
  const { user, token, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || token === "mock_jwt_token_vipizza") return;
    fetch('http://localhost:8080/api/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setData(null);
        setLoading(false);
      });
  }, [token]);

  const labelStatus = (status) => {
    const map = {
      menunggu_pembayaran: 'Menunggu Bayar',
      diproses: 'Diproses',
      sedang_diantar: 'Sedang Diantar',
      selesai: 'Selesai',
      dibatalkan: 'Dibatalkan',
    };
    return map[status] || status;
  };

  const warnaStatus = (status) => {
    const map = {
      menunggu_pembayaran: 'bg-amber-100 text-amber-700',
      diproses: 'bg-blue-100 text-blue-700',
      sedang_diantar: 'bg-purple-100 text-purple-700',
      selesai: 'bg-emerald-100 text-emerald-700',
      dibatalkan: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="page-wrap min-h-screen text-left">
      <div className="mb-8">
        <p className="text-brand-orange font-semibold text-xs uppercase tracking-wider">Dashboard</p>
        <h1 className="page-title mt-1">Halo, {user?.nama?.split(' ')[0] || 'Pelanggan'}!</h1>
        <p className="page-subtitle">Ringkasan aktivitas pemesanan Anda di Vipizza</p>
      </div>

      {/* Ringkasan Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card-fe-white p-5 text-left flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6 text-brand-orange" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">{data?.ringkasan?.total_pesanan || 0}</p>
            <p className="text-xs text-slate-500 font-medium">Total Pesanan</p>
          </div>
        </div>
        <div className="card-fe-white p-5 text-left flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">{data?.ringkasan?.pesanan_diproses || 0}</p>
            <p className="text-xs text-slate-500 font-medium">Sedang Aktif</p>
          </div>
        </div>
        <div className="card-fe-white p-5 text-left flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">{data?.ringkasan?.pesanan_selesai || 0}</p>
            <p className="text-xs text-slate-500 font-medium">Selesai</p>
          </div>
        </div>
        <div className="card-fe-white p-5 text-left flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">{data?.ringkasan?.pesanan_dibatalkan || 0}</p>
            <p className="text-xs text-slate-500 font-medium">Dibatalkan</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Riwayat Pesanan Terbaru */}
        <div className="lg:col-span-8">
          <div className="card-fe-white p-6 text-left">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-brand-orange" />
                Pesanan Terbaru
              </h3>
              <Link to="/riwayat" className="text-xs font-bold text-brand-orange hover:underline">
                Lihat Semua
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-10 text-slate-400 text-sm font-medium">Memuat data...</div>
            ) : data?.pesanan_terbaru?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {data.pesanan_terbaru.map((pes) => (
                  <div key={pes.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-800 text-sm">Pesanan #{pes.id}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(pes.tanggal_pesanan).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                      <span className={`inline-block self-start mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${warnaStatus(pes.status)}`}>
                        {labelStatus(pes.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-brand-orange text-sm">
                        Rp {pes.total_harga?.toLocaleString('id-ID') || 0}
                      </span>
                      <Link
                        to={`/track/${pes.id}`}
                        className="bg-white border border-slate-200 hover:border-brand-orange p-2 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-slate-500" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Belum ada pesanan</p>
                <Link to="/menu" className="text-xs font-bold text-brand-orange hover:underline mt-2 inline-block">
                  Pesan Sekarang
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Info Profil & Quick Actions */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="card-fe-white p-6 text-left">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-brand-orange" />
              Profil Saya
            </h3>
            <div className="flex flex-col gap-2.5 text-sm text-slate-600">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Nama</span>
                <span className="font-semibold text-slate-800">{user?.nama || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Email</span>
                <span className="font-semibold text-slate-800">{user?.email || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Telepon</span>
                <span className="font-semibold text-slate-800">{user?.telepon || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Alamat</span>
                <span className="font-semibold text-slate-800 text-xs">{user?.alamat || '-'}</span>
              </div>
            </div>
          </div>

          <div className="card-fe-white p-6 text-left">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Menu Cepat</h3>
            <div className="flex flex-col gap-2">
              <Link to="/menu" className="flex items-center gap-3 p-3 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors text-sm font-semibold text-slate-700">
                <ShoppingBag className="w-5 h-5 text-brand-orange" />
                Pesan Pizza
              </Link>
              <Link to="/riwayat" className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-sm font-semibold text-slate-700">
                <Clock className="w-5 h-5 text-blue-600" />
                Riwayat Pesanan
              </Link>
              <button onClick={logout} className="flex items-center gap-3 p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors text-sm font-semibold text-red-600 w-full text-left cursor-pointer">
                <LogOut className="w-5 h-5" />
                Keluar Akun
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
