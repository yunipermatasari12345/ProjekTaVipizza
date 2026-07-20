import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { 
  CheckCircle2, 
  Hourglass, 
  FileText, 
  Upload, 
  Truck, 
  UtensilsCrossed, 
  QrCode, 
  Copy,
  ChevronLeft,
  X
} from 'lucide-react';

export default function TrackOrder() {
  const { id } = useParams();
  const [pesanan, setPesanan] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State Upload
  const [fileBukti, setFileBukti] = useState(null);
  const [buktiPreview, setBuktiPreview] = useState(null);
  const [namaBank, setNamaBank] = useState('');
  const [namaPengirim, setNamaPengirim] = useState('');
  const [prosesUpload, setProsesUpload] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [verifikasiLoading, setVerifikasiLoading] = useState(false);
  const [snapTokenAktif, setSnapTokenAktif] = useState('');

  // State Ulasan
  const [modalUlasanBuka, setModalUlasanBuka] = useState(false);
  const [menuUlasanTerpilih, setMenuUlasanTerpilih] = useState(null);
  const [ratingUlasan, setRatingUlasan] = useState(5);
  const [komentarUlasan, setKomentarUlasan] = useState('');
  const [loadingUlasan, setLoadingUlasan] = useState(false);
  const [ulasanSelesai, setUlasanSelesai] = useState([]); // Menyimpan menu_id yang sudah diulas

  const { token } = useAuth();

  // Load Pesanan dari Database / LocalStorage Fallback
  useEffect(() => {
    const muatPesanan = async () => {
      setLoading(true);
      let pesananDitemukan = null;

      // Coba ambil dari REST API Backend
      if (token) {
        try {
          const response = await fetch(`https://8a49cf3c307c57.lhr.life/api/orders/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data && data.id) {
              // Map format backend ke format frontend UI
              pesananDitemukan = {
                id: data.id,
                tanggal_pesanan: data.tanggal_pesanan || data.CreatedAt || new Date().toISOString(),
                total_harga: data.total_harga,
                status: data.status,
                alamat_pengiriman: data.alamat_pengiriman,
                telepon: data.telepon,
                metode_pembayaran: data.metode_pembayaran,
                bukti_pembayaran: data.bukti_pembayaran ? `https://8a49cf3c307c57.lhr.life${data.bukti_pembayaran}` : "",
                nama_bank: data.nama_bank || "",
                nama_pengirim: data.nama_pengirim || "",
                snap_token: data.snap_token || "",
                items: data.item_pesanan ? data.item_pesanan.map(item => ({
                  menu_id: item.menu_id,
                  menu_nama: item.menu ? item.menu.nama : "Pizza Homemade",
                  jumlah: item.jumlah,
                  harga: item.harga
                })) : []
              };
            }
          }
        } catch (err) {
          console.warn("Koneksi API backend offline. Menggunakan database simulasi lokal.", err.message);
        }
      }

      // Fallback ke LocalStorage jika offline atau tidak ditemukan di API
      if (!pesananDitemukan) {
        const daftarPesanan = JSON.parse(localStorage.getItem('vipizza_orders_mock') || '[]');
        pesananDitemukan = daftarPesanan.find(p => p.id === parseInt(id));
      }

      // Jika benar-benar tidak ada di mana pun, buat mock default
      if (!pesananDitemukan) {
        pesananDitemukan = {
          id: parseInt(id) || 482910,
          tanggal_pesanan: new Date().toISOString(),
          total_harga: 85000,
          status: "menunggu_pembayaran",
          alamat_pengiriman: "Jl. Khatib Sulaiman No. 12, Padang Utara, Padang",
          telepon: "082345678901",
          metode_pembayaran: "transfer_bank",
          bukti_pembayaran: "",
          nama_bank: "",
          nama_pengirim: "",
          snap_token: "",
          items: [
            { menu_id: 1, menu_nama: "Margherita Pizza", jumlah: 1, harga: 55000, catatan: "Pedas level 2" },
            { menu_id: 7, menu_nama: "Pisang Cokelat", jumlah: 2, harga: 15000, catatan: "Extra cokelat lumer" }
          ]
        };
      }

      setPesanan(pesananDitemukan);
      // Simpan snap token ke state terpisah agar bisa diupdate tanpa reload
      setSnapTokenAktif(pesananDitemukan.snap_token || '');
      if (pesananDitemukan.bukti_pembayaran) {
        setBuktiPreview(pesananDitemukan.bukti_pembayaran);
      }
      if (pesananDitemukan.nama_bank) {
        setNamaBank(pesananDitemukan.nama_bank);
      }
      if (pesananDitemukan.nama_pengirim) {
        setNamaPengirim(pesananDitemukan.nama_pengirim);
      }
      setLoading(false);
    };

    muatPesanan();
  }, [id, token]);

  // Auto-refresh polling untuk cek perubahan status (Notifikasi Demo)
  useEffect(() => {
    if (!token || !id) return;
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`https://8a49cf3c307c57.lhr.life/api/orders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPesanan(prev => {
            if (prev && prev.status !== data.status) {
              // Tampilkan SweetAlert notifikasi perubahan status
              if (data.status === 'diproses') {
                Swal.fire({ icon: 'success', title: 'Hore! 🎉', text: 'Pesananmu telah divalidasi Admin dan sedang diproses!', timer: 4000, showConfirmButton: false });
              } else if (data.status === 'dikirim') {
                Swal.fire({ icon: 'info', title: 'Pesanan Dikirim! 🛵', text: 'Pizza pesananmu sudah di jalan, harap tunggu ya.', timer: 4000, showConfirmButton: false });
              } else if (data.status === 'selesai') {
                Swal.fire({ 
                  icon: 'success', 
                  title: 'Yeay! Pesanan Selesai 🍕', 
                  html: 'Selamat menikmati Pizza-nya!<br/><br/><b>Bantu UMKM kami tumbuh</b> dengan memberikan ulasan Anda pada daftar menu di bawah ini ya!', 
                  confirmButtonColor: '#ea580c',
                  confirmButtonText: '⭐ Beri Ulasan Sekarang',
                  showCancelButton: true,
                  cancelButtonText: 'Nanti saja'
                }).then((res) => {
                  if (res.isConfirmed && prev.items && prev.items.length > 0) {
                    // Buka modal ulasan langsung untuk menu pertama yang belum diulas
                    setMenuUlasanTerpilih(prev.items[0]);
                    setModalUlasanBuka(true);
                  } else if (res.isConfirmed) {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }
                });
              } else if (data.status === 'dibatalkan') {
                Swal.fire({ icon: 'error', title: 'Oops! ❌', text: 'Pesananmu dibatalkan oleh Admin.', timer: 4000, showConfirmButton: false });
              }
              // Update state agar UI Stepper berubah otomatis
              return { ...prev, status: data.status, status_pembayaran: data.status_pembayaran || prev.status_pembayaran };
            }
            return prev;
          });
        }
      } catch (err) {
        // Silent fallback (kalau sedang error jaringan, diam saja)
      }
    }, 5000); // Mengecek status pesanan setiap 5 detik

    return () => clearInterval(interval);
  }, [id, token]);

  // Fungsi untuk refresh snap token yang sudah kadaluarsa
  const handleRefreshToken = async () => {
    if (!token || isRefreshingToken) return;
    setIsRefreshingToken(true);
    try {
      const response = await fetch(`https://8a49cf3c307c57.lhr.life/api/orders/${id}/refresh-token`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.snap_token) {
        setSnapTokenAktif(data.snap_token);
        // Langsung buka popup Midtrans dengan token baru
        if (window.snap) {
          window.snap.pay(data.snap_token, {
            onSuccess: function() { 
              fetch('https://8a49cf3c307c57.lhr.life/api/orders/' + id + '/verify-payment', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token }
              }).catch(function(){});
              Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Pembayaran berhasil!', timer: 2000, showConfirmButton: false }); 
              setPesanan(function(prev) { return {...prev, status: 'diproses'}; }); 
            },
            onPending: function() {
              Swal.fire({ icon: 'info', title: 'Pending', text: 'Pembayaran tertunda/diproses. Sistem akan mengecek otomatis.' });
            },
            onError: function() { Swal.fire({ icon: 'error', title: 'Gagal', text: 'Pembayaran gagal.' }); },
            onClose: function() { Swal.fire({ icon: 'warning', title: 'Batal', text: 'Jendela ditutup sebelum pembayaran selesai.' }); }
          });
        } else {
          Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Token diperbarui! Silakan klik "Lanjutkan Pembayaran" sekali lagi.' });
        }
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal memperbarui token: ' + (data.error || 'Terjadi kesalahan') });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Offline', text: 'Tidak bisa terhubung ke server. Pastikan backend berjalan.' });
    } finally {
      setIsRefreshingToken(false);
    }
  };

  const handleLanjutkanBayar = () => {
    const tokenPakai = snapTokenAktif || (pesanan && pesanan.snap_token);
    if (window.snap && tokenPakai) {
      window.snap.pay(tokenPakai, {
        onSuccess: function() {
          fetch('https://8a49cf3c307c57.lhr.life/api/orders/' + id + '/verify-payment', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
          }).catch(function(){});
          Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Pembayaran berhasil! Halaman akan diperbarui.', timer: 2000, showConfirmButton: false }).then(function(){ window.location.reload(); });
        },
        onPending: function() {
          Swal.fire({ icon: 'info', title: 'Pending', text: 'Pembayaran tertunda/diproses. Silakan refresh halaman ini nanti.' });
        },
        onError: function(result) {
          var msg = result && result.status_message || '';
          if (msg.toLowerCase().includes('expire') || msg.toLowerCase().includes('invalid')) {
            Swal.fire({
              icon: 'warning',
              title: 'Token Kadaluarsa',
              text: 'Token pembayaran sudah kadaluarsa. Klik OK untuk minta token baru secara otomatis.',
              showCancelButton: true
            }).then(function(res) {
              if (res.isConfirmed) handleRefreshToken();
            });
          } else {
            Swal.fire({ icon: 'error', title: 'Gagal', text: 'Pembayaran gagal: ' + msg });
          }
        },
        onClose: function() { alert('Jendela ditutup sebelum pembayaran selesai.'); }
      });
    } else {
      alert('Sistem pembayaran sedang dimuat, mohon tunggu sebentar lalu coba lagi.');
    }
  };

  const salinRekening = (teks) => {
    navigator.clipboard.writeText(teks);
    Swal.fire({ icon: 'success', title: 'Tersalin', text: `Nomor rekening '${teks}' berhasil disalin! 📋`, timer: 1500, showConfirmButton: false });
  };

  const handleCekStatusPembayaran = async () => {
    if (!token) {
      Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Anda harus login untuk memeriksa status pembayaran.' });
      return;
    }

    setVerifikasiLoading(true);
    try {
      const response = await fetch('https://8a49cf3c307c57.lhr.life/api/orders/' + id + '/verify-payment', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      const data = await response.json();
      if (response.ok) {
        setPesanan(prev => ({
          ...prev,
          status: data.status_pesanan || prev.status,
          status_pembayaran: data.status_pembayaran || prev.status_pembayaran
        }));
        Swal.fire({ icon: 'success', title: 'Terupdate', text: `Status pembayaran: ${data.status_pembayaran || 'tidak berubah'}` });
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: data.error || 'Tidak dapat memeriksa status pembayaran.' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Kesalahan', text: 'Tidak dapat terhubung ke server. Pastikan backend berjalan.' });
    } finally {
      setVerifikasiLoading(false);
    }
  };

  // Proses upload bukti bayar ke GORM/MySQL atau fallback lokal
  const handleUploadBukti = async (e) => {
    e.preventDefault();
    if (!fileBukti && !buktiPreview) {
      Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Mohon pilih file foto bukti pembayaran terlebih dahulu!' });
      return;
    }

    if (!namaBank || !namaPengirim) {
      Swal.fire({ icon: 'warning', title: 'Oops', text: "Mohon isi nama bank/e-wallet dan nama rekening pengirim!" });
      return;
    }

    setProsesUpload(true);

    let databaseSuccess = false;
    let finalGambarURL = buktiPreview || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=300";

    // Coba upload ke GORM REST API Backend (XAMPP MySQL) jika token valid
    if (token && token !== "mock_jwt_token_vipizza" && fileBukti) {
      try {
        const formData = new FormData();
        formData.append("bukti", fileBukti);
        formData.append("nama_bank", namaBank);
        formData.append("nama_pengirim", namaPengirim);

        const response = await fetch(`https://8a49cf3c307c57.lhr.life/api/orders/${id}/payment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const res = await response.json();
          if (res && res.bukti_pembayaran_url) {
            finalGambarURL = `https://8a49cf3c307c57.lhr.life${res.bukti_pembayaran_url}`;
            databaseSuccess = true;
          }
        } else {
          const errorData = await response.json();
          console.warn("Gagal mengunggah bukti ke database GORM:", errorData.error);
        }
      } catch (err) {
        console.warn("Koneksi API GORM backend offline. Menggunakan mode simulasi lokal.", err.message);
      }
    }

    // Perbarui status pesanan di LocalStorage (sebagai cache/demo fallback)
    const daftarPesanan = JSON.parse(localStorage.getItem('vipizza_orders_mock') || '[]');
    const indeks = daftarPesanan.findIndex(p => p.id === (pesanan?.id || parseInt(id)));

    const pesananDiperbarui = {
      ...pesanan,
      status: "menunggu_validasi",
      bukti_pembayaran: finalGambarURL,
      nama_bank: namaBank,
      nama_pengirim: namaPengirim
    };

    if (indeks > -1) {
      daftarPesanan[indeks] = pesananDiperbarui;
    } else {
      daftarPesanan.push(pesananDiperbarui);
    }

    localStorage.setItem('vipizza_orders_mock', JSON.stringify(daftarPesanan));
    localStorage.setItem('vipizza_active_order_mock', JSON.stringify(pesananDiperbarui));
    
    setPesanan(pesananDiperbarui);
    setProsesUpload(false);

    if (databaseSuccess) {
      Swal.fire({ icon: 'success', title: 'Berhasil', text: "Bukti pembayaran berhasil diunggah langsung ke database MySQL XAMPP! Status pesanan kini: Menunggu Validasi Admin. 🧾👍" });
    } else {
      Swal.fire({ icon: 'success', title: 'Berhasil', text: "Bukti pembayaran berhasil diunggah! (Mode Demo Lokal aktif). Status pesanan kini: Menunggu Validasi Admin. 🧾👍" });
    }
  };

  // Handler input gambar
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileBukti(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBuktiPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKirimUlasan = async (e) => {
    e.preventDefault();
    if (!token) return;

    setLoadingUlasan(true);
    try {
      const payload = {
        menu_id: menuUlasanTerpilih.menu_id,
        rating: ratingUlasan,
        komentar: komentarUlasan
      };

      const res = await fetch(`https://8a49cf3c307c57.lhr.life/api/orders/${id}/ulasan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Terima kasih atas ulasan Anda! ⭐' });
        
        // Sembunyikan tombol ulasan untuk menu ini
        setUlasanSelesai(prev => [...prev, menuUlasanTerpilih.menu_id]);

        setModalUlasanBuka(false);
        setMenuUlasanTerpilih(null);
        setKomentarUlasan('');
        setRatingUlasan(5);
      } else {
        const data = await res.json();
        Swal.fire({ icon: 'error', title: 'Oops', text: data.error || 'Gagal mengirim ulasan.' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Oops', text: 'Gagal terhubung ke server.' });
    } finally {
      setLoadingUlasan(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 font-bold">Memuat Detail Pesanan...</div>;
  }

  // Tahapan stepper progress
  const statusSistem = [
    { key: "menunggu_pembayaran", label: "Menunggu Bayar", deskripsi: "Unggah bukti pembayaran", icon: Hourglass },
    { key: "menunggu_validasi", label: "Validasi Admin", deskripsi: "Pengecekan bukti transfer", icon: FileText },
    { key: "diproses", label: "Diproses", deskripsi: "Sedang dipanggang dapur", icon: UtensilsCrossed },
    { key: "dikirim", label: "Dalam Pengantaran", deskripsi: "Kurir mandiri di jalan", icon: Truck },
    { key: "selesai", label: "Selesai", deskripsi: "Sampai & dinikmati", icon: CheckCircle2 }
  ];

  const statusAman = pesanan?.status || 'menunggu_pembayaran';
  const indeksStatusAktif = statusSistem.findIndex(s => s.key === statusAman);

  return (
    <div className="page-wrap min-h-screen text-left">
      <div className="mb-6">
        <Link to="/menu" className="text-brand-brown-light font-medium hover:text-brand-orange text-xs flex items-center gap-1.5">
          <ChevronLeft className="w-4 h-4" /> Kembali ke Menu
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <p className="text-brand-orange font-semibold text-xs uppercase tracking-wider">Lacak Pesanan</p>
          <h1 className="page-title mt-1">Pesanan #{pesanan?.id || id}</h1>
        </div>
        <span className="bg-brand-orange-light text-brand-orange font-bold px-4 py-2 rounded-full text-xs uppercase">
          {statusAman.replace('_', ' ')}
        </span>
      </div>

      {/* STEPPER PROGRESS TRACKING */}
      <div className="border border-slate-200/50 shadow-md bg-white rounded-2xl p-8 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">
          {statusSistem.map((lang, index) => {
            const IconComp = lang.icon;
            const isCompleted = index < indeksStatusAktif;
            const isActive = index === indeksStatusAktif;

            return (
              <div 
                key={lang.key} 
                className={`stepper-item ${
                  isCompleted ? 'completed text-brand-orange' : isActive ? 'active text-brand-orange' : 'text-slate-400'
                }`}
              >
                <div 
                  className={`stepper-icon w-12 h-12 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-100' 
                      : isActive 
                        ? 'bg-white border-pink-500 text-brand-orange ring-4 ring-pink-100' 
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs mt-3 text-slate-800">{lang.label}</h4>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[120px] text-center hidden md:block">
                  {lang.deskripsi}
                </p>
              </div>
            );
          })}
        </div>

        {/* Skenario Khusus Pesanan Dibatalkan */}
        {pesanan.status === 'dibatalkan' && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center">
            ⚠️ Pesanan ini telah Dibatalkan oleh Admin. Silakan hubungi pemilik UMKM untuk informasi lebih lanjut.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Kolom Kiri: Intruksi Pembayaran & Upload */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Instruksi Transfer & Scan QRIS */}
          {pesanan.status === 'menunggu_pembayaran' && pesanan.metode_pembayaran !== 'midtrans' && (
            <div className="border border-pink-200/50 shadow-md bg-white rounded-2xl p-6 text-left">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5 mb-4">
                <QrCode className="w-5 h-5 text-brand-orange" />
                Instruksi Transfer Pembayaran
              </h3>
              
              {pesanan.metode_pembayaran === 'transfer_bank' ? (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Silakan lakukan transfer ke salah satu rekening Bank resmi milik UMKM Vipizza Homemade Padang berikut:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Rekening BNI */}
                    <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-1 relative bg-slate-50">
                      <span className="font-bold text-xs text-orange-600 block">BANK BNI</span>
                      <span className="font-extrabold text-slate-800 text-base">0788-210-535</span>
                      <span className="text-[10px] text-slate-400">a.n. ANNISA NADYA PUTRI</span>
                      <button 
                        type="button"
                        className="absolute top-3 right-3 text-slate-500 hover:text-brand-orange p-1 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
                        onClick={() => salinRekening("0788210535")}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Rekening BSI */}
                    <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-1 relative bg-slate-50">
                      <span className="font-bold text-xs text-emerald-600 block">BANK BSI</span>
                      <span className="font-extrabold text-slate-800 text-base">717-432-7577</span>
                      <span className="text-[10px] text-slate-400">a.n. ANNISA NADYA PUTRI</span>
                      <button 
                        type="button"
                        className="absolute top-3 right-3 text-slate-500 hover:text-brand-orange p-1 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
                        onClick={() => salinRekening("7174327577")}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Rekening BRI */}
                    <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-1 relative bg-slate-50">
                      <span className="font-bold text-xs text-blue-600 block">BANK BRI</span>
                      <span className="font-extrabold text-slate-800 text-base">0058-01-033074-53-4</span>
                      <span className="text-[10px] text-slate-400">a.n. ANNISA NADYA PUTRI</span>
                      <button 
                        type="button"
                        className="absolute top-3 right-3 text-slate-500 hover:text-brand-orange p-1 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
                        onClick={() => salinRekening("005801033074534")}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Scan QRIS
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  {/* Mock QR Code */}
                  <div className="w-40 h-40 border-4 border-slate-200 p-2 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-inner relative z-10">
                    <div className="w-full h-full bg-slate-100 rounded-xl flex flex-col items-center justify-center text-[10px] text-slate-400 font-bold gap-1">
                      <span className="text-3xl select-none">🔲</span>
                      <span>QRIS DUKUNG UMKM</span>
                      <span className="text-brand-orange text-[8px] uppercase">Vipizza Padang</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2 text-left">
                    <span className="font-bold text-xs text-slate-700">Scan QRIS UMKM</span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Arahkan kamera e-wallet Anda (Gopay, OVO, Dana, LinkAja, atau Mobile Banking) ke kode QRIS di samping.
                    </p>
                    <span className="text-brand-orange font-extrabold text-xs bg-pink-50 px-3 py-1.5 rounded self-start mt-1 border border-pink-100">
                      Total tagihan: Rp {pesanan.total_harga.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instruksi Menunggu Pembayaran Midtrans */}
          {pesanan.status === 'menunggu_pembayaran' && pesanan.metode_pembayaran === 'midtrans' && (
            <div className="border border-brand-orange/30 shadow-md bg-brand-orange-light/10 rounded-2xl p-6 text-left">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5 mb-3">
                <Hourglass className="w-5 h-5 text-brand-orange animate-pulse" />
                Menunggu Pembayaran (Midtrans)
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Pembayaran Anda diproses secara otomatis melalui gerbang pembayaran Midtrans. 
                Anda bisa membayar menggunakan <b>GoPay, ShopeePay, Virtual Account (BCA/Mandiri/BNI/dll), atau QRIS</b>.
              </p>
              
              {pesanan.snap_token || snapTokenAktif ? (
                <div className="flex flex-col gap-3 items-start">
                  <p className="text-xs text-slate-600 font-medium">Klik tombol di bawah ini untuk memunculkan kembali jendela pembayaran:</p>
                  <div className="flex flex-col gap-3 items-start">
                    <button 
                      onClick={handleLanjutkanBayar}
                      className="bg-brand-orange hover:bg-orange-600 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 cursor-pointer"
                    >
                      Lanjutkan Pembayaran
                    </button>
                    
                    <button
                      onClick={handleCekStatusPembayaran}
                      disabled={verifikasiLoading}
                      className="text-xs text-slate-500 hover:text-brand-orange underline cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                      {verifikasiLoading ? '⏳ Memeriksa status...' : '🔄 Cek status pembayaran'}
                    </button>

                    {/* Tombol Refresh Token jika expired */}
                    <button
                      onClick={handleRefreshToken}
                      disabled={isRefreshingToken}
                      className="text-xs text-slate-500 hover:text-brand-orange underline cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                      {isRefreshingToken ? '⏳ Memperbarui token...' : '🔄 Token kadaluarsa? Klik di sini untuk perbarui'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">💡 Tips:</p>
                  <p className="text-xs text-slate-600 font-medium">Pesanan ini disimpan secara lokal dan belum terhubung ke sistem pembayaran Midtrans.</p>
                  <p className="text-xs text-slate-500">Silakan coba lagi dengan akun yang sudah terdaftar di server:</p>
                  <Link to="/menu" className="bg-brand-orange hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs text-center transition-all cursor-pointer self-start">
                    Pesan Ulang dari Menu
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Form Unggah Bukti Bayar (Hanya untuk Non-Midtrans/Legacy) */}
          {(pesanan.status === 'menunggu_pembayaran' || pesanan.status === 'menunggu_validasi') && pesanan.metode_pembayaran !== 'midtrans' && (
            <div className="border border-slate-200/50 shadow-md bg-white rounded-2xl p-6 text-left">
              <form onSubmit={handleUploadBukti} className="flex flex-col gap-4">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
                  <Upload className="w-5 h-5 text-brand-orange" />
                  Unggah Bukti Transaksi
                </h3>
                
                {pesanan.status === 'menunggu_validasi' ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl leading-relaxed">
                    💡 Anda sudah mengunggah bukti pembayaran. Admin sedang memverifikasi transaksi Anda secara manual. Anda dapat memperbarui unggahan jika salah kirim.
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 leading-relaxed -mt-2">
                    Setelah melakukan transfer atau pemindaian QRIS, silakan screenshot/foto bukti transfer Anda dan unggah di bawah ini agar pesanan bisa diproses oleh Admin.
                  </p>
                )}

                {/* Input File */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors duration-200 cursor-pointer relative group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  
                  {buktiPreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-32 h-32 rounded-xl overflow-hidden shadow-md border-2 border-white ring-4 ring-pink-100">
                        <img src={buktiPreview} alt="Preview Bukti" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-brand-orange">Klik / Seret untuk mengganti foto</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-brand-orange">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm text-slate-700">Pilih Foto Bukti</span>
                      <span className="text-[10px] text-slate-400">Format PNG, JPG atau JPEG maks 5MB</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nama Bank / E-Wallet</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Bank BCA, Mandiri, Gopay, OVO..."
                      value={namaBank}
                      onChange={(e) => setNamaBank(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nama Pengirim</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Budi Santoso..."
                      value={namaPengirim}
                      onChange={(e) => setNamaPengirim(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={prosesUpload}
                  className="btn-primary font-extrabold rounded-full py-3 px-6 shadow-lg shadow-pink-200 w-full mt-2 transition-colors cursor-pointer flex items-center justify-center"
                >
                  {prosesUpload ? "Mengunggah..." : pesanan.status === 'menunggu_validasi' ? "Perbarui Bukti Pembayaran" : "Kirim Bukti Pembayaran"}
                </button>

              </form>
            </div>
          )}

          {/* Info Tambahan */}
          {pesanan.status === 'diproses' && (
            <div className="border border-emerald-100 shadow-md bg-white rounded-2xl p-6 text-left flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl shrink-0 text-emerald-600 select-none">
                🔥
              </div>
              <div className="flex flex-col gap-1.5">
                <h4 className="font-extrabold text-emerald-800 text-base">Pizza Anda Sedang Dipanggang!</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bukti pembayaran Anda valid! Dapur Vipizza Homemade Padang sedang memanggang adonan pizza Anda dengan suhu optimal. Mohon tunggu, aromanya sangat lezat!
                </p>
              </div>
            </div>
          )}

          {pesanan.status === 'dikirim' && (
            <div className="border border-pink-100 shadow-md bg-white rounded-2xl p-6 text-left flex items-start gap-4">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-brand-orange shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h4 className="font-extrabold text-pink-700 text-base">Pesanan Sedang Diantarkan!</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pemilik UMKM sedang meluncur ke alamat Anda di wilayah Kota Padang menggunakan pengantaran mandiri kami. Harap aktifkan nomor telepon Anda untuk kemudahan koordinasi.
                </p>
              </div>
            </div>
          )}

          {pesanan.status === 'selesai' && (
            <div className="border-2 border-brand-orange shadow-lg bg-orange-50 rounded-2xl p-6 text-left flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden animate-in zoom-in duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange rounded-full opacity-10 -mr-10 -mt-10"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-brand-orange to-orange-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg text-3xl">
                🍕
              </div>
              <div className="flex flex-col gap-2 flex-1 z-10">
                <h4 className="font-black text-brand-orange text-lg uppercase tracking-wider drop-shadow-sm">Pesanan Selesai Terkirim!</h4>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  Terima kasih telah memesan pizza rumahan di Vipizza! Dukungan Anda sangat berarti bagi UMKM kami. 
                  <br/><br/>
                  <span className="font-bold text-brand-orange text-base bg-orange-100 px-2 py-0.5 rounded">Bantu kami menjadi lebih baik! 👇</span> 
                  <br/>Yuk, bagikan pengalaman rasa Anda dengan memberikan bintang dan ulasan pada daftar pesanan Anda!
                </p>
              </div>
            </div>
          )}

          {pesanan.status === 'dibatalkan' && (
            <div className="border border-red-200 shadow-md bg-red-500/5 rounded-2xl p-6 text-left flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                <X className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h4 className="font-extrabold text-red-800 text-base">Pesanan Dibatalkan / Ditolak</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Mohon maaf, bukti pembayaran atau transaksi pesanan Anda telah ditolak atau dibatalkan oleh Admin.
                </p>
                {pesanan.catatan_penolakan && (
                  <div className="mt-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-750">
                    <span className="font-extrabold block text-red-800 mb-0.5">Alasan Penolakan:</span>
                    <span>{pesanan.catatan_penolakan}</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Kolom Kanan: Rincian Belanja & Pengiriman */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Ringkasan Belanja */}
          <div className="border border-slate-200/50 shadow-md bg-white rounded-2xl p-6 text-left">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Detail Menu Dipesan</h3>
            
            <div className="flex flex-col gap-3">
              {(pesanan?.items || []).map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-sm">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-sm">{item.menu_nama || 'Pizza'}</span>
                    <span className="text-xs text-slate-400 mt-0.5">{(item.jumlah || 1)} porsi x Rp {(item.harga || 0).toLocaleString('id-ID')}</span>
                    {item.catatan && (
                      <span className="text-[10px] text-pink-650 bg-pink-50 border border-pink-100 rounded px-1.5 py-0.5 self-start mt-1 font-medium">
                        ✏️ Catatan: {item.catatan}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-slate-700 text-sm">
                      Rp {((item.jumlah || 1) * (item.harga || 0)).toLocaleString('id-ID')}
                    </span>
                    {pesanan.status === 'selesai' && (
                      ulasanSelesai.includes(item.menu_id) ? (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded font-bold cursor-default">
                          ✅ Diulas
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setMenuUlasanTerpilih(item);
                            setModalUlasanBuka(true);
                          }}
                          className="text-[10px] text-brand-orange border border-brand-orange hover:bg-brand-orange hover:text-white transition-colors px-2 py-1 rounded cursor-pointer font-bold"
                        >
                          ⭐ Beri Ulasan
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px bg-slate-100 my-4" />

            <div className="flex flex-col gap-2.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Metode Bayar</span>
                <span className="font-semibold text-slate-700 uppercase">
                  {(pesanan?.metode_pembayaran || 'transfer_bank').replace('_', ' ')}
                </span>
              </div>
              {pesanan?.nama_bank && (
                <div className="flex justify-between">
                  <span>Nama Bank/E-Wallet</span>
                  <span className="font-semibold text-slate-700">{pesanan.nama_bank}</span>
                </div>
              )}
              {pesanan?.nama_pengirim && (
                <div className="flex justify-between">
                  <span>Nama Pengirim</span>
                  <span className="font-semibold text-slate-700">{pesanan.nama_pengirim}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tanggal Transaksi</span>
                <span className="font-semibold text-slate-700">
                  {new Date(pesanan?.tanggal_pesanan || new Date()).toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })} WIB
                  </span>
              </div>
              <div className="flex justify-between items-end mt-4 pt-2 border-t border-slate-50">
                <span className="font-bold text-slate-800 text-xs">Total Bayar (Termasuk Ongkir)</span>
                <span className="font-extrabold text-lg text-brand-orange">
                  Rp {(pesanan?.total_harga || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Alamat Pengiriman */}
          <div className="border border-slate-200/50 shadow-md bg-white rounded-2xl p-6 text-left">
            <h3 className="font-bold text-slate-800 text-lg mb-3">Alamat Pengiriman</h3>
            
            <div className="text-xs text-slate-600 flex flex-col gap-2 leading-relaxed">
              <div>
                <span className="block font-bold text-slate-700">No. Telepon / WhatsApp:</span>
                <span>{pesanan.telepon}</span>
              </div>
              <div className="mt-1">
                <span className="block font-bold text-slate-700">Lokasi Tujuan:</span>
                <span className="block mt-1 text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-150">
                  {pesanan.alamat_pengiriman}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Modal Ulasan */}
      {modalUlasanBuka && menuUlasanTerpilih && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-800">
            <div className="p-5 flex justify-between items-center border-b border-gray-100">
              <h3 className="font-black text-lg">Beri Ulasan Produk</h3>
              <button onClick={() => setModalUlasanBuka(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleKirimUlasan} className="p-6 flex flex-col gap-4 text-left">
              <div className="mb-2">
                <span className="text-xs text-slate-500">Produk yang diulas:</span>
                <h4 className="font-bold text-sm text-brand-orange">{menuUlasanTerpilih.menu_nama}</h4>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2">Berapa Bintang? ⭐</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star} type="button"
                      onClick={() => setRatingUlasan(star)}
                      className={`transition-transform hover:scale-110 ${ratingUlasan >= star ? 'text-amber-400' : 'text-gray-200'} cursor-pointer`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Komentar (Opsional)</label>
                <textarea
                  rows="3"
                  value={komentarUlasan} onChange={e => setKomentarUlasan(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-brand-orange text-sm resize-none"
                  placeholder="Ceritakan pengalaman Anda mengenai produk ini..."
                />
              </div>
              
              <button
                type="submit"
                disabled={loadingUlasan}
                className="w-full mt-2 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 shadow-md bg-brand-orange disabled:opacity-50"
              >
                {loadingUlasan ? "Mengirim..." : "Kirim Ulasan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
