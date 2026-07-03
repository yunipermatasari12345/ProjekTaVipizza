import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  Hourglass,
  Package,
  Truck,
  UtensilsCrossed,
  ChevronLeft,
  X,
  CreditCard,
  Wallet,
  Clock
} from 'lucide-react';

export default function TrackOrder() {
  const { id } = useParams();
  const [pesanan, setPesanan] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const muatPesanan = async () => {
      setLoading(true);

      try {
        const response = await fetch(`http://localhost:8080/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.id) {
            setPesanan({
              id: data.id,
              tanggal_pesanan: data.tanggal_pesanan || data.Created_at,
              total_harga: data.total_harga,
              status: data.status,
              status_pembayaran: data.status_pembayaran,
              alamat_pengiriman: data.alamat_pengiriman,
              telepon: data.telepon,
              catatan: data.catatan || '',
              nama_penerima: data.nama_penerima || data.pengguna?.nama || '',
              metode_pembayaran: data.metode_pembayaran,
              snap_token: data.snap_token || '',
              items: data.item_pesanan ? data.item_pesanan.map(item => ({
                menu_id: item.menu_id,
                menu_nama: item.menu ? item.menu.nama : 'Pizza',
                jumlah: item.jumlah,
                harga: item.harga,
                catatan: item.catatan || ''
              })) : []
            });
          }
        } else {
          const errData = await response.json();
          console.warn('Gagal mengambil pesanan:', errData.error);
        }
      } catch (err) {
        console.warn('Koneksi backend offline:', err.message);
      }

      setLoading(false);
    };

    muatPesanan();
  }, [id, token]);

  const labelStatus = (s) => {
    const map = {
      menunggu_pembayaran: 'Menunggu Pembayaran',
      diproses: 'Diproses',
      sedang_diantar: 'Sedang Diantar',
      selesai: 'Selesai',
      dibatalkan: 'Dibatalkan',
    };
    return map[s] || s;
  };

  const labelPembayaran = (s) => {
    const map = {
      belum_dibayar: 'Belum Dibayar',
      lunas: 'Lunas',
    };
    return map[s] || s;
  };

  const handleBayarMidtrans = () => {
    if (window.snap && pesanan?.snap_token) {
      window.snap.pay(pesanan.snap_token, {
        onSuccess: () => { window.location.reload(); },
        onPending: () => { window.location.reload(); },
        onError: () => alert('Pembayaran gagal.'),
        onClose: () => { },
      });
    } else {
      alert('Token pembayaran tidak tersedia.');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 font-bold">Memuat Detail Pesanan...</div>;
  }

  if (!pesanan) {
    return (
      <div className="page-wrap min-h-screen text-center py-20">
        <span className="text-5xl block mb-4">🔍</span>
        <h2 className="font-bold text-xl text-slate-700">Pesanan Tidak Ditemukan</h2>
        <p className="text-slate-400 text-sm mt-2">Pesanan #{id} tidak dapat ditemukan.</p>
        <Link to="/" className="btn-primary inline-block mt-6 text-sm px-6 py-3">Kembali ke Beranda</Link>
      </div>
    );
  }

  const statusList = [
    { key: 'menunggu_pembayaran', label: 'Menunggu Bayar', icon: Hourglass },
    { key: 'diproses', label: 'Diproses', icon: UtensilsCrossed },
    { key: 'sedang_diantar', label: 'Sedang Diantar', icon: Truck },
    { key: 'selesai', label: 'Selesai', icon: CheckCircle2 },
  ];

  const idxAktif = statusList.findIndex(s => s.key === pesanan.status);

  return (
    <div className="page-wrap min-h-screen text-left">
      <div className="mb-6">
        <Link to={pesanan.status === 'selesai' || pesanan.status === 'dibatalkan' ? '/riwayat' : '/menu'}
          className="text-slate-500 hover:text-brand-orange text-xs flex items-center gap-1.5 font-medium">
          <ChevronLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <p className="text-brand-orange font-semibold text-xs uppercase tracking-wider">Lacak Pesanan</p>
          <h1 className="page-title mt-1">Pesanan #{pesanan.id}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase ${pesanan.status === 'dibatalkan' ? 'bg-red-100 text-red-700' :
              pesanan.status === 'selesai' ? 'bg-emerald-100 text-emerald-700' :
              pesanan.status === 'sedang_diantar' ? 'bg-purple-100 text-purple-700' :
              'bg-amber-100 text-amber-700'
            }`}>
            {labelStatus(pesanan.status)}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase ${pesanan.status_pembayaran === 'lunas' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}>
            {labelPembayaran(pesanan.status_pembayaran)}
          </span>
        </div>
      </div>

      {/* Stepper */}
      {pesanan.status !== 'dibatalkan' && (
        <div className="border border-slate-200/50 shadow-md bg-white rounded-2xl p-8 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">
            {statusList.map((lang, index) => {
              const IconComp = lang.icon;
              const isCompleted = index < idxAktif;
              const isActive = index === idxAktif;

              return (
                <div key={lang.key} className="flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${isCompleted
                      ? 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-100'
                      : isActive
                        ? 'bg-white border-pink-500 text-brand-orange ring-4 ring-pink-100'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h4 className={`font-bold text-xs mt-3 ${isCompleted || isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                    {lang.label}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pesanan.status === 'dibatalkan' && (
        <div className="p-5 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-2xl mb-10">
          ⚠️ Pesanan ini telah Dibatalkan. Silakan hubungi pemilik UMKM untuk informasi lebih lanjut.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Midtrans Payment */}
          {pesanan.status === 'menunggu_pembayaran' && pesanan.metode_pembayaran === 'midtrans' && (
            <div className="border border-brand-orange/30 shadow-md bg-brand-orange-light/10 rounded-2xl p-6 text-left">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-brand-orange" />
                Pembayaran Online (Midtrans)
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                Silakan klik tombol di bawah untuk melanjutkan pembayaran melalui Midtrans.
                Kami menerima <b>GoPay, ShopeePay, Virtual Account, QRIS,</b> dan berbagai metode lainnya.
              </p>
              {pesanan.snap_token ? (
                <button
                  onClick={handleBayarMidtrans}
                  className="bg-brand-orange hover:bg-orange-600 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 cursor-pointer text-sm"
                >
                  Lanjutkan Pembayaran
                </button>
              ) : (
                <p className="text-xs text-slate-500">Token pembayaran tidak tersedia. Silakan hubungi admin.</p>
              )}
            </div>
          )}

          {/* Tunai Payment */}
          {pesanan.status === 'diproses' && pesanan.metode_pembayaran === 'tunai' && pesanan.status_pembayaran === 'belum_dibayar' && (
            <div className="border border-emerald-200 shadow-md bg-emerald-50/50 rounded-2xl p-6 text-left">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-3">
                <Wallet className="w-5 h-5 text-emerald-600" />
                Pembayaran Tunai
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-2">
                Pesanan Anda sedang diproses. Silakan siapkan uang tunai sebesar
                <span className="font-extrabold text-emerald-700 block mt-2 text-lg">
                  Rp {pesanan.total_harga?.toLocaleString('id-ID') || 0}
                </span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Pembayaran dilakukan saat pesanan sampai di alamat Anda.
              </p>
            </div>
          )}

          {/* Diproses info */}
          {pesanan.status === 'diproses' && (
            <div className="border border-emerald-100 shadow-md bg-white rounded-2xl p-6 text-left flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-emerald-800 text-base">Pizza Anda Sedang Dipanggang!</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Dapur Vipizza Homemade sedang memproses pesanan Anda. Kami akan segera mengantarkannya.
                </p>
              </div>
            </div>
          )}

          {/* Sedang Diantar info */}
          {pesanan.status === 'sedang_diantar' && (
            <div className="border border-purple-100 shadow-md bg-white rounded-2xl p-6 text-left flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-purple-800 text-base">Pesanan Sedang Diantar!</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Pemilik UMKM sedang meluncur ke alamat Anda. Harap aktifkan nomor telepon Anda.
                </p>
              </div>
            </div>
          )}

          {/* Selesai info */}
          {pesanan.status === 'selesai' && (
            <div className="border border-emerald-200 shadow-md bg-emerald-50 rounded-2xl p-6 text-left flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-emerald-800 text-base">Pesanan Selesai!</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Terima kasih telah memesan di Vipizza! Dukungan Anda sangat berarti bagi UMKM kami.
                </p>
              </div>
            </div>
          )}

          {pesanan.catatan && (
            <div className="border border-slate-200/50 rounded-2xl p-4 bg-slate-50 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Catatan Pesanan</span>
              <p className="text-sm text-slate-700">{pesanan.catatan}</p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="border border-slate-200/50 shadow-md bg-white rounded-2xl p-6 text-left">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Detail Menu</h3>
            <div className="flex flex-col gap-3">
              {(pesanan.items || []).map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-sm">
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">{item.menu_nama}</span>
                    <span className="text-xs text-slate-400">{item.jumlah} x Rp {(item.harga || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <span className="font-bold text-slate-700">Rp {((item.jumlah || 1) * (item.harga || 0)).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
            <div className="h-px bg-slate-100 my-4" />
            <div className="flex flex-col gap-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Metode Bayar</span>
                <span className="font-semibold text-slate-700 uppercase">
                  {pesanan.metode_pembayaran === 'midtrans' ? 'Midtrans' : 'Tunai'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status Bayar</span>
                <span className={`font-semibold ${pesanan.status_pembayaran === 'lunas' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {labelPembayaran(pesanan.status_pembayaran)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal</span>
                <span className="font-semibold text-slate-700">
                  {new Date(pesanan.tanggal_pesanan || new Date()).toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between items-end mt-3 pt-3 border-t border-slate-100">
                <span className="font-bold text-slate-800">Total Bayar</span>
                <span className="font-extrabold text-lg text-brand-orange">
                  Rp {(pesanan.total_harga || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-slate-200/50 shadow-md bg-white rounded-2xl p-6 text-left">
            <h3 className="font-bold text-slate-800 text-lg mb-3">Alamat Pengiriman</h3>
            <div className="text-xs text-slate-600 flex flex-col gap-2 leading-relaxed">
              <div>
                <span className="block font-bold text-slate-700">Nama Penerima</span>
                <span>{pesanan.nama_penerima || '-'}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-700">Telepon</span>
                <span>{pesanan.telepon}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-700 mt-2">Lokasi Tujuan</span>
                <span className="block mt-1 text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {pesanan.alamat_pengiriman}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
