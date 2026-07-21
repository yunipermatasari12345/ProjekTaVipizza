import React, { useState, useEffect } from 'react';
import PageHero from '../components/layout/PageHero';
import { useAuth } from '../context/AuthContext';
import { MapPin, Phone, Mail, Send, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Kontak() {
  const { user, token } = useAuth();
  const [nama, setNama]           = useState(user?.nama || '');
  const [email, setEmail]         = useState(user?.email || '');
  const [pertanyaan, setPertanyaan] = useState('');
  const [loading, setLoading]     = useState(false);
  const [riwayatPesan, setRiwayatPesan] = useState([]);

  // Ambil riwayat pesan dari backend atau localStorage
  useEffect(() => {
    // Update field jika user login
    if (user) {
      setNama(user.nama || '');
      setEmail(user.email || '');
    }
    muatRiwayat();
    
    // Auto-refresh (Polling) setiap 5 detik
    const interval = setInterval(() => {
      muatRiwayat();
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const muatRiwayat = () => {
    // Coba ambil dari backend dulu
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    fetch('https://optimum-setting-incidence-barn.trycloudflare.com/api/pesan-pelanggan', { headers })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Filter hanya pesan dari pengguna ini (berdasarkan email)
          const milikSaya = data.filter(p => p.email === (user?.email || email));
          setRiwayatPesan(milikSaya);
        } else {
          // Fallback localStorage
          const local = JSON.parse(localStorage.getItem('vipizza_pesan_kontak') || '[]');
          const milikSaya = local.filter(p => p.email === (user?.email || email));
          setRiwayatPesan(milikSaya);
        }
      })
      .catch(() => {
        const local = JSON.parse(localStorage.getItem('vipizza_pesan_kontak') || '[]');
        const milikSaya = local.filter(p => p.email === (user?.email || email));
        setRiwayatPesan(milikSaya);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama || !email || !pertanyaan) {
      Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Mohon isi semua field!' });
      return;
    }

    setLoading(true);
    const pesanBaru = {
      id: Date.now(),
      nama, email, pertanyaan,
      pengguna_id: user?.id || null,
      balasan: null,
      waktu: new Date().toISOString(),
    };

    // Coba kirim ke backend
    try {
      const res = await fetch('https://optimum-setting-incidence-barn.trycloudflare.com/api/pesan-pelanggan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ nama, email, pertanyaan, pengguna_id: user?.id || null }),
      });
      if (res.ok) {
        const saved = await res.json();
        pesanBaru.id = saved.id || pesanBaru.id;
      }
    } catch { /* simpan ke localStorage sebagai fallback */ }

    // Simpan ke localStorage
    const semuaPesan = JSON.parse(localStorage.getItem('vipizza_pesan_kontak') || '[]');
    semuaPesan.push(pesanBaru);
    localStorage.setItem('vipizza_pesan_kontak', JSON.stringify(semuaPesan));

    setLoading(false);
    setPertanyaan('');
    Swal.fire({ icon: 'success', title: 'Terkirim!', text: 'Pertanyaan Anda telah dikirim. Admin akan membalas segera.', timer: 2500, showConfirmButton: false });
    muatRiwayat();
  };

  const faq = [
    { q: 'Bagaimana cara memesan pizza?', a: 'Daftar akun, pilih menu di halaman Menu, tambahkan ke keranjang, lalu checkout.' },
    { q: 'Metode pembayaran apa saja?', a: 'Transfer bank dan QRIS. Upload bukti pembayaran setelah checkout.' },
    { q: 'Area pengantaran?', a: 'Seluruh wilayah Kota Padang. Ongkir disesuaikan jarak alamat.' },
  ];

  return (
    <div>


      <section className="py-12 bg-[#f8f9fa]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Info kontak */}
          <div>
            <h2 className="text-xl font-bold text-[#212529] mb-6">Hubungi Kami</h2>
            <div className="space-y-4">
              {[
                { icon: MapPin, label: 'Alamat', value: 'Komplek Taruko I Blok L No. 29, Korong Gadang, Kec. Kuranji, Kota Padang' },
                { icon: Phone, label: 'Telepon / WhatsApp', value: '0823-4567-8901' },
                { icon: Mail, label: 'Email', value: 'info@vipizza.com' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 card-bs p-4">
                  <Icon className="w-5 h-5 text-[#0b5345] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[#212529]">{label}</p>
                    <p className="text-sm text-[#6c757d] mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="font-bold text-[#212529] mb-4">FAQ</h3>
              <div className="space-y-3">
                {faq.map(({ q, a }) => (
                  <div key={q} className="card-bs p-4">
                    <p className="font-semibold text-sm text-[#212529]">{q}</p>
                    <p className="text-xs text-[#6c757d] mt-1 leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Riwayat Pesan Saya */}
            {riwayatPesan.length > 0 && (
              <div className="mt-8">
                <h3 className="font-bold text-[#212529] mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#0b5345]" />
                  Riwayat Pertanyaan Saya
                </h3>
                <div className="space-y-4">
                  {riwayatPesan.map((pesan) => (
                    <div key={pesan.id} className="card-bs p-4 border-l-4 border-[#0b5345]">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-[#212529] leading-relaxed">{pesan.pertanyaan}</p>
                        <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-[#6c757d]">
                          <Clock className="w-3 h-3" />
                          {new Date(pesan.waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      {pesan.balasan ? (
                        <div className="mt-3 bg-[#e8f5f2] border border-[#0b5345]/20 rounded-lg p-3 flex gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#0b5345] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold text-[#0b5345] mb-0.5">Balasan Admin:</p>
                            <p className="text-xs text-[#212529] leading-relaxed">{pesan.balasan}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-600 font-semibold">
                          <Clock className="w-3 h-3" />
                          Menunggu balasan admin...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form pertanyaan */}
          <div className="card-bs p-6">
            <h2 className="text-xl font-bold text-[#212529] mb-1">Kirim Pertanyaan</h2>
            <p className="text-[#6c757d] text-xs mb-6">Isi form di bawah untuk menghubungi admin Vipizza</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-[#212529] block mb-1">Nama</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="input-bs"
                  placeholder="Nama lengkap"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#212529] block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-bs"
                  placeholder="email@contoh.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#212529] block mb-1">Pertanyaan</label>
                <textarea
                  value={pertanyaan}
                  onChange={(e) => setPertanyaan(e.target.value)}
                  rows={4}
                  className="input-bs resize-none"
                  placeholder="Tulis pertanyaan Anda..."
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2 py-2.5">
                <Send className="w-4 h-4" />
                {loading ? 'Mengirim...' : 'Kirim Pertanyaan'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

