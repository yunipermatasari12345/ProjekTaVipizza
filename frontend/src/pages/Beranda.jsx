import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck, Smartphone, ClipboardList, ShieldCheck,
  Star, ChevronRight, Flame, Clock, MapPin, ArrowRight
} from 'lucide-react';

export default function Beranda() {
  const [menuAndalan, setMenuAndalan] = useState([]);
  const [promoAktif, setPromoAktif] = useState([]);

  // Default menu jika API offline
  const menuDefault = [
    {
      id: 1, nama: 'Sosis Lovers Pizza', harga: 35000, rating: 4.9, ulasan: 320,
      deskripsi: 'Saos tomat, mayo, jagung manis, keju cheddar, sosis sapi/ayam, oregano.',
      gambar_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600',
      kategori: 'pizza', stok: 15,
    },
    {
      id: 2, nama: 'Beef Slice Pizza', harga: 35000, rating: 4.8, ulasan: 215,
      deskripsi: 'Saos tomat, mayo, jagung, keju cheddar, beef slice melimpah, oregano.',
      gambar_url: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=600',
      kategori: 'pizza', stok: 12,
    },
    {
      id: 3, nama: 'Cheese Corn Moza', harga: 45000, rating: 4.7, ulasan: 180,
      deskripsi: 'Saos tomat, mayo, SKM vanilla, jagung manis, keju cheddar, Moza lumer.',
      gambar_url: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&q=80&w=600',
      kategori: 'pizza', stok: 8,
    },
  ];

  useEffect(() => {
    fetch('http://localhost:8080/api/menus')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length > 0) setMenuAndalan(d.slice(0, 3)); else setMenuAndalan(menuDefault); })
      .catch(() => setMenuAndalan(menuDefault));

    fetch('http://localhost:8080/api/promo')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setPromoAktif(d.slice(0, 2)); })
      .catch(() => {});
  }, []);

  const tampilMenu = menuAndalan.length > 0 ? menuAndalan : menuDefault;

  const layanan = [
    { icon: Smartphone, label: 'Pesan Online', desc: 'Kapan & dimana saja' },
    { icon: Truck, label: 'Antar ke Rumah', desc: 'Seluruh Kota Padang' },
    { icon: ClipboardList, label: 'Lacak Pesanan', desc: 'Status real-time' },
    { icon: ShieldCheck, label: 'Pembayaran Aman', desc: 'Transfer & QRIS' },
  ];

  const testimonial = [
    { nama: 'Rina M.', kota: 'Padang Utara', bintang: 5, isi: 'Pizza-nya enak banget! Keju mozzarellanya lumer pas. Pasti order lagi 🍕' },
    { nama: 'Doni S.', kota: 'Kuranji', bintang: 5, isi: 'Pengiriman cepat, pizza datang masih hangat. Recommended!' },
    { nama: 'Ayu P.', kota: 'Padang Timur', bintang: 5, isi: 'Beef Burger Moza-nya juara! Porsi besar, harga terjangkau.' },
  ];

  return (
    <div className="overflow-x-hidden">

      {/* ===== HERO SECTION — Full-screen, gradient overlay ===== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=90&w=1800"
            alt="Pizza Background"
            className="w-full h-full object-cover scale-105"
            style={{ animation: 'slowZoom 20s ease-in-out infinite alternate' }}
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-[#0b5345]/60" />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f8f9fa] to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-semibold tracking-wider text-white/90">PIZZA HOMEMADE #1 DI PADANG</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-5 drop-shadow-2xl">
            Pizza Rumahan<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-yellow-300">
              Paling Enak
            </span>
            {' '}di Padang
          </h1>

          <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-10">
            Dipanggang fresh setiap hari dengan mozzarella lumer berkualitas.
            Pesan sekarang, kami antar langsung ke pintu rumahmu!
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            {[
              { angka: '500+', label: 'Pelanggan Puas' },
              { angka: '4.9★', label: 'Rating Google' },
              { angka: '< 1 Jam', label: 'Estimasi Kirim' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-white">{s.angka}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/menu"
              className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-3.5 rounded-full text-sm shadow-2xl shadow-orange-500/30 transition-all duration-300 flex items-center gap-2 hover:scale-105"
            >
              <Flame className="w-4 h-4" />
              Pesan Sekarang
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/daftar"
              className="bg-white/15 backdrop-blur-sm hover:bg-white/25 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-all duration-300 hover:scale-105"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce">
          <div className="w-5 h-8 border-2 border-white/40 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* ===== LAYANAN / USP STRIP ===== */}
      <section className="bg-white border-y border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {layanan.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0b5345] to-[#1a7a61] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-[#0b5345]/20">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PROMO BANNER (muncul jika ada promo aktif) ===== */}
      {promoAktif.length > 0 && (
        <section className="py-10 bg-gradient-to-br from-[#0b5345] to-[#1a7a61]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-white">
                <span className="text-xl">🏷️</span>
                <h2 className="font-bold text-lg">Promo Spesial Hari Ini</h2>
              </div>
              <Link to="/promo" className="text-white/70 hover:text-white text-sm flex items-center gap-1 transition-colors">
                Lihat semua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promoAktif.map(p => (
                <div key={p.id} className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 overflow-hidden hover:bg-white/15 transition-colors">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full" />
                  <div className="absolute -right-2 top-8 w-16 h-16 bg-white/5 rounded-full" />
                  {p.diskon > 0 && (
                    <span className="inline-block bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                      DISKON {p.diskon}%
                    </span>
                  )}
                  <h3 className="font-bold text-white text-base">{p.judul}</h3>
                  {p.deskripsi && <p className="text-white/60 text-xs mt-1">{p.deskripsi}</p>}
                  {p.kode_promo && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                      <span className="text-white/70 text-[10px] font-semibold">KODE:</span>
                      <code className="text-white font-mono font-bold text-sm tracking-widest">{p.kode_promo}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== MENU ANDALAN ===== */}
      <section className="py-16 bg-[#f8f9fa]">
        <div className="max-w-6xl mx-auto px-6">
          {/* Heading */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-[#0b5345] uppercase tracking-widest">Best Seller</span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mt-1">Menu Paling Favorit 🍕</h2>
              <p className="text-gray-400 text-sm mt-1">Pilihan pizza terlezat yang paling sering dipesan</p>
            </div>
            <Link to="/menu" className="mt-4 md:mt-0 text-sm font-semibold text-[#0b5345] hover:underline flex items-center gap-1">
              Lihat semua menu <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Kartu menu - premium e-commerce style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tampilMenu.map((menu, i) => (
              <div key={menu.id}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-400 border border-gray-100 flex flex-col">
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={menu.gambar_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600'}
                    alt={menu.nama}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600'; }}
                  />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="bg-white/90 backdrop-blur-sm text-[#0b5345] text-[10px] font-black px-2.5 py-1 rounded-full shadow">
                      🔥 Best Seller
                    </span>
                  </div>
                  {/* Rating */}
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-[11px] font-bold text-gray-700">
                      {menu.rating || 4.8} ({menu.ulasan || 0})
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-bold text-gray-900 text-base leading-snug flex-1">{menu.nama}</h3>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-4 flex-1">{menu.deskripsi}</p>

                  {/* Footer kartu */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium">Mulai dari</p>
                      <p className="text-xl font-black text-[#0b5345]">
                        Rp {(menu.harga || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <Link
                      to="/menu"
                      className="bg-gradient-to-r from-[#0b5345] to-[#1a7a61] hover:from-[#094a40] hover:to-[#0b5345] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-md shadow-[#0b5345]/20 transition-all duration-300 hover:scale-105 flex items-center gap-1.5"
                    >
                      Pesan <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BANNER PROMO DAFTAR ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0b5345] to-[#1a7a61] p-8 md:p-12">
            {/* Dekorasi lingkaran */}
            <div className="absolute -right-10 -top-10 w-52 h-52 bg-white/5 rounded-full" />
            <div className="absolute -right-5 bottom-0 w-36 h-36 bg-white/5 rounded-full" />
            <div className="absolute right-1/3 -bottom-8 w-24 h-24 bg-orange-500/10 rounded-full" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                  🎉 MEMBER BARU
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">
                  Daftar Sekarang &<br />Nikmati Layanan Penuh!
                </h2>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  Buat akun gratis untuk memesan, melacak status pesanan secara real-time,
                  dan mendapatkan notifikasi promo eksklusif Vipizza.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/daftar" className="bg-white text-[#0b5345] font-bold px-6 py-3 rounded-full text-sm hover:bg-white/90 transition-colors shadow-lg">
                    Daftar Gratis Sekarang
                  </Link>
                  <Link to="/masuk" className="border-2 border-white/30 text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-white/10 transition-colors">
                    Sudah Punya Akun
                  </Link>
                </div>
              </div>
              {/* Gambar ilustrasi */}
              <div className="hidden lg:flex justify-center items-center">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&q=80&w=400&h=300"
                    alt="Pizza Vipizza"
                    className="rounded-2xl w-72 h-48 object-cover shadow-2xl shadow-black/30"
                  />
                  {/* Floating card */}
                  <div className="absolute -bottom-4 -left-6 bg-white rounded-2xl p-3 shadow-xl flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#0b5345] flex items-center justify-center text-white text-sm">🍕</div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">Pesanan Dibuat!</p>
                      <p className="text-[10px] text-gray-400">Status: Sedang Diantar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONI ===== */}
      <section className="py-16 bg-[#f8f9fa]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-[#0b5345] uppercase tracking-widest">Ulasan Pelanggan</span>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mt-1">Mereka Sudah Merasakan 🌟</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonial.map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                {/* Bintang */}
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.bintang)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.isi}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0b5345] to-[#1a7a61] flex items-center justify-center text-white font-bold text-sm">
                    {t.nama[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{t.nama}</p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <MapPin className="w-2.5 h-2.5" /> {t.kota}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CARA PESAN STEP ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-[#0b5345] uppercase tracking-widest">Mudah & Cepat</span>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mt-1">Cara Pesan Pizza 🍕</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', icon: '📱', title: 'Buka Website', desc: 'Kunjungi vipizza.id dari HP atau laptop Anda.' },
              { step: '02', icon: '🍕', title: 'Pilih Menu', desc: 'Browse menu pizza dan pilih favoritmu.' },
              { step: '03', icon: '✅', title: 'Checkout', desc: 'Daftar/login, lalu checkout dengan mudah.' },
              { step: '04', icon: '🚚', title: 'Diantar!', desc: 'Pizza hangat langsung ke rumahmu!' },
            ].map((s, i) => (
              <div key={i} className="relative text-center group">
                {/* Garis penghubung */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[55%] w-[90%] h-px bg-gradient-to-r from-gray-200 to-gray-100 z-0" />
                )}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e8f5f2] to-[#d1ede8] group-hover:from-[#0b5345] group-hover:to-[#1a7a61] flex items-center justify-center text-2xl mb-3 transition-all duration-300 shadow-sm">
                    {s.icon}
                  </div>
                  <span className="text-[10px] font-black text-[#0b5345] tracking-widest mb-1">STEP {s.step}</span>
                  <h3 className="font-bold text-gray-800 text-sm mb-1">{s.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA akhir */}
          <div className="text-center mt-12">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0b5345] to-[#1a7a61] hover:from-[#094a40] hover:to-[#0b5345] text-white font-bold px-8 py-4 rounded-full text-sm shadow-xl shadow-[#0b5345]/25 transition-all duration-300 hover:scale-105"
            >
              <Flame className="w-4 h-4 text-orange-300" />
              Mulai Pesan Sekarang
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CSS keyframe untuk zoom hero */}
      <style>{`
        @keyframes slowZoom {
          from { transform: scale(1.05); }
          to { transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
}
