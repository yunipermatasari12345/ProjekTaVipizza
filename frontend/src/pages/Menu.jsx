import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PageHero from '../components/layout/PageHero';
import { getImageUrl } from '../utils/imageUrl';
import { Search, ShoppingCart, X, Minus, Plus, Star } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Menu() {
  const { tambahKeKeranjang } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const kategoriUrl = searchParams.get('kategori') || 'semua';

  const [pencarian, setPencarian] = useState('');
  const [kategoriAktif, setKategoriAktif] = useState(kategoriUrl);

  // Customization Form States untuk Detail Modal
  const [modalDetailBuka, setModalDetailBuka] = useState(false);
  const [menuDetail, setMenuDetail] = useState(null);
  const [ukuranTerpilih, setUkuranTerpilih] = useState('Medium'); // 'Medium' atau 'Large'
  const [jumlah, setJumlah] = useState(1);
  const [catatan, setCatatan] = useState('');
  
  // State Ulasan per produk di Detail
  const [ulasanMenuDetail, setUlasanMenuDetail] = useState([]);
  const [loadingUlasan, setLoadingUlasan] = useState(false);

  // Sync kategoriAktif with URL search param
  useEffect(() => {
    setKategoriAktif(kategoriUrl);
  }, [kategoriUrl]);

  // Helper untuk hitung harga berdasarkan ukuran dari data API
  const hitungHargaUkuran = (menu, ukuran) => {
    if (!menu) return 0;
    if (menu.nama && menu.nama.includes("1/2 Meter")) {
      return menu.harga_large || menu.harga || 130000;
    }
    if (ukuran === 'Large') return menu.harga_large || menu.harga_medium + 15000 || menu.harga + 15000;
    return menu.harga_medium || menu.harga || 35000;
  };

  const handleBukaDetail = (menu) => {
    setMenuDetail(menu);
    setUkuranTerpilih('Medium');
    setJumlah(1);
    setCatatan('');
    setUlasanMenuDetail([]);
    setModalDetailBuka(true);
    setLoadingUlasan(true);

    // Ambil ulasan dari API
    fetch(`https://optimum-setting-incidence-barn.trycloudflare.com/api/menus/${menu.id}/ulasan`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUlasanMenuDetail(data);
        }
      })
      .finally(() => setLoadingUlasan(false));
  };

  const handleTambahDetailKeKeranjang = (langsungCheckout = false) => {
    const hargaFinal = hitungHargaUkuran(menuDetail, ukuranTerpilih);
    const namaFinal = menuDetail.nama.includes("1/2 Meter") 
      ? menuDetail.nama 
      : `${menuDetail.nama} (${ukuranTerpilih})`;

    const menuKustom = {
      ...menuDetail,
      nama: namaFinal,
      harga: hargaFinal
    };

    // Format catatan: gabungan catatan kustom dan pilihan ukuran
    const catatanFinal = catatan 
      ? `[Ukuran: ${ukuranTerpilih}] ${catatan}` 
      : `Ukuran: ${ukuranTerpilih}`;

    const sukses = tambahKeKeranjang(menuKustom, jumlah, catatanFinal);
    
    if (sukses) {
      setModalDetailBuka(false);
      if (langsungCheckout) {
        window.location.href = "/keranjang";
      } else {
        Swal.fire({
          title: 'Berhasil!',
          text: `${namaFinal} berhasil ditambahkan ke keranjang! 🍕🛒`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    }
  };

  const [semuaMenu, setSemuaMenu] = useState([]);
  const [menusRekomendasi, setMenusRekomendasi] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  useEffect(() => {
    const defaultPizzaMenus = [
      {
        id: 1,
        nama: "Sosis Lovers Pizza",
        deskripsi: "Pizza lezat dengan saos tomat, mayo, jagung manis, bombai, keju cheddar, sosis sapi/ayam, dan oregano.",
        harga: 35000, harga_medium: 35000, harga_large: 50000,
        stok: 15, kategori: "pizza",
        gambar_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300",
        rating: 4.8, ulasan: 120, tersedia: true
      },
      {
        id: 2, nama: "Beef Slice Pizza",
        deskripsi: "Pizza gurih dengan saos tomat, mayo, jagung manis, bombai, keju cheddar, beef slice melimpah, dan oregano.",
        harga: 35000, harga_medium: 35000, harga_large: 50000,
        stok: 12, kategori: "pizza",
        gambar_url: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=300",
        rating: 4.9, ulasan: 340, tersedia: true
      },
      {
        id: 3, nama: "Abon Sapi Pizza",
        deskripsi: "Pizza unik nusantara dengan saos tomat, mayo, jagung manis, bombai, keju cheddar, abon sapi premium, dan oregano.",
        harga: 35000, harga_medium: 35000, harga_large: 50000,
        stok: 10, kategori: "pizza",
        gambar_url: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&q=80&w=300",
        rating: 4.7, ulasan: 95, tersedia: true
      },
      {
        id: 4, nama: "Cheese Corn Moza Pizza",
        deskripsi: "Perpaduan manis gurih saos tomat/sambal, mayo, SKM vanilla, jagung manis, keju cheddar, Moza lumer, dan oregano.",
        harga: 45000, harga_medium: 45000, harga_large: 60000,
        stok: 8, kategori: "pizza",
        gambar_url: "https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&q=80&w=300",
        rating: 4.6, ulasan: 80, tersedia: true
      },
      {
        id: 5, nama: "Beef Burger Moza Pizza",
        deskripsi: "Kenikmatan ekstra saos tomat/sambal, mayo, jagung, bombai, keju cheddar, mozzarella lumer, dan beef burger tumis bumbu.",
        harga: 50000, harga_medium: 50000, harga_large: 70000,
        stok: 10, kategori: "pizza",
        gambar_url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=300",
        rating: 4.7, ulasan: 150, tersedia: true
      },
      {
        id: 6, nama: "Chicken Mushroom Moza",
        deskripsi: "Pizza spesial dengan saos tomat/sambal, mayo, jagung, bombai, keju cheddar, mozzarella, dan tumisan daging ayam jamur gurih.",
        harga: 60000, harga_medium: 60000, harga_large: 80000,
        stok: 12, kategori: "pizza",
        gambar_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=300",
        rating: 4.5, ulasan: 75, tersedia: true
      },
      {
        id: 7, nama: "Combo Mix Special Pizza",
        deskripsi: "Paket komplit saos tomat/sambal, mayo, jagung, bombai, keju cheddar, Moza, sosis sapi, sosis ayam, dan beef slice premium.",
        harga: 60000, harga_medium: 60000, harga_large: 80000,
        stok: 8, kategori: "pizza",
        gambar_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300",
        rating: 4.8, ulasan: 110, tersedia: true
      },
      {
        id: 8, nama: "Pizza 1/2 Meter (Raksasa)",
        deskripsi: "Pizza raksasa 1/2 meter dengan kombinasi topping spesial Sosis Lovers mix Beef Burger Moza. Sempurna untuk pesta!",
        harga: 130000, harga_medium: 130000, harga_large: 130000,
        stok: 5, kategori: "pizza",
        gambar_url: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=300",
        rating: 4.9, ulasan: 220, tersedia: true
      }
    ];

    // STEP 1: Tampilkan cache localStorage DULU (instan, tanpa tunggu API)
    const cacheStr = localStorage.getItem('vipizza_menu_mock');
    if (cacheStr) {
      try {
        const cache = JSON.parse(cacheStr);
        const isOldMock = cache.some(m => m.nama === "Margherita Pizza" || m.nama === "Tuna Pizza" || m.kategori === "side" || m.kategori === "drink");
        if (Array.isArray(cache) && cache.length > 0 && !isOldMock) {
          setSemuaMenu(cache.filter(m => m.kategori === 'pizza'));
          setLoadingMenu(false); // Cache sudah cukup, tampilkan dulu
        }
      } catch { /* ignore */ }
    }

    // STEP 2: Fetch dari API di background, update jika berhasil
    fetch('https://optimum-setting-incidence-barn.trycloudflare.com/api/menus')
      .then(res => {
        if (!res.ok) throw new Error("Gagal load API");
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          const dataPizza = data.filter(m => m.kategori === 'pizza');
          setSemuaMenu(dataPizza);
          setLoadingMenu(false);
          localStorage.setItem('vipizza_menu_mock', JSON.stringify(data));
        } else {
          muat_default();
        }
      })
      .catch(() => {
        muat_default();
      });

    // Fetch rekomendasi
    fetch('https://optimum-setting-incidence-barn.trycloudflare.com/api/menus/rekomendasi')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setMenusRekomendasi(data.slice(0, 4));
        }
      })
      .catch(() => {});


    function muat_default() {
      // Hanya pakai default jika belum ada data tampil
      setSemuaMenu(prev => {
        if (prev.length > 0) return prev; // sudah ada cache, biarkan
        localStorage.setItem('vipizza_menu_mock', JSON.stringify(defaultPizzaMenus));
        return defaultPizzaMenus;
      });
      setLoadingMenu(false);
    }
  }, []);

  const handleKategoriChange = (kat) => {
    setKategoriAktif(kat);
    setSearchParams(kat === 'semua' ? {} : { kategori: kat });
  };

  // Filter Menu Berdasarkan Pencarian (Khusus Kategori Pizza saja!)
  const menuTerfilter = semuaMenu.filter(menu => {
    const cocokPencarian = menu.nama.toLowerCase().includes(pencarian.toLowerCase()) || 
                           menu.deskripsi.toLowerCase().includes(pencarian.toLowerCase());
    return cocokPencarian;
  });

  return (
    <div>

      <div className="py-10 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 max-w-xs mx-auto w-full rounded-2xl overflow-hidden shadow-xl border-4 border-white">
            <img 
              src="/panduan-ukuran.jpeg" 
              alt="Panduan Ukuran Vipizza" 
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="mb-8 max-w-sm relative">
            <input
              type="text"
              placeholder="Cari pizza favorit..."
              value={pencarian}
              onChange={(e) => setPencarian(e.target.value)}
              className="input-bs !pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c757d]" />
          </div>

          {/* Bagian Rekomendasi Menu */}
          {!loadingMenu && pencarian === '' && menusRekomendasi.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Rekomendasi (Paling Banyak Dipesan)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {menusRekomendasi.map((menu) => {
                  const habis = menu.stok === 0;
                  return (
                    <div
                      key={`rek-${menu.id}`}
                      className={`card-bs overflow-hidden flex flex-col relative ${habis ? 'opacity-60' : ''}`}
                    >
                      {habis && (
                        <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded z-10">
                          Habis
                        </span>
                      )}
                      <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded z-10 flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-white" /> Rekomendasi
                      </div>
                      <div
                        className="h-48 overflow-hidden cursor-pointer"
                        onClick={() => { if (!habis) handleBukaDetail(menu); }}
                      >
                        <img
                          src={getImageUrl(menu.gambar_url) || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300'}
                          alt={menu.nama}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-[#212529] text-sm mb-1">{menu.nama}</h3>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-slate-700">
                              {menu.rating > 0 ? Number(menu.rating).toFixed(1) : "0.0"}
                            </span>
                            <span className="text-[10px] text-slate-400">({menu.jumlah_ulasan || 0})</span>
                          </div>
                          <span className="text-[10px] text-brand-orange font-bold bg-pink-50 px-2 py-0.5 rounded-full">
                            Terjual {menu.terjual || 0}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 mb-3 mt-auto">
                          <span className="font-bold text-[#0b5345] text-xs">
                            Medium: Rp {(menu.harga_medium || menu.harga).toLocaleString('id-ID')}
                          </span>
                          <span className="font-bold text-[#8B3A0F] text-xs">
                            Large: Rp {(menu.harga_large || (menu.harga_medium || menu.harga) + 15000).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <button
                          disabled={habis}
                          onClick={() => { if (!habis) handleBukaDetail(menu); }}
                          className={`w-full text-xs py-2 flex items-center justify-center gap-1.5 ${
                            habis ? 'bg-[#e9ecef] text-[#6c757d] cursor-not-allowed rounded' : 'btn-primary'
                          }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> Lihat
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Daftar Semua Menu */}
          <h2 className="text-xl font-bold text-slate-800 mb-6">Semua Menu Pizza</h2>


      {loadingMenu && semuaMenu.length === 0 ? (
        /* === SKELETON LOADING CARDS === */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card-bs overflow-hidden flex flex-col animate-pulse">
              <div className="h-56 bg-gray-200 rounded-t-xl" />
              <div className="p-4 flex flex-col gap-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-5 bg-gray-200 rounded w-1/3 mt-1" />
                <div className="h-9 bg-gray-200 rounded-lg mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : menuTerfilter.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuTerfilter.map((menu) => {
            const habis = menu.stok === 0;
            return (
              <div
                key={menu.id}
                className={`card-bs overflow-hidden flex flex-col relative ${habis ? 'opacity-60' : ''}`}
              >
                {habis && (
                  <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded z-10">
                    Habis
                  </span>
                )}

                <div
                  className="h-56 overflow-hidden cursor-pointer"
                  onClick={() => { if (!habis) handleBukaDetail(menu); }}
                >
                  <img
                    src={getImageUrl(menu.gambar_url) || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300'}
                    alt={menu.nama}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-[#212529] text-base mb-1">{menu.nama}</h3>
                  
                  {/* Rating Visual Dinamis */}
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-700">
                      {menu.rating > 0 ? Number(menu.rating).toFixed(1) : "0.0"}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({menu.jumlah_ulasan || 0})
                    </span>
                  </div>

                  <p className="text-[#6c757d] text-xs leading-relaxed line-clamp-2 mb-2 flex-1">
                    {menu.deskripsi}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mb-1 mt-auto">
                    <span className="font-bold text-[#0b5345] text-[15px]">
                      M: Rp {(menu.harga_medium || menu.harga).toLocaleString('id-ID')}
                    </span>
                    <span className="font-bold text-[#8B3A0F] text-[15px]">
                      L: Rp {(menu.harga_large || (menu.harga_medium || menu.harga) + 15000).toLocaleString('id-ID')}
                    </span>
                  </div>
                  {!habis && (
                    <p className="text-[10px] text-emerald-600 font-medium mb-3">
                      Stok: {menu.stok} porsi
                    </p>
                  )}

                  <button
                    disabled={habis}
                    onClick={() => { if (!habis) handleBukaDetail(menu); }}
                    className={`w-full text-sm py-2 flex items-center justify-center gap-1.5 ${
                      habis ? 'bg-[#e9ecef] text-[#6c757d] cursor-not-allowed rounded' : 'btn-primary'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Lihat Detail
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-bs text-center py-12 max-w-md mx-auto">
          <span className="text-3xl">🔍</span>
          <h3 className="font-bold text-[#212529] mt-3">Menu tidak ditemukan</h3>
          <p className="text-[#6c757d] text-xs mt-2">Coba kata kunci lain</p>
          <button className="btn-secondary text-xs mt-4 py-2 px-4" onClick={() => setPencarian('')}>
            Reset Pencarian
          </button>
        </div>
      )}
        </div>
      </div>

      {/* ==================== MODAL DETAIL & CUSTOMIZATION PIZZA (WIDE) ==================== */}
      {modalDetailBuka && menuDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto text-left">
          <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
              <h3 className="font-serif font-extrabold text-slate-800 text-lg md:text-xl">
                Detail Menu & Ulasan
              </h3>
              <button 
                className="p-1.5 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                onClick={() => setModalDetailBuka(false)}
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content Modal Grid 2 Kolom */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                
                {/* KOLOM KIRI: GAMBAR BESAR & ULASAN */}
                <div className="flex flex-col gap-6">
                  {/* Gambar Besar */}
                  <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-sm bg-white border border-slate-100 shrink-0">
                    <img 
                      src={getImageUrl(menuDetail.gambar_url) || "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600"} 
                      alt={menuDetail.nama} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Bagian Ulasan */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col flex-1 min-h-[300px]">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                      <div className="bg-brand-orange-light text-brand-orange text-2xl font-black p-3 rounded-xl leading-none flex items-center gap-1.5">
                        {menuDetail.rating > 0 ? Number(menuDetail.rating).toFixed(1) : "0.0"} <Star className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Rating & Ulasan</h4>
                        <p className="text-slate-500 text-xs">Berdasarkan {menuDetail.jumlah_ulasan || 0} penilaian pelanggan</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[300px] scrollbar-thin scrollbar-thumb-slate-200">
                      {loadingUlasan ? (
                        <p className="text-xs text-slate-400 text-center py-6">Memuat ulasan...</p>
                      ) : ulasanMenuDetail.length > 0 ? (
                        ulasanMenuDetail.map(ul => (
                          <div key={ul.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-slate-700 text-xs">{ul.nama_publik || (ul.pengguna ? ul.pengguna.nama : 'Pelanggan')}</span>
                              <div className="flex text-amber-400">
                                {[...Array(ul.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 italic">"{ul.komentar || 'Mantap!'}"</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <span className="text-3xl opacity-50 block mb-2">🤔</span>
                          <p className="text-xs text-slate-400">Belum ada ulasan untuk produk ini.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* KOLOM KANAN: PEMBELIAN & CUSTOMIZATION */}
                <div className="flex flex-col gap-6">
                  {/* Judul & Deskripsi */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h4 className="font-serif font-extrabold text-slate-800 text-2xl leading-tight mb-2">{menuDetail.nama}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{menuDetail.deskripsi}</p>
                    <p className="font-black text-brand-orange text-xl mt-4">
                      Rp {menuDetail.harga.toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Bagian Kustomisasi Form (Ukuran, Jumlah, Catatan) */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col gap-5">
                    {/* Pilihan Ukuran (Jika bukan pizza 1/2 meter) */}
                    {!menuDetail.nama.includes("1/2 Meter") ? (
                      <div className="flex flex-col gap-2.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Pilih Ukuran Pizza</label>
                        <div className="grid grid-cols-2 gap-3">
                          
                          {/* Ukuran Medium */}
                          <button
                            type="button"
                            className={`border p-3.5 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer text-center ${
                              ukuranTerpilih === 'Medium'
                                ? 'border-brand-orange bg-pink-50/40 shadow-sm ring-2 ring-brand-orange/10'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                            onClick={() => setUkuranTerpilih('Medium')}
                          >
                            <span className="font-extrabold text-slate-800 text-sm">Ukuran Medium 🍕</span>
                            <span className="text-slate-400 text-[10px] font-semibold">Cocok untuk 1-2 Orang</span>
                            <span className="font-bold text-brand-orange text-xs mt-1">
                              Rp {hitungHargaUkuran(menuDetail, 'Medium').toLocaleString('id-ID')}
                            </span>
                          </button>

                          {/* Ukuran Large */}
                          <button
                            type="button"
                            className={`border p-3.5 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer text-center ${
                              ukuranTerpilih === 'Large'
                                ? 'border-brand-orange bg-pink-50/40 shadow-sm ring-2 ring-brand-orange/10'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                            onClick={() => setUkuranTerpilih('Large')}
                          >
                            <span className="font-extrabold text-slate-800 text-sm">Ukuran Large 🍕🔥</span>
                            <span className="text-slate-400 text-[10px] font-semibold">Cocok untuk 3-4 Orang</span>
                            <span className="font-bold text-brand-orange text-xs mt-1">
                              Rp {hitungHargaUkuran(menuDetail, 'Large').toLocaleString('id-ID')}
                            </span>
                          </button>

                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ukuran Spesial Raksasa</span>
                        <span className="block font-bold text-slate-800 text-sm mt-0.5">Pizza Raksasa Panjang 1/2 Meter</span>
                        <span className="block font-extrabold text-brand-orange text-base mt-1">Rp 130.000</span>
                      </div>
                    )}

                    {/* Kuantitas (Jumlah Porsi) */}
                    <div className="flex items-center justify-between border-t border-b border-slate-100 py-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Jumlah Pembelian</label>
                        <span className="text-slate-400 text-[10px] font-semibold">Atur kuantitas porsi pizza Anda</span>
                      </div>
                      <div className="flex items-center gap-3.5 border border-slate-200 rounded-full p-1.5 bg-slate-50 shadow-inner">
                        <button
                          type="button"
                          disabled={jumlah <= 1}
                          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-brand-orange disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                          onClick={() => setJumlah(jumlah - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-extrabold text-slate-800 text-sm w-5 text-center">{jumlah}</span>
                        <button
                          type="button"
                          disabled={jumlah >= menuDetail.stok}
                          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-brand-orange disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                          onClick={() => setJumlah(jumlah + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Catatan Pemesanan (Bawang, Pedas, Keju dll) */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Catatan Pemesanan (Opsional)</label>
                        <span className="text-[10px] text-brand-orange font-bold">Opsional</span>
                      </div>
                      <textarea
                        placeholder="Contoh: Extra keju, Pedas level 2, Tanpa bawang bombay..."
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        rows={2.5}
                        className="w-full border border-slate-200 rounded-2xl p-3 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange/50 resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Modal Action Buttons */}
            <div className="p-6 border-t border-slate-100 shrink-0 bg-slate-50/50 flex flex-col gap-2.5">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-slate-400 font-bold text-xs uppercase">Estimasi Total</span>
                <span className="font-extrabold text-brand-orange text-lg md:text-xl">
                  Rp {(hitungHargaUkuran(menuDetail, ukuranTerpilih) * jumlah).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="btn-primary font-extrabold rounded-full py-3.5 px-6 flex-1 text-sm shadow-md shadow-pink-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  onClick={() => handleTambahDetailKeKeranjang(true)}
                >
                  Beli & Langsung Checkout 🚀
                </button>
                <button
                  type="button"
                  className="bg-white border border-slate-200 hover:border-brand-orange hover:text-brand-orange text-slate-600 font-bold rounded-full py-3.5 px-5 text-sm transition-colors cursor-pointer flex items-center justify-center"
                  onClick={() => handleTambahDetailKeKeranjang(false)}
                >
                  Masukkan Keranjang 🛒
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
