import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard, ChevronRight, MapPin } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';
import Swal from 'sweetalert2';

export default function Cart() {
  const { keranjang, ubahJumlahItem, ubahCatatanItem, hapusDariKeranjang, hitungTotalHarga, kosongkanKeranjang } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // State Form Checkout
  const [nama, setNama] = useState(user?.nama || '');
  const [telepon, setTelepon] = useState(user?.telepon || '');
  const [alamat, setAlamat] = useState(user?.alamat || '');
  const [metodePembayaran, setMetodePembayaran] = useState('midtrans');

  // State Promo
  const [kodePromoInput, setKodePromoInput] = useState('');
  const [promoAktif, setPromoAktif] = useState(null); // { kode, diskon }
  const [pesanPromo, setPesanPromo] = useState({ text: '', isError: false });

  const totalHarga = hitungTotalHarga();
  const diskonPersen = promoAktif ? promoAktif.diskon : 0;
  const nilaiDiskon = (totalHarga * diskonPersen) / 100;
  const totalSetelahDiskon = totalHarga - nilaiDiskon;
  
  const ongkosKirim = totalHarga > 0 ? 10000 : 0; // Ongkir Flat Rp 10.000 untuk Kota Padang
  const grandTotal = totalSetelahDiskon + ongkosKirim;

  const handleCekPromo = async () => {
    if (!kodePromoInput) return;
    try {
      const response = await fetch(`https://8a49cf3c307c57.lhr.life/api/promo/check?kode=${kodePromoInput}`);
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

    // Bebas pesan kapan saja (24 Jam)

    if (keranjang.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Keranjang belanja Anda masih kosong!' });
      return;
    }

    if (!nama || !telepon || !alamat) {
      Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Mohon lengkapi seluruh data pengiriman!' });
      return;
    }

    // Simulasi pembuatan ID pesanan unik jika offline
    const mockOrderId = Math.floor(100000 + Math.random() * 900000);

    // Persiapkan payload API
    const payload = {
      alamat_pengiriman: alamat,
      telepon: telepon,
      metode_pembayaran: metodePembayaran,
      kode_promo: promoAktif ? promoAktif.kode : "",
      items: keranjang.map(item => ({
        menu_id: item.menu.id,
        jumlah: item.jumlah
      }))
    };

    let realOrderId = mockOrderId;
    let databaseSuccess = false;
    let snapTokenStr = "";

    // Coba kirim ke REST API Backend
    try {
      const response = await fetch('https://8a49cf3c307c57.lhr.life/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const res = await response.json();
        if (res && res.pesanan_id) {
          realOrderId = res.pesanan_id;
          databaseSuccess = true;
          if (res.snap_token) {
            snapTokenStr = res.snap_token;
          }
        }
      } else {
        const errorData = await response.json();
        console.warn("Gagal membuat pesanan di server:", errorData.error);
      }
    } catch (err) {
      console.warn("Koneksi API backend offline. Menggunakan mode simulasi lokal.", err.message);
    }

    // Buat objek pesanan untuk disimpan lokal sebagai cache tracking
    const pesananMock = {
      id: realOrderId,
      tanggal_pesanan: new Date().toISOString(),
      total_harga: grandTotal,
      status: "menunggu_pembayaran",
      alamat_pengiriman: alamat,
      telepon: telepon,
      metode_pembayaran: metodePembayaran,
      bukti_pembayaran: "",
      snap_token: snapTokenStr,
      items: keranjang.map(item => ({
        menu_id: item.menu.id,
        menu_nama: item.menu.nama,
        jumlah: item.jumlah,
        harga: item.menu.harga,
        catatan: item.catatan || ""
      }))
    };

    // Ambil riwayat pesanan yang sudah ada di lokal
    const pesananLokal = JSON.parse(localStorage.getItem('vipizza_orders_mock') || '[]');
    pesananLokal.push(pesananMock);
    localStorage.setItem('vipizza_orders_mock', JSON.stringify(pesananLokal));

    // Simpan pesanan aktif terakhir ke lokal
    localStorage.setItem('vipizza_active_order_mock', JSON.stringify(pesananMock));

    // Kosongkan keranjang belanja
    kosongkanKeranjang();

    if (databaseSuccess) {
      if (metodePembayaran === 'midtrans' && snapTokenStr) {
        if (window.snap) {
          // Panggil Midtrans Snap
          window.snap.pay(snapTokenStr, {
            onSuccess: function (result) {
              fetch('https://8a49cf3c307c57.lhr.life/api/orders/' + realOrderId + '/verify-payment', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token }
              }).catch(function(){});
              Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Pembayaran sukses!' }).then(() => {
                navigate(`/track/${realOrderId}`);
              });
            },
            onPending: function (result) {
              Swal.fire({ icon: 'info', title: 'Menunggu', text: 'Menunggu pembayaran Anda...' }).then(() => {
                navigate(`/track/${realOrderId}`);
              });
            },
            onError: function (result) {
              Swal.fire({ icon: 'error', title: 'Gagal', text: 'Pembayaran gagal: ' + (result.status_message || 'Terjadi kesalahan') }).then(() => {
                navigate(`/track/${realOrderId}`);
              });
            },
            onClose: function () {
              Swal.fire({ icon: 'warning', title: 'Dibatalkan', text: 'Anda menutup popup sebelum menyelesaikan pembayaran.' }).then(() => {
                navigate(`/track/${realOrderId}`);
              });
            }
          });
          return;
        } else {
          Swal.fire({ icon: 'error', title: 'Sistem Belum Siap', text: 'Sistem pembayaran Midtrans belum dimuat. Silakan refresh halaman dan coba lagi.' });
        }
      } else {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: `Pesanan #${realOrderId} berhasil dibuat! Silakan lakukan pembayaran.` }).then(() => {
          navigate(`/track/${realOrderId}`);
        });
        return; // Prevents the navigate below from running immediately
      }
    } else {
      Swal.fire({ icon: 'error', title: 'Gagal', text: `Pesanan #${realOrderId} gagal dibuat di server. Coba login ulang atau daftar akun baru.` });
    }
    navigate(`/track/${realOrderId}`);
  };

  return (
    <div className="page-wrap min-h-screen text-left">
      <div className="mb-8">
        <p className="text-brand-orange font-semibold text-xs uppercase tracking-wider">Checkout</p>
        <h1 className="page-title mt-1">Keranjang Belanja</h1>
        <p className="page-subtitle">Review pesanan pizza sebelum checkout</p>
      </div>

      {keranjang.length > 0 ? (
        <div className="flex flex-col gap-8">
          
          {/* Bagian Atas: Daftar Keranjang (Full Width) */}
          <div className="w-full flex flex-col gap-4">
            {keranjang.map((item) => {
              if (!item || !item.menu) return null;
              return (
                <div 
                  key={item.menu.id} 
                  className="card-fe-white p-4 flex flex-col gap-3"
                >
                  {/* BARIS ATAS: Gambar & Info Produk */}
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                      <img 
                        src={getImageUrl(item.menu.gambar_url) || "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=200"} 
                        alt={item.menu.nama}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-left pt-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-brand-orange bg-pink-50 px-2 py-0.5 rounded self-start">
                        {item.menu.kategori}
                      </span>
                      <h3 className="font-bold text-slate-800 text-base mt-1 leading-tight">{item.menu.nama}</h3>
                      <p className="text-sm text-brand-orange font-extrabold mt-0.5">
                        Rp {(item.menu.harga || 0).toLocaleString('id-ID')} / porsi
                      </p>
                    </div>
                  </div>

                  {/* BARIS BAWAH: Catatan (Kiri) & Aksi/Kuantitas (Kanan) */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 border-t border-slate-100 pt-3 mt-1">
                    {/* Catatan (Lebar) */}
                    <div className="flex-grow w-full sm:w-auto">
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Catatan tambahan (opsional)</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Extra keju, Pedas level 2..."
                        value={item.catatan || ''}
                        onChange={(e) => ubahCatatanItem(item.menu.id, e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-pink-500/50"
                      />
                    </div>

                    {/* Selector Jumlah & Hapus */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-3 border border-slate-200 rounded-full px-2 py-1 bg-slate-50">
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

                      <button 
                        className="p-2 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                        onClick={() => {
                          hapusDariKeranjang(item.menu.id);
                          Swal.fire({ icon: 'success', title: 'Dihapus', text: `${item.menu.nama} dihapus dari keranjang belanja!`, timer: 1500, showConfirmButton: false });
                        }}
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>

              </div>
            );
          })}
          </div>

          {/* Bagian Bawah (Gandeng Dua): Ringkasan Pesanan & Form Checkout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
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
                  </div>

                  {/* Metode Pembayaran */}
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="font-bold text-slate-700 text-sm flex items-center gap-1">
                      <CreditCard className="w-4 h-4 text-slate-500" />
                      Metode Pembayaran
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-1">
                      {[
                        { value: 'midtrans', label: 'Bayar Otomatis', desc: 'Gopay, VA, dll' },
                        { value: 'transfer_bank', label: 'Transfer Bank', desc: 'BCA/Mandiri/BNI' },
                        { value: 'qris', label: 'QRIS', desc: 'Scan QR Code' },
                      ].map(met => (
                        <label key={met.value} className={`border rounded-xl p-3 flex flex-col sm:items-center sm:text-center sm:justify-center items-start gap-2 cursor-pointer w-full transition-colors ${metodePembayaran === met.value ? 'border-brand-orange bg-brand-orange-light/30 ring-1 ring-brand-orange' : 'border-slate-200 hover:border-slate-300'}`}>
                          <div className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              name="metode" 
                              value={met.value}
                              checked={metodePembayaran === met.value}
                              onChange={() => setMetodePembayaran(met.value)}
                              className="accent-brand-orange"
                            />
                            <span className="font-bold text-xs text-slate-800">{met.label}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 leading-tight">{met.desc}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary font-extrabold rounded-full py-3.5 px-6 shadow-lg shadow-pink-200 w-full mt-4 flex items-center justify-center gap-1.5 hover:scale-[1.01] transform transition-all cursor-pointer"
                  >
                    Proses Pesanan Sekarang
                    <ChevronRight className="w-5 h-5" />
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
