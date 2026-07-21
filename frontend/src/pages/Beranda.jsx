import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pizza, Clock, ThumbsUp, ShieldCheck, Truck, Smile, Heart, Star, X, MessageSquarePlus, TrendingUp, BarChart3, Trash2 } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

// ===================================================
// WARNA BRAND VIPIZZA
// #8B3A0F  = Rust/Brick (Tombol, aksen utama)
// #2C1810  = Dark Chocolate (Teks gelap, footer)
// #FAF6F1  = Krem Hangat (Background halaman)
// #E8DDD5  = Coklat Muda (Border, divider)
// ===================================================

export default function Beranda() {
  const [menuBestSeller, setMenuBestSeller] = useState([]);
  const [semuaMenu, setSemuaMenu] = useState([]);
  const [promoAktif, setPromoAktif] = useState([]);
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  // State Testimoni
  const [testimoniList, setTestimoniList] = useState([]);
  const [modalTestiBuka, setModalTestiBuka] = useState(false);
  const [formTesti, setFormTesti] = useState({ nama_publik: '', menu_id: '', teks: '', rating: 5 });
  const [loadingTesti, setLoadingTesti] = useState(false);

  const { token, user } = useAuth();

  const heroImages = [
    'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=95&w=1800',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=95&w=1800',
    'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=95&w=1800',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=95&w=1800',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=95&w=1800'
  ];

  const brandPrimary = '#8B3A0F';
  const brandDark    = '#2C1810';
  const brandLight   = '#FAF6F1';
  const brandMuted   = '#E8DDD5';

  const menuDefault = [
    {
      id: 1, nama: 'Sosis Lovers Pizza', harga: 35000,
      deskripsi: 'Saos tomat, mayo, jagung manis, keju cheddar, sosis sapi/ayam, oregano.',
      gambar_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=90&w=800',
    },
    {
      id: 2, nama: 'Beef Slice Pizza', harga: 35000,
      deskripsi: 'Saos tomat, mayo, jagung, keju cheddar, beef slice melimpah, oregano.',
      gambar_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=90&w=800',
    },
    {
      id: 3, nama: 'Cheese Corn Moza', harga: 45000,
      deskripsi: 'Saos tomat, mayo, SKM vanilla, jagung manis, keju cheddar, Moza lumer.',
      gambar_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=90&w=800',
    },
  ];

  useEffect(() => {
    // Fungsi untuk mengambil data terbaru (Menu & Ulasan)
    const fetchData = () => {
      // 1. Fetch Menu (Untuk Best Seller)
      fetch('http://localhost:9000/api/menus')
        .then(r => r.json())
        .then(d => {
          if (Array.isArray(d) && d.length > 0) {
            setSemuaMenu(d);
            // Kombinasi Rekomendasi: 1. Input Admin (is_best_seller) 2. Paling banyak dipesan (terjual)
            const sortedMenus = [...d].sort((a, b) => {
              if (a.is_best_seller && !b.is_best_seller) return -1;
              if (!a.is_best_seller && b.is_best_seller) return 1;
              return (b.terjual || 0) - (a.terjual || 0);
            });
            // Tampilkan hingga 6 menu (2 baris) di Beranda
            setMenuBestSeller(sortedMenus.slice(0, 6));
          } else {
            setSemuaMenu(menuDefault);
            setMenuBestSeller(menuDefault);
          }
        })
        .catch(() => setMenuBestSeller(menuDefault));

      // 2. Fetch Ulasan Terbaru (Polling untuk Testimoni)
      fetch('http://localhost:9000/api/ulasan/terbaru')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data.map(ulasan => ({
              id: ulasan.id,
              nama: ulasan.nama_publik || (ulasan.pengguna ? ulasan.pengguna.nama : 'Pelanggan VIPizza'),
              lokasi: 'Padang',
              menu: ulasan.menu ? ulasan.menu.nama : 'Pizza',
              menu_jumlah_ulasan: ulasan.menu ? ulasan.menu.jumlah_ulasan : 0,
              teks: ulasan.komentar ? `"${ulasan.komentar}"` : '"Pizzanya enak banget!"',
              rating: ulasan.rating
            }));
            setTestimoniList(formatted);
          } else {
            setTestimoniList([
              { id: 1, nama: 'Budi Santoso', lokasi: 'Kuranji', menu: 'Sosis Lovers Pizza', menu_jumlah_ulasan: 15, teks: '"Pizzanya lumer banget, ukurannya pas untuk kumpul keluarga! Pengantarannya juga cepat dan ramah."', rating: 5 },
              { id: 2, nama: 'Siti Aisyah', lokasi: 'Padang Barat', menu: 'Beef Burger Moza Pizza', menu_jumlah_ulasan: 8, teks: '"Gak nyangka di Padang ada pizza seenak ini, rasanya beneran autentik dan topping dagingnya sangat melimpah."', rating: 5 }
            ]);
          }
        })
        .catch(() => {
          // Abaikan error agar data lama tetap tampil
        });
    };

    // Eksekusi pertama kali
    fetchData();

    // Auto-refresh (polling) setiap 10 detik
    const pollingInterval = setInterval(() => {
      fetchData();
    }, 10000);

    // Fetch Promo (Hanya sekali di awal)
    fetch('http://localhost:9000/api/promo')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setPromoAktif(d.slice(0, 1)); })
      .catch(() => {});

    // Hero Image Carousel Interval
    const heroInterval = setInterval(() => {
      setHeroImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);

    return () => {
      clearInterval(heroInterval);
      clearInterval(pollingInterval);
    };
  }, []);

  const handleKirimTesti = async (e) => {
    e.preventDefault();
    if (!formTesti.nama_publik || !formTesti.menu_id) return;

    setLoadingTesti(true);
    try {
      const payload = {
        nama_publik: formTesti.nama_publik,
        menu_id: parseInt(formTesti.menu_id),
        rating: formTesti.rating,
        komentar: formTesti.teks
      };

      const res = await fetch('http://localhost:9000/api/ulasan/publik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Ambil nama menu dari id untuk tampilan
        const menuTerpilih = semuaMenu.find(m => m.id === parseInt(formTesti.menu_id));
        const newTesti = {
          id: Date.now(),
          nama: formTesti.nama_publik,
          lokasi: 'Padang',
          menu: menuTerpilih ? menuTerpilih.nama : 'Pizza',
          teks: `"${formTesti.teks}"`,
          rating: formTesti.rating
        };
        setTestimoniList([newTesti, ...testimoniList]);
        setModalTestiBuka(false);
        setFormTesti({ nama_publik: '', menu_id: '', teks: '', rating: 5 });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Terima kasih! Ulasan Anda berhasil ditambahkan.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        const data = await res.json();
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: data.error || 'Terjadi kesalahan saat mengirim ulasan.'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Gagal terhubung ke server.'
      });
    } finally {
      setLoadingTesti(false);
    }
  };

  const handleHapusUlasan = async (id) => {
    if (!token || user?.peran !== 'admin') return;
    
    const result = await Swal.fire({
      title: 'Hapus Ulasan?',
      text: "Ulasan ini akan dihapus secara permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:9000/api/ulasan/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          setTestimoniList(testimoniList.filter(t => t.id !== id));
          Swal.fire('Terhapus!', 'Ulasan telah dihapus.', 'success');
        } else {
          Swal.fire('Gagal!', 'Tidak dapat menghapus ulasan.', 'error');
        }
      } catch (error) {
        Swal.fire('Error!', 'Gagal terhubung ke server.', 'error');
      }
    }
  };

  const tampilMenu = menuBestSeller.length > 0 ? menuBestSeller : menuDefault;

  const features = [
    { icon: Pizza,       title: 'Bahan Segar',      desc: 'Bahan baku berkualitas tinggi.' },
    { icon: Clock,       title: 'Panggang Cepat',   desc: 'Disajikan hangat dari oven.' },
    { icon: Truck,       title: 'Antar Lokasi',     desc: 'Seluruh area Kota Padang.' },
    { icon: ShieldCheck, title: 'Higenis',           desc: 'Standar kebersihan terjaga.' },
    { icon: ThumbsUp,   title: 'Rasa Juara',        desc: 'Resep diracik sepenuh hati.' },
    { icon: Star,        title: 'Rating Tinggi',    desc: 'Dipercaya ribuan pelanggan.' },
    { icon: Heart,       title: 'Dibuat dgn Cinta', desc: 'Setiap loyang adalah karya.' },
    { icon: Smile,       title: 'Pelayanan Ramah',  desc: 'CS siap membantu Anda.' },
  ];

  // Testimoni pindah ke state (testimoniList)

  return (
    <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', backgroundColor: brandLight, color: brandDark }}>

      <style>
        {`
          @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes floatBadge {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes floatPizza {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(1.5deg); }
          }
        `}
      </style>

      <section className="w-full py-16 md:py-24 px-6 lg:px-12 relative overflow-hidden" style={{ backgroundColor: brandLight }}>
        
        {/* Ornamen Latar Krem/Oranye Halus */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#F4A261]/10 rounded-full blur-3xl -z-0"></div>
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-[#8B3A0F]/5 rounded-full blur-2xl -z-0"></div>

        <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center relative z-10">
          
          {/* TEXT CONTENT (Kiri) - Lebar Ditingkatkan agar Teks Memanjang ke Samping */}
          <div className="w-full md:w-[58%] lg:w-[60%] flex flex-col justify-center mt-12 md:mt-0 md:pr-6 relative z-10">
            
            {/* Pill Badge Premium */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8B3A0F]/10 border border-[#8B3A0F]/20 w-fit mb-8">
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: brandPrimary }}>
                🍕 Pizza Homemade Terfavorit di Padang
              </span>
            </div>
            
            <h1 className="leading-[1.0] mb-6 uppercase relative" style={{ color: brandDark, fontFamily: "'Outfit', sans-serif" }}>
              {/* Tiga Garis Dekorasi Sunburst ala contoh Laptop */}
              <svg className="absolute -top-6 -left-9 w-10 h-10 opacity-70" viewBox="0 0 24 24" fill="none" style={{ color: brandPrimary }}>
                <line x1="4" y1="20" x2="8" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="12" y1="22" x2="12" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="20" x2="16" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className="block text-xl sm:text-2xl md:text-3xl lg:text-[2.25rem] font-black tracking-tighter text-black mb-2 uppercase leading-none">
                PIZZA FOR DELICIOUS HOMEMADE PADANG
              </span>
              <span className="block text-5xl md:text-6xl lg:text-7.5xl font-black">
                LUMER.<br />
                <span style={{ color: brandPrimary }}>AUTENTIK.</span>
              </span>
            </h1>

            <p className="text-sm md:text-base font-medium mb-8 text-gray-600/95 leading-relaxed max-w-sm">
              Nikmati kelezatan pizza homemade khas Kota Padang, dipanggang segar dengan mozzarella lumer melimpah.
            </p>

            {/* CTA Button + Panah Melengkung */}
            <div className="flex items-center gap-6 relative">
              <Link
                to="/menu"
                className="inline-flex items-center gap-3 bg-white text-gray-900 font-extrabold px-6 py-3.5 rounded-full shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-0.5 transition-all text-xs uppercase tracking-wider group"
              >
                <span>ORDER NOW</span>
                <span className="w-6 h-6 rounded-full text-white flex items-center justify-center font-black text-xs transition-transform group-hover:rotate-90 duration-300" style={{ backgroundColor: brandPrimary }}>+</span>
              </Link>

              {/* Anak Panah Melengkung ke arah Pizza */}
              <svg className="hidden lg:block absolute left-52 top-1 w-24 h-12 opacity-80" viewBox="0 0 100 50" fill="none" style={{ color: brandPrimary }}>
                <path d="M5,10 Q40,40 90,15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="3 3" />
                <path d="M85,10 L92,15 L88,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            </div>

            {/* Bar Fitur Isi 3 Memanjang Ke Samping */}
            <div className="flex flex-row flex-wrap items-center gap-x-6 gap-y-3 mt-12 pt-6 border-t border-gray-200/50 text-[10px] sm:text-xs font-black tracking-widest uppercase" style={{ color: `${brandDark}C0` }}>
              <div className="flex items-center gap-2">
                <span className="text-base">🍕</span>
                <span>100% Bahan Segar</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base" style={{ color: '#F4A261' }}>👑</span>
                <span>Cita Rasa Premium</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base" style={{ color: brandPrimary }}>🔥</span>
                <span>Hangat & Cepat</span>
              </div>
            </div>

          </div>

          {/* IMAGE CONTENT (Kanan) - Kolom Disesuaikan Lebarnya */}
          <div className="w-full md:w-[42%] lg:w-[40%] relative flex justify-center items-center min-h-[380px] md:min-h-[520px]">
            
            {/* Dedaunan Basil Hijau Melayang 1 */}
            <div className="absolute top-6 left-6 animate-bounce" style={{ animationDuration: '4s' }}>
              <svg className="w-8 h-8 opacity-75 transform -rotate-45" viewBox="0 0 24 24" fill="#388E3C">
                <path d="M2,21C2,21 5,14 12,14C19,14 22,21 22,21C22,21 19,10 12,10C5,10 2,21 2,21Z" />
              </svg>
            </div>

            {/* Dedaunan Basil Hijau Melayang 2 */}
            <div className="absolute bottom-6 right-10 animate-bounce" style={{ animationDuration: '5.5s' }}>
              <svg className="w-6 h-6 opacity-60 transform rotate-45" viewBox="0 0 24 24" fill="#2E7D32">
                <path d="M2,21C2,21 5,14 12,14C19,14 22,21 22,21C22,21 19,10 12,10C5,10 2,21 2,21Z" />
              </svg>
            </div>

            {/* Keju Kubus Melayang */}
            <div className="absolute top-16 right-4 w-4 h-4 bg-[#F4A261] rounded-sm transform rotate-12 opacity-80 animate-pulse"></div>

            {/* Foto Pizza Melayang tanpa background */}
            <div 
              className="relative w-full max-w-[460px] md:max-w-[500px] transition-transform duration-500 select-none pointer-events-none"
              style={{ animation: 'floatPizza 6s ease-in-out infinite' }}
            >
              <img
                src="/floating-pizza.png"
                alt="VIPizza Homemade Premium Melayang"
                className="w-full h-auto drop-shadow-[0_30px_30px_rgba(139,58,15,0.22)]"
              />
            </div>

            {/* Floating Rating Badge */}
            <div 
              className="absolute -left-2 md:-left-6 top-3/4 -translate-y-1/2 bg-white border border-[#E8DDD5] rounded-full p-2 pr-5 shadow-2xl flex items-center gap-3 z-30"
              style={{ animation: 'floatBadge 4s ease-in-out infinite' }}
            >
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex justify-center items-center text-xs overflow-hidden"><img src="https://i.pravatar.cc/100?img=1" alt="user" /></div>
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex justify-center items-center text-xs overflow-hidden"><img src="https://i.pravatar.cc/100?img=2" alt="user" /></div>
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex justify-center items-center text-xs overflow-hidden"><img src="https://i.pravatar.cc/100?img=3" alt="user" /></div>
              </div>
              <div className="flex items-center gap-1" style={{ color: brandDark }}>
                <span className="text-yellow-400">★</span>
                <span className="font-black text-sm">5.0</span>
              </div>
            </div>

          </div>

        </div>
      </section>




      {/* ===== FITUR (8 KOTAK) - Diperkecil & Satu Baris ===== */}
      <section className="py-6 bg-white border-b border-[#E8DDD5]/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-row overflow-x-auto lg:grid lg:grid-cols-8 gap-2 pb-2 lg:pb-0 scrollbar-thin scrollbar-thumb-gray-200">
            {features.map((feat, i) => (
              <div
                key={i}
                style={{ backgroundColor: brandLight, border: `1px solid ${brandMuted}` }}
                className="p-2 rounded-xl flex items-center gap-2.5 hover:-translate-y-0.5 transition-transform duration-300 shrink-0 min-w-[130px] lg:min-w-0"
              >
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <feat.icon style={{ color: brandPrimary }} className="w-4 h-4 stroke-[1.8]" />
                </div>
                <div className="text-left leading-tight">
                  <h4 className="font-bold text-[10px] tracking-tight block" style={{ color: brandDark }}>{feat.title}</h4>
                  <p className="text-[9px] text-gray-400 block whitespace-nowrap overflow-hidden text-ellipsis max-w-[85px] lg:max-w-none">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MENU BEST SELLER ===== */}
      <section className="py-16" style={{ backgroundColor: brandLight }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p style={{ color: brandPrimary }} className="text-xs tracking-widest uppercase font-bold mb-2">🔥 Rekomendasi Terpopuler 🔥</p>
          <h2 style={{ color: brandDark, fontFamily: "'Outfit', sans-serif" }} className="text-3xl md:text-4xl font-black mb-4">Menu Best Seller</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto mb-12">
            Pilihan favorit pelanggan! Pizza homemade dengan resep autentik yang paling banyak dipesan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tampilMenu.map((menu) => (
              <div key={menu.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{ border: `1px solid ${brandMuted}` }}>
                <div className="h-52 overflow-hidden">
                  <img
                    src={getImageUrl(menu.gambar_url)}
                    alt={menu.nama}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600'; }}
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-black text-xl mb-1" style={{ color: brandDark }}>{menu.nama}</h3>
                  
                  {/* Rating Visual Dinamis */}
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-slate-700">
                      {menu.rating > 0 ? Number(menu.rating).toFixed(1) : "0.0"}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({menu.jumlah_ulasan || 0})
                    </span>
                  </div>

                  <p className="text-gray-500 text-xs leading-relaxed flex-1 mb-5">{menu.deskripsi}</p>
                  <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${brandMuted}` }}>
                    <span className="font-black text-lg" style={{ color: brandPrimary }}>
                      Rp {(menu.harga || 0).toLocaleString('id-ID')}
                    </span>
                    <Link
                      to="/menu"
                      style={{ backgroundColor: brandPrimary }}
                      className="text-white text-xs font-bold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity uppercase tracking-wider"
                    >
                      Pesan →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POLLING GRAFIK & TESTIMONI (SIDE-BY-SIDE) ===== */}
      <section className="py-16 bg-[#FDF9F5] border-t border-b border-[#E8DDD5]/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* KIRI: GRAFIK POLLING MENU */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E8DDD5]/60 h-full">
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-brand-orange" />
                  <p style={{ color: brandPrimary }} className="text-xs tracking-widest uppercase font-bold">Live Polling</p>
                </div>
                <h2 style={{ color: brandDark, fontFamily: "'Outfit', sans-serif" }} className="text-2xl md:text-3xl font-black mb-2">Menu Paling Banyak Diulas</h2>
                <p className="text-gray-500 text-sm">Grafik ini otomatis naik secara real-time setiap kali pelanggan memberikan ulasannya!</p>
              </div>

              <div className="flex flex-col gap-6">
                {[...semuaMenu]
                  .sort((a, b) => (b.jumlah_ulasan || 0) - (a.jumlah_ulasan || 0))
                  .slice(0, 5)
                  .map((menu, idx) => {
                    const maxUlasan = Math.max(...semuaMenu.map(m => m.jumlah_ulasan || 0), 1);
                    const persentase = ((menu.jumlah_ulasan || 0) / maxUlasan) * 100;
                    
                    return (
                      <div key={menu.id}>
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-gray-300 text-lg">#{idx + 1}</span>
                            <span className="font-bold text-sm" style={{ color: brandDark }}>{menu.nama}</span>
                          </div>
                          <span className="text-xs font-bold text-gray-500">{menu.jumlah_ulasan || 0} Ulasan</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out relative"
                            style={{ 
                              width: `${persentase}%`, 
                              backgroundColor: idx === 0 ? brandPrimary : '#f97316' 
                            }}
                          >
                            <div className="absolute inset-0 bg-white/20"></div>
                          </div>
                        </div>
                      </div>
                    );
                })}
              </div>
            </div>

            {/* KANAN: TESTIMONI TERBARU */}
            <div className="flex flex-col h-full">
              <div className="mb-8">
                <p style={{ color: brandPrimary }} className="text-xs tracking-widest uppercase font-bold mb-2">💬 Kata Mereka</p>
                <h2 style={{ color: brandDark, fontFamily: "'Outfit', sans-serif" }} className="text-2xl md:text-3xl font-black mb-2">Ulasan Terbaru</h2>
                <p className="text-gray-500 text-sm">Pendapat langsung dari para pelanggan setia VIPizza.</p>
              </div>

              <div className="flex flex-col gap-4 flex-1">
                {testimoniList.slice(0, 3).map((testi) => (
                  <div key={testi.id} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-[#E8DDD5]/60 flex flex-col relative group">
                    {user?.peran === 'admin' && (
                      <button 
                        onClick={() => handleHapusUlasan(testi.id)}
                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                        title="Hapus Ulasan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(testi.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm italic flex-1 mb-3 leading-relaxed line-clamp-2">
                      {testi.teks}
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-auto">
                      <div className="w-8 h-8 rounded-full bg-[#8B3A0F]/10 flex items-center justify-center text-[#8B3A0F] font-bold text-xs shrink-0">
                        {testi.nama.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden flex flex-col gap-1 w-full">
                        <p className="font-bold text-xs truncate" style={{ color: brandDark }}>{testi.nama}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-brand-orange font-semibold truncate bg-pink-50 px-2 py-0.5 rounded-full w-fit max-w-[120px]">
                            {testi.menu}
                          </p>
                          {testi.menu_jumlah_ulasan >= 2 && (
                            <p className="text-[9px] text-white font-bold bg-green-500 px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                              <Star className="w-2.5 h-2.5 fill-white" /> Sering Diulas
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ===== VISIT US (Split Layout) ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p style={{ color: brandPrimary }} className="text-xs tracking-widest uppercase font-bold mb-3">— Kunjungi Kami —</p>
            <h2 style={{ color: brandDark }} className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              Pesan Kapan Saja, Kami Siap Melayani
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              VIPizza hadir setiap hari untuk memenuhi kebutuhan pizza Anda. Baik untuk santai di rumah, makan siang kantor, hingga acara spesial.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Pesan melalui website kami dan pizza segar akan diantar langsung ke depan pintu Anda. Cepat, mudah, dan pasti lezat!
            </p>
            <Link
              to="/menu"
              style={{ backgroundColor: brandPrimary }}
              className="inline-block text-white font-bold px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity shadow-lg text-sm uppercase tracking-widest"
            >
              Pesan Sekarang →
            </Link>
          </div>

          {/* 2×2 Photo Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="h-44 rounded-2xl overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&q=80&w=600" alt="food 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="h-44 rounded-2xl overflow-hidden shadow-md mt-8">
              <img src="https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=600" alt="food 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="h-44 rounded-2xl overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=600" alt="food 3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="h-44 rounded-2xl overflow-hidden shadow-md mt-8">
              <img src="https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&q=80&w=600" alt="food 4" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* MODAL INPUT TESTIMONI PUBLIK */}
      {modalTestiBuka && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" style={{ color: brandDark }}>
            <div className="p-5 flex justify-between items-center border-b border-gray-100">
              <h3 className="font-black text-lg">Beri Ulasan Produk</h3>
              <button onClick={() => setModalTestiBuka(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleKirimTesti} className="p-6 flex flex-col gap-4 text-left">
              <div>
                <label className="block text-xs font-bold mb-1">Pilih Pizza / Produk *</label>
                <select 
                  required
                  value={formTesti.menu_id} onChange={e => setFormTesti({...formTesti, menu_id: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#8B3A0F] text-sm bg-white"
                >
                  <option value="" disabled>-- Pilih Menu --</option>
                  {semuaMenu.map(menu => (
                    <option key={menu.id} value={menu.id}>{menu.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Nama Anda *</label>
                <input 
                  type="text" required
                  value={formTesti.nama_publik} onChange={e => setFormTesti({...formTesti, nama_publik: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#8B3A0F] text-sm"
                  placeholder="Misal: Budi Santoso"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Berapa Bintang? ⭐</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} type="button"
                      onClick={() => setFormTesti({...formTesti, rating: star})}
                      className={`transition-transform hover:scale-110 ${formTesti.rating >= star ? 'text-amber-400' : 'text-gray-200'} cursor-pointer`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Komentar Singkat *</label>
                <textarea 
                  required rows="2"
                  value={formTesti.teks} onChange={e => setFormTesti({...formTesti, teks: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#8B3A0F] text-sm resize-none"
                  placeholder="Rasanya enak dan kejunya lumer..."
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loadingTesti}
                className="w-full mt-2 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 shadow-md cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: brandPrimary }}
              >
                {loadingTesti ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
