import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';
import {
  ShoppingBag, Clock, CheckCircle2, Pizza, ChevronRight,
  RefreshCw, MapPin, Phone, User, Star, Sparkles, Tag,
  Flame, ArrowRight, Package, Zap, TrendingUp
} from 'lucide-react';

const STATUS_CONFIG = {
  menunggu_pembayaran: { label: 'Menunggu Bayar',  color: '#f59e0b', bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  menunggu_validasi:   { label: 'Validasi Admin',   color: '#8b5cf6', bg: '#ede9fe', text: '#5b21b6', dot: '#8b5cf6' },
  diproses:            { label: 'Diproses',          color: '#3b82f6', bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
  sedang_diantar:      { label: 'Sedang Diantar',   color: '#8b5cf6', bg: '#ede9fe', text: '#5b21b6', dot: '#8b5cf6' },
  selesai:             { label: 'Selesai',            color: '#10b981', bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  dibatalkan:          { label: 'Dibatalkan',         color: '#ef4444', bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
};

export default function DashboardPelanggan() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promoIndex, setPromoIndex] = useState(0);

  const muatData = () => {
    if (!token) return;
    setLoading(true);
    fetch('https://optimum-setting-incidence-barn.trycloudflare.com/api/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(res => { setData(res); setLoading(false); })
      .catch(() => { setData(null); setLoading(false); });
  };

  useEffect(() => { muatData(); }, [token]);

  const promoList    = data?.promo_aktif   || [];
  const menuFavorit  = data?.menu_favorit  || [];
  const menuTerbaru  = data?.menu_terbaru  || [];
  const kategori     = data?.kategori      || [];

  useEffect(() => {
    if (promoList.length <= 1) return;
    const t = setInterval(() => setPromoIndex(i => (i + 1) % promoList.length), 4000);
    return () => clearInterval(t);
  }, [promoList.length]);

  const statCards = [
    {
      icon: Package, label: 'Total Pesanan',
      value: data?.ringkasan?.total_pesanan || 0,
    },
    {
      icon: Zap, label: 'Diproses',
      value: data?.ringkasan?.pesanan_diproses || 0,
    },
    {
      icon: CheckCircle2, label: 'Selesai',
      value: data?.ringkasan?.pesanan_selesai || 0,
    },
    {
      icon: TrendingUp, label: 'Total Belanja',
      value: `Rp ${(data?.ringkasan?.total_belanja || 0).toLocaleString('id-ID')}`,
    },
  ];

  const pesanan       = data?.pesanan_terbaru || [];
  const pesananAktif  = pesanan.filter(p => ['diproses','sedang_diantar','menunggu_pembayaran','menunggu_validasi'].includes(p.status));
  const pesananSelesai= pesanan.filter(p => p.status === 'selesai');

  const labelStatus = s => STATUS_CONFIG[s]?.label || s;
  const namaDepan   = user?.nama?.split(' ')[0] || 'Pelanggan';

  const jamSekarang = new Date().getHours();
  const sapaan = jamSekarang < 12 ? 'Selamat Pagi' : jamSekarang < 17 ? 'Selamat Siang' : 'Selamat Malam';

  return (
    <div className="min-h-screen bg-[#FAF6F1]">

      {/* ===== HERO HEADER ===== */}
      <div className="relative overflow-hidden bg-[#FAF6F1] border-b border-[#E8DDD5]">
        {/* Subtle decorative cream blobs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#F3E6DC] opacity-60 blur-xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#EFE3D8] opacity-50 blur-xl" />

        <div className="relative max-w-5xl mx-auto px-6 py-10 md:py-14">
          <div className="flex flex-col items-start w-full">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#8B3A0F] text-xs font-black tracking-widest uppercase">{sapaan} 👋</span>
            </div>
            
            {/* Teks Besar Menyamping Sesuai Referensi Gambar */}
            <div className="flex items-center gap-2 md:gap-3 mb-6 flex-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B3A0F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 -mt-1.5">
                <path d="M12 2v8M6 4l4 6M18 4l-4 6"/>
              </svg>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-[#2C1810] tracking-tighter uppercase leading-none flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>HALO, <span className="text-[#8B3A0F]">{namaDepan}!</span></span>
                <span className="hidden md:inline-block text-[#E8DDD5]">·</span>
                <span>YUK PESAN PIZZA FAVORITMU</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/menu"
                className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white font-extrabold text-sm md:text-base px-8 py-3.5 md:py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all uppercase tracking-wider">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" /> Pesan Sekarang
              </Link>
              <button onClick={muatData}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-[#2C1810] text-sm md:text-base px-6 py-3.5 md:py-4 rounded-full transition-all font-bold cursor-pointer border border-[#E8DDD5] shadow-sm hover:-translate-y-0.5 uppercase tracking-wider">
                <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-5xl mx-auto px-4 pb-10 mt-6">

        {/* ===== STAT CARDS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statCards.map(({ icon: Icon, label, value }) => (
            <div key={label}
              className="bg-white rounded-2xl shadow-sm border border-[#E8DDD5] p-4 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-[#FAF6F1] border border-[#E8DDD5] flex items-center justify-center shadow-sm">
                <Icon className="w-5 h-5 text-[#8B3A0F]" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#5C3D2E] truncate">{label}</p>
                <p className="text-lg font-black mt-0.5 text-[#2C1810] truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-orange-400 border-t-transparent animate-spin mb-4" />
            <p className="text-sm text-slate-400 font-medium">Memuat data dashboard...</p>
          </div>
        ) : (
          <>
            {/* ===== PROMO BANNER KOTAK GRID ===== */}
            {promoList.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    Promo Spesial ✨
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {promoList.map(p => (
                    <div key={p.id}
                      className="bg-white rounded-2xl shadow-sm border border-[#E8DDD5] p-4 flex flex-col justify-between hover:shadow-md transition-all h-full">
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Diskon {p.diskon}%
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-800 leading-snug mb-1 line-clamp-1">{p.judul}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed flex-1">{p.deskripsi}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {p.kode_promo ? (
                          <div className="bg-[#FAF6F1] border border-[#E8DDD5] px-2.5 py-1.5 rounded-lg overflow-hidden flex-1 max-w-[70%]">
                            <span className="text-[9px] font-extrabold text-[#8B3A0F] tracking-wider truncate block">
                              KODE: {p.kode_promo}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400">Tanpa Kode</span>
                        )}
                        <Link to="/menu" className="text-[10px] font-black text-orange-500 hover:text-orange-600 flex items-center gap-0.5 shrink-0">
                          Pakai <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}



            {/* ===== PESANAN TERBARU (Hanya tampil jika ada) ===== */}
            {pesananAktif.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Pesanan Aktif</h3>
                      <p className="text-[10px] text-slate-400">{pesananAktif.length} pesanan berjalan</p>
                    </div>
                  </div>
                  <Link to="/riwayat" className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                    Lihat Riwayat <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-50">
                  {pesananAktif.map(p => {
                    const cfg = STATUS_CONFIG[p.status] || {};
                    return (
                      <Link key={p.id} to={`/track/${p.id}`}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 transition-colors group">
                        {/* Dot status */}
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: cfg.bg }}>
                            <Clock className="w-5 h-5" style={{ color: cfg.color }} />
                          </div>
                          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white animate-pulse"
                            style={{ backgroundColor: cfg.dot }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-800 text-sm">Pesanan #{p.id}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: cfg.bg, color: cfg.text }}>
                              {labelStatus(p.status)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(p.tanggal_pesanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-right shrink-0 flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-800">
                            Rp {(p.total_harga || 0).toLocaleString('id-ID')}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===== RIWAYAT SELESAI ===== */}
            {pesananSelesai.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">Riwayat Selesai</h3>
                  </div>
                  <Link to="/riwayat" className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                    Semua <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="divide-y divide-slate-50">
                  {pesananSelesai.slice(0, 4).map(p => (
                    <Link key={p.id} to={`/track/${p.id}`}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-sm block">Pesanan #{p.id}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(p.tanggal_pesanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-emerald-600 text-sm">
                          Rp {(p.total_harga || 0).toLocaleString('id-ID')}
                        </span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Selesai</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ===== PROFIL CARD ===== */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 text-base truncate">{user?.nama || 'Pelanggan'}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {user?.alamat || 'Alamat belum diisi'}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                    <Phone className="w-3 h-3 shrink-0" />
                    {user?.telepon || '—'} · {user?.email}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Link to="/menu"
                    className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all text-center">
                    + Pesan
                  </Link>
                  <Link to="/profil"
                    className="border border-slate-200 text-slate-600 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-center">
                    Edit Profil
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
