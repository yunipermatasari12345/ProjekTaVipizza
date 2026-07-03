import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard, Wallet, ChevronRight, MapPin, Loader2 } from 'lucide-react';

export default function Cart() {
  const { keranjang, ubahJumlahItem, ubahCatatanItem, hapusDariKeranjang, hitungTotalHarga, kosongkanKeranjang } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [nama, setNama] = useState(user?.nama || '');
  const [telepon, setTelepon] = useState(user?.telepon || '');
  const [alamat, setAlamat] = useState(user?.alamat || '');
  const [catatan, setCatatan] = useState('');
  const [metodePembayaran, setMetodePembayaran] = useState('midtrans');

  const [kodePromoInput, setKodePromoInput] = useState('');
  const [promoAktif, setPromoAktif] = useState(null);
  const [pesanPromo, setPesanPromo] = useState({ text: '', isError: false });

  const totalHarga = hitungTotalHarga();
  const diskonPersen = promoAktif ? promoAktif.diskon : 0;
  const nilaiDiskon = (totalHarga * diskonPersen) / 100;
  const totalSetelahDiskon = totalHarga - nilaiDiskon;
  const ongkosKirim = totalHarga > 0 ? 10000 : 0;
  const grandTotal = totalSetelahDiskon + ongkosKirim;

  const handleCekPromo = async () => {
    if (!kodePromoInput) return;
    try {
      const response = await fetch(`http://localhost:8080/api/promo/check?kode=${kodePromoInput}`);
      const data = await response.json();
      if (response.ok) {
        setPromoAktif({ kode: data.kode, diskon: data.diskon });
        setPesanPromo({ text: `Yeay! Diskon ${data.diskon}% berhasil digunakan.`, isError: false });
      } else {
        setPromoAktif(null);
        setPesanPromo({ text: data.error || 'Kode promo tidak valid', isError: true });
      }
    } catch (err) {
      setPesanPromo({ text: 'Gagal mengecek promo', isError: true });
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    const jamSekarang = new Date().getHours();
    if (jamSekarang < 9 || jamSekarang >= 21) {
      alert("Maaf, Vipizza Homemade Padang sedang TUTUP. Kami buka setiap hari mulai pukul 09.00 - 21.00 WIB.");
      setLoading(false);
      return;
    }

    if (keranjang.length === 0) {
      alert("Keranjang belanja Anda masih kosong!");
      setLoading(false);
      return;
    }

    if (!nama || !telepon || !alamat) {
      alert("Mohon lengkapi seluruh data pengiriman!");
      setLoading(false);
      return;
    }

    const payload = {
      nama_penerima: nama,
      alamat_pengiriman: alamat,
      telepon: telepon,
      catatan: catatan,
      metode_pembayaran: metodePembayaran,
      kode_promo: promoAktif ? promoAktif.kode : "",
      items: keranjang.map(item => ({
        menu_id: item.menu.id,
        jumlah: item.jumlah
      }))
    };

    try {
      const response = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        alert(errData.error || 'Gagal membuat pesanan');
        setLoading(false);
        return;
      }

      const res = await response.json();
      const orderId = res.pesanan_id;
      const snapTokenStr = res.snap_token || '';

      kosongkanKeranjang();

      if (metodePembayaran === 'midtrans' && snapTokenStr) {
        window.snap.pay(snapTokenStr, {
          onSuccess: function () {
            navigate(`/track/${orderId}`);
          },
          onPending: function () {
            navigate(`/track/${orderId}`);
          },
          onError: function () {
            alert('Pembayaran gagal! Silakan coba lagi.');
            navigate(`/track/${orderId}`);
          },
          onClose: function () {
            navigate(`/track/${orderId}`);
          }
        });
      } else {
        alert(`Pesanan #${orderId} berhasil dibuat!`);
        navigate(`/track/${orderId}`);
      }
    } catch (err) {
      alert('Gagal terhubung ke server. Pastikan backend sedang berjalan.');
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap min-h-screen text-left">
      <div className="mb-8">
        <p className="text-brand-orange font-semibold text-xs uppercase tracking-wider">Checkout</p>
        <h1 className="page-title mt-1">Keranjang Belanja</h1>
        <p className="page-subtitle">Review pesanan pizza sebelum checkout</p>
      </div>

      {keranjang.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Kolom Kiri: Daftar Keranjang */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {keranjang.map((item) => {
              if (!item || !item.menu) return null;
              return (
                <div 
                  key={item.menu.id} 
                  className="card-fe-white p-4 flex flex-col sm:flex-row items-center gap-4"
                >
                  {/* Gambar Pizza */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                    <img 
                      src={item.menu.gambar_url || "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=200"} 
                      alt={item.menu.nama} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Keterangan & Jumlah */}
                  <div className="flex-grow flex flex-col gap-1 w-full text-left">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-brand-orange bg-pink-50 px-2 py-0.5 rounded self-start">
                      {item.menu.kategori}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base mt-1">{item.menu.nama}</h3>
                    <p className="text-xs text-brand-orange font-extrabold mt-0.5">
                      Rp {(item.menu.harga || 0).toLocaleString('id-ID')} / porsi
                    </p>
                  
                  {/* Catatan tambahan (opsional) */}
                  <div className="mt-1.5 w-full">
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Catatan tambahan (opsional)</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Extra keju, Pedas level 2, Tanpa bawang..."
                      value={item.catatan || ''}
                      onChange={(e) => ubahCatatanItem(item.menu.id, e.target.value)}
                      className="w-full max-w-sm border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-pink-500/50"
                    />
                  </div>
                </div>

                {/* Selector Jumlah */}
                <div className="flex items-center gap-3 border border-slate-200 rounded-full px-2 py-1 bg-slate-50 shrink-0">
                  <button 
                    className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition-colors cursor-pointer"
                    onClick={() => ubahJumlahItem(item.menu.id, item.jumlah - 1)}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-slate-800 text-sm w-4 text-center">{item.jumlah}</span>
                  <button 
                    className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition-colors cursor-pointer"
                    onClick={() => ubahJumlahItem(item.menu.id, item.jumlah + 1)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Tombol Hapus */}
                <button 
                  className="p-2 hover:bg-red-50 rounded-full transition-colors cursor-pointer shrink-0"
                  onClick={() => {
                    hapusDariKeranjang(item.menu.id);
                    alert(`${item.menu.nama} dihapus dari keranjang belanja!`);
                  }}
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>

              </div>
            );
          })}
          </div>

          {/* Kolom Kanan: Rincian Pembayaran & Form Checkout */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* 1. Ringkasan Belanja */}
            <div className="card-fe-white p-6 text-left">
              <h3 className="font-serif font-bold text-brand-brown text-lg mb-4">Ringkasan Pesanan</h3>
              
              <div className="flex flex-col gap-2.5 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal Menu</span>
                  <span className="font-bold text-slate-800">Rp {totalHarga.toLocaleString('id-ID')}</span>
                </div>

                {/* Potongan Diskon jika ada */}
                {promoAktif && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Diskon Promo ({promoAktif.diskon}%)</span>
                    <span className="font-bold">- Rp {nilaiDiskon.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Ongkos Kirim (Kota Padang)</span>
                  <span className="font-bold text-slate-800">Rp {ongkosKirim.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Input Kode Promo */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Punya Kode Promo?</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Masukkan kode promo"
                    value={kodePromoInput}
                    onChange={(e) => setKodePromoInput(e.target.value.toUpperCase())}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-pink-500/50 uppercase"
                  />
                  <button 
                    type="button"
                    onClick={handleCekPromo}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Terapkan
                  </button>
                </div>
                {pesanPromo.text && (
                  <p className={`text-[10px] font-bold mt-1.5 ${pesanPromo.isError ? 'text-red-500' : 'text-green-500'}`}>
                    {pesanPromo.text}
                  </p>
                )}
              </div>

              <div className="h-px bg-slate-100 my-4" />

              <div className="flex justify-between items-end">
                <span className="font-bold text-slate-800 text-sm">Total Pembayaran</span>
                <span className="font-extrabold text-2xl text-brand-orange">
                  Rp {grandTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* 2. Form Pengiriman & Metode Pembayaran (Wajib Punya Akun/Login!) */}
            {!user ? (
              <div className="card-fe p-6 flex flex-col gap-4">
                <h3 className="font-serif font-bold text-brand-brown text-lg">Login Diperlukan</h3>
                <p className="text-brand-brown-light text-xs">Buat akun pelanggan untuk checkout pesanan pizza Vipizza.</p>
                <Link to="/daftar" className="btn-primary text-center text-xs py-3">Daftar Akun Baru</Link>
                <Link to="/masuk" className="btn-secondary text-center text-xs py-3">Masuk Akun</Link>
              </div>
            ) : (
              <div className="card-fe-white p-6 text-left">
                <form onSubmit={handleCheckout} className="flex flex-col gap-4">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
                    <MapPin className="w-5 h-5 text-brand-orange" />
                    Informasi Pengantaran Mandiri
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed -mt-2">
                    Pesanan Anda akan diantarkan langsung oleh pemilik Vipizza ke lokasi Anda di Padang.
                  </p>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Nama Lengkap Penerima</label>
                      <input 
                        type="text"
                        placeholder="Masukkan nama penerima..."
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Nomor HP Penerima</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: 081234567890..."
                        value={telepon}
                        onChange={(e) => setTelepon(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Alamat Pengantaran</label>
                      <textarea 
                        placeholder="Sebutkan nama jalan, kelurahan, kecamatan, atau patokan rumah Anda di Kota Padang..."
                        value={alamat}
                        onChange={(e) => setAlamat(e.target.value)}
                        rows={3}
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Catatan (opsional)</label>
                      <textarea
                        placeholder="Contoh: Extra keju, Pedas level 2, Tanpa bawang..."
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        rows={2}
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
                      />
                    </div>
                  </div>

                  {/* Metode Pembayaran */}
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="font-bold text-slate-700 text-sm flex items-center gap-1">
                      <CreditCard className="w-4 h-4 text-slate-500" />
                      Metode Pembayaran
                    </span>

                    <div className="flex flex-col gap-2.5 mt-1">
                      <label className={`border rounded-xl p-3.5 flex items-start gap-3 cursor-pointer w-full transition-colors ${metodePembayaran === 'midtrans' ? 'border-brand-orange bg-brand-orange-light/30 ring-1 ring-brand-orange' : 'border-slate-200 hover:border-slate-300'}`}>
                        <input
                          type="radio"
                          name="metode"
                          value="midtrans"
                          checked={metodePembayaran === 'midtrans'}
                          onChange={(e) => setMetodePembayaran(e.target.value)}
                          className="mt-1 accent-brand-orange"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-slate-800">Bayar Online (Midtrans)</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Gopay, ShopeePay, VA BCA/Mandiri/BNI, QRIS, dll</span>
                        </div>
                      </label>

                      <label className={`border rounded-xl p-3.5 flex items-start gap-3 cursor-pointer w-full transition-colors ${metodePembayaran === 'tunai' ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-slate-300'}`}>
                        <input
                          type="radio"
                          name="metode"
                          value="tunai"
                          checked={metodePembayaran === 'tunai'}
                          onChange={(e) => setMetodePembayaran(e.target.value)}
                          className="mt-1 accent-emerald-500"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-slate-800">Bayar Tunai (Saat Diantar)</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Bayar langsung saat pesanan sampai di tempat Anda</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary font-extrabold rounded-full py-3.5 px-6 shadow-lg shadow-pink-200 w-full mt-4 flex items-center justify-center gap-1.5 hover:scale-[1.01] transform transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        Proses Pesanan Sekarang
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                </form>
              </div>
            )}

          </div>

        </div>
      ) : (
        // Tampilan Keranjang Kosong
        <div className="card-fe text-center py-16 flex flex-col items-center gap-4 max-w-lg mx-auto my-10">
          <span className="text-4xl">🛒</span>
          <h3 className="font-serif font-bold text-brand-brown text-xl">Keranjang Kosong</h3>
          <p className="text-brand-brown-light text-sm">Belum ada pizza di keranjang. Yuk pesan sekarang!</p>
          <Link to="/menu" className="btn-primary text-sm px-8 py-3">Lihat Menu Pizza</Link>
        </div>
      )}

    </div>
  );
}
